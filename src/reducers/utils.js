import {RTM_EVENTS} from '@slack/client';

export const DEFAULT_MESSAGE_ACTION = 'rtm_client_add_message';

const SELF_PARAMETERS_REQUIRED = [RTM_EVENTS.CHANNEL_LEFT, RTM_EVENTS.GROUP_LEFT,
  RTM_EVENTS.PREF_CHANGE, RTM_EVENTS.MANUAL_PRESENCE_CHANGE, RTM_EVENTS.TEAM_PREF_CHANGE,
  RTM_EVENTS.TEAM_DOMAIN_CHANGE, RTM_EVENTS.TEAM_RENAME];

const MESSAGE_REDUCER_TYPES = [RTM_EVENTS.CHANNEL_MARKED,
  RTM_EVENTS.REACTION_ADDED, RTM_EVENTS.REACTION_REMOVED];

export function actionTypeWithSubtype(subtype, delim) {
  return [RTM_EVENTS.MESSAGE, subtype || DEFAULT_MESSAGE_ACTION].join(delim || '::');
}

export function subtypeFromActionType(type, delim) {
  let parts = type.split(delim || '::');
  return parts.length === 2 ? parts[1] : null;
}

export function actionNeedsSelfParameters(type) {
  return SELF_PARAMETERS_REQUIRED.indexOf(type) !== -1;
}

export function isHandledByMessagesReducer(type) {
  return type.startsWith(RTM_EVENTS.MESSAGE) ||
    MESSAGE_REDUCER_TYPES.indexOf(type) !== -1;
}
