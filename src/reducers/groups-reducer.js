import {RTM_EVENTS} from '@slack/client';
import {addOrUpdateChannel, leaveChannel, archiveChannel, userIsTyping} from './channel-helpers';
import {isHandledByMessagesReducer} from './utils';
import messagesReducer from './messages-reducer';

export default function reduce(state = {}, action) {
  if (isHandledByMessagesReducer(action.type)) {
    return messagesReducer(state, action);
  }

  let {type, message} = action;

  switch (type) {
  case RTM_EVENTS.GROUP_JOINED:
  case RTM_EVENTS.GROUP_RENAME:
    return addOrUpdateChannel(state, message);
  case RTM_EVENTS.GROUP_LEFT:
    return leaveChannel(state, message, action.userId);
  case RTM_EVENTS.GROUP_ARCHIVE:
    return archiveChannel(state, message, true);
  case RTM_EVENTS.GROUP_UNARCHIVE:
    return archiveChannel(state, message, false);
  case RTM_EVENTS.USER_TYPING:
    return userIsTyping(state, message, action.isTyping);
  case RTM_EVENTS.GROUP_OPEN:
  case RTM_EVENTS.GROUP_CLOSE:
  case RTM_EVENTS.GROUP_HISTORY_CHANGED:
  default:
    return state;
  }
}
