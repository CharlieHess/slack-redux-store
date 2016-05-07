import {RTM_EVENTS} from '@slack/client';
import {RTM_START, populateFromRtmStart} from './helpers';

export default function reduce(state = {}, action) {
  let {type, message} = action;

  switch (type) {
  case RTM_START:
    return populateFromRtmStart(state, action.data.bots);
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
