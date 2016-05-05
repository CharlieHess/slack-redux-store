import {omit} from 'lodash';
import {RTM_EVENTS} from '@slack/client';
import {addOrUpdateChannel, leaveChannel, archiveChannel, userIsTyping} from './channel-helpers';
import {isHandledByMessagesReducer} from './utils';
import messagesReducer from './messages-reducer';

/**
 * channels: {
 *    <channelId>: {
 *      messages: {
 *        <messageTs>: {},
 *        <messageTs>: {},
 *        ...
 *      }
 *      name: '',
 *      latest: {},
 *      unread_count: 0,
 *      last_read: '0000000000.000000',
 *      max_ts: '0000000000.000000',
 *      members: [],
 *      topic: {},
 *      purpose: {}
 *    },
 *    ...
 * }
 */

export default function reduce(state = {}, action) {
  if (isHandledByMessagesReducer(action.type)) {
    return messagesReducer(state, action);
  }

  let {type, message} = action;

  switch (type) {
  case RTM_EVENTS.CHANNEL_CREATED:
  case RTM_EVENTS.CHANNEL_JOINED:
  case RTM_EVENTS.CHANNEL_RENAME:
    return addOrUpdateChannel(state, message);
  case RTM_EVENTS.CHANNEL_DELETED:
    return omit(state, message.channel);
  case RTM_EVENTS.CHANNEL_LEFT:
    return leaveChannel(state, message, action.userId);
  case RTM_EVENTS.CHANNEL_ARCHIVE:
    return archiveChannel(state, message, true);
  case RTM_EVENTS.CHANNEL_UNARCHIVE:
    return archiveChannel(state, message, false);
  case RTM_EVENTS.USER_TYPING:
    return userIsTyping(state, message, action.isTyping);
  case RTM_EVENTS.CHANNEL_HISTORY_CHANGED:
  default:
    return state;
  }
}
