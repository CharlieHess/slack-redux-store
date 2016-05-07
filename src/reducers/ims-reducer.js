import {RTM_EVENTS} from '@slack/client';
import {RTM_START, populateFromRtmStart, addOrUpdateChannel, userIsTyping} from './helpers';
import {isHandledByMessagesReducer} from './utils';
import messagesReducer from './messages-reducer';

export default function reduce(state = {}, action) {
  if (isHandledByMessagesReducer(action.type)) {
    return messagesReducer(state, action);
  }

  let {type, message} = action;

  switch (type) {
  case RTM_START:
    return populateFromRtmStart(state, action.data.ims);
  case RTM_EVENTS.IM_CREATED:
    return addOrUpdateChannel(state, message);
  case RTM_EVENTS.IM_OPEN:
    return setDmOpen(state, message, true);
  case RTM_EVENTS.IM_CLOSE:
    return setDmOpen(state, message, false);
  case RTM_EVENTS.USER_TYPING:
    return userIsTyping(state, message, action.isTyping);
  case RTM_EVENTS.IM_HISTORY_CHANGED:
  default:
    return state;
  }
}

function setDmOpen(state, {channel}, is_open) {
  let dm = state[channel];
  if (!dm) return state;

  return {
    ...state,
    [dm.id]: {
      ...dm,
      is_open
    }
  };
}
