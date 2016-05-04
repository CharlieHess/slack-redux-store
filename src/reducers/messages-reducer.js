import {omit, findIndex, forEachRight, without} from 'lodash';
import {RTM_EVENTS, RTM_MESSAGE_SUBTYPES} from '@slack/client';
import {DEFAULT_MESSAGE_ACTION, subtypeFromActionType} from './utils';

/**
 * Handles the messages subtree for channels, ims, and groups.
 *
 * @param  {Object} state    The starting state
 * @param  {String} {type    The type of message action
 * @param  {Object} message} The message object from the socket
 * @return {Object}          The modified state
 */
export default function reduce(state, {type, message}) {

  if (type.startsWith(RTM_EVENTS.MESSAGE)) {
    // Since this reducer is shared across channels, groups, and ims, we need to
    // first check that this message pertains to us.
    let channel = state[message.channel];
    if (!channel) return state;

    switch (subtypeFromActionType(type)) {
    case DEFAULT_MESSAGE_ACTION:
      return addMessage(state, message);
    case RTM_MESSAGE_SUBTYPES.MESSAGE_CHANGED:
      return editMessage(state, message);
    case RTM_MESSAGE_SUBTYPES.MESSAGE_DELETED:
      return deleteMessage(state, message);
    case RTM_MESSAGE_SUBTYPES.CHANNEL_JOIN:
      return joinChannelMessage(state, message);
    case RTM_MESSAGE_SUBTYPES.CHANNEL_LEAVE:
      return leaveChannelMessage(state, message);
    }
  }

  switch (type) {
  case RTM_EVENTS.CHANNEL_MARKED:
    return markChannel(state, message);
  case RTM_EVENTS.REACTION_ADDED:
    return addReaction(state, message);
  case RTM_EVENTS.REACTION_REMOVED:
    return removeReaction(state, message);
  default:
    return state;
  }
}

function addMessage(state, message) {
  let channel = state[message.channel];
  let isNewestMessage = message.ts > channel.max_ts && !message.hidden;

  return {
    ...state,
    [channel.id]: {
      ...channel,
      max_ts: isNewestMessage ? message.ts : channel.max_ts,
      unread_count: isNewestMessage ? channel.unread_count + 1 : channel.unread_count,
      messages: {
        ...channel.messages,
        [message.ts]: message
      }
    }
  };
}

function editMessage(state, message) {
  let channel = state[message.channel];
  let editedMessage = message.message;

  return {
    ...state,
    [channel.id]: {
      ...channel,
      messages: {
        ...channel.messages,
        [editedMessage.ts]: editedMessage,
        [message.ts]: message
      }
    }
  };
}

function deleteMessage(state, message) {
  let channel = state[message.channel];

  return {
    ...state,
    [channel.id]: {
      ...channel,
      messages: {
        ...omit(channel.messages, message.deleted_ts),
        [message.ts]: message
      }
    }
  };
}

function joinChannelMessage(state, message) {
  let channel = state[message.channel];

  return {
    ...state,
    [channel.id]: {
      ...channel,
      members: [
        ...channel.members,
        message.user
      ],
      messages: {
        ...channel.messages,
        [message.ts]: message
      }
    }
  };
}

function leaveChannelMessage(state, message) {
  let channel = state[message.channel];

  return {
    ...state,
    [channel.id]: {
      ...channel,
      members: [
        ...channel.members.slice(0, channel.members.indexOf(message.user)),
        ...channel.members.slice(channel.members.indexOf(message.user) + 1)
      ],
      messages: {
        ...channel.messages,
        [message.ts]: message
      }
    }
  };
}

function markChannel(state, message) {
  let channel = state[message.channel];
  if (!channel) return state;

  let unreadCount = 0;

  forEachRight(channel.messages, (m) => {
    if (m.ts > message.ts && !m.hidden) {
      unreadCount++;
      return true;
    }
    return false;
  });

  return {
    ...state,
    [channel.id]: {
      ...channel,
      last_read: message.ts,
      unread_count: unreadCount
    }
  };
}

function addReaction(state, {item, reaction, user}) {
  let channel = state[item.channel];
  if (!channel) return state;

  let message = channel.messages[item.ts];
  if (!message) return state;

  let reactionIndex = findIndex(message.reactions, { name: reaction });
  let reactionToAddOrIncrement;

  if (reactionIndex !== -1) {
    let existingReaction = message.reactions[reactionIndex];

    reactionToAddOrIncrement = {
      ...existingReaction,
      count: existingReaction.count + 1,
      users: [...existingReaction.users, user]
    };
  } else {
    reactionToAddOrIncrement = {
      name: reaction,
      users: [user],
      count: 1
    };
  }

  return {
    ...state,
    [channel.id]: {
      ...channel,
      messages: {
        ...channel.messages,
        [message.ts]: {
          ...message,
          reactions: [
            ...(message.reactions || []).slice(0, reactionIndex),
            reactionToAddOrIncrement,
            ...(message.reactions || []).slice(reactionIndex + 1)
          ]
        }
      }
    }
  };
}

function removeReaction(state, {item, reaction, user}) {
  let channel = state[item.channel];
  if (!channel) return state;

  let message = channel.messages[item.ts];
  if (!message) return state;

  let reactionIndex = findIndex(message.reactions, { name: reaction });
  if (reactionIndex === -1) return state;

  let existingReaction = message.reactions[reactionIndex];
  let reactionToRemoveOrDecrement = existingReaction.count > 1 ? [{
    ...existingReaction,
    count: existingReaction.count - 1,
    users: without(existingReaction.users, user)
  }] : [];

  return {
    ...state,
    [channel.id]: {
      ...channel,
      messages: {
        ...channel.messages,
        [message.ts]: {
          ...message,
          reactions: [
            ...message.reactions.slice(0, reactionIndex),
            ...reactionToRemoveOrDecrement,
            ...message.reactions.slice(reactionIndex + 1)
          ]
        }
      }
    }
  };
}
