import {actionTypeWithSubtype, actionNeedsSelfParameters} from '../reducers/utils';
import {RTM_EVENTS} from '@slack/client';

export const USER_TYPING_TIMEOUT = 3000;

/**
 * Creates an action for a real-time message from the socket, based on its
 * type and subtype, if applicable.
 *
 * @param  {String} type    The type of message
 * @param  {Object} message The message from the socket
 * @param  {String} userId  The ID of the active user
 * @param  {String} teamId  The ID of the active team
 * 
 * @return {Object}         The created action
 */
export default function actionForMessage(type, message, userId, teamId) {
  let asyncAction = asyncActionForType(type, message);
  if (asyncAction) return asyncAction;

  let action = {
    message,
    type: type === RTM_EVENTS.MESSAGE ?
      actionTypeWithSubtype(message.subtype) :
      type
  };

  return actionNeedsSelfParameters(type) ?
    { ...action, userId, teamId } :
    action;
}

function asyncActionForType(type, message) {
  switch (type) {
  case RTM_EVENTS.USER_TYPING:
    return (dispatch) => {
      dispatch({ type, message, isTyping: true });
      
      setTimeout(() => {
        dispatch({ type, message, isTyping: false });
      }, USER_TYPING_TIMEOUT);
    };
  default:
    return null;
  }
}
