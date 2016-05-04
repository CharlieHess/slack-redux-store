export function addOrUpdateChannel(state, {channel}) {
  let existingChannel = state[channel.id];

  return {
    ...state,
    [channel.id]: {
      ...existingChannel,
      ...channel
    }
  };
}

export function leaveChannel(state, message, userId) {
  let channel = state[message.channel];
  if (!channel) return state;

  return {
    ...state,
    [channel.id]: {
      ...channel,
      members: [
        ...channel.members.slice(0, channel.members.indexOf(userId)),
        ...channel.members.slice(channel.members.indexOf(userId) + 1)
      ],
      is_member: false
    }
  };
}

export function archiveChannel(state, message, is_archived) {
  let channel = state[message.channel];
  if (!channel) return state;

  return {
    ...state,
    [channel.id]: {
      ...channel,
      is_archived
    }
  };
}
