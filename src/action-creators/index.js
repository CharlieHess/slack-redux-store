import {actionTypeWithSubtype, actionNeedsSelfParameters} from '../reducers/utils';
import {RTM_EVENTS} from '@slack/client';

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
