import {RTM_EVENTS} from '@slack/client';

export default function reduce(state = {}, action) {
  let {type, message} = action;

  switch (type) {
  case RTM_EVENTS.BOT_ADDED:
  case RTM_EVENTS.BOT_CHANGED:
    return addOrUpdateBot(state, message);
  default:
    return state;
  }
}

function addOrUpdateBot(state, {bot}) {
  let existingBot = state[bot.id];

  return {
    ...state,
    [bot.id]: {
      ...existingBot,
      ...bot
    }
  };
}
