import {RTM_EVENTS} from '@slack/client';

/**
 * users: {
 *    <userId>: {
 *      name: '',
 *      team_id: ''.
 *      status: null,
 *      email: '',
 *      real_name: '',
 *      prefs: {},
 *      presence: '',
 *      is_admin: false,
 *      is_primary_owner: false,
 *      is_restricted: false,
 *      is_ultra_restricted: false,
 *      is_bot: false
 *    },
 *    ...
 * }
 */

export default function reduce(state = {}, action) {
  switch (action.type) {
  case RTM_EVENTS.USER_CHANGE:
  case RTM_EVENTS.TEAM_JOIN:
    return addOrUpdateUser(state, action.message);
  case RTM_EVENTS.PREF_CHANGE:
    return changePreference(state, action.message, action.userId);
  case RTM_EVENTS.PRESENCE_CHANGE:
    return changePresence(state, action.message, action.message.user);
  case RTM_EVENTS.MANUAL_PRESENCE_CHANGE:
    return changePresence(state, action.message, action.userId);
  default:
    return state;
  }
}

function addOrUpdateUser(state, {user}) {
  let existingUser = state[user.id];

  return {
    ...state,
    [user.id]: {
      ...existingUser,
      ...user
    }
  };
}

function changePreference(state, {name, value}, userId) {
  let user = state[userId];

  return {
    ...state,
    [user.id]: {
      ...user,
      prefs: {
        ...user.prefs,
        [name]: value
      }
    }
  };
}

function changePresence(state, {presence}, userId) {
  let user = state[userId];

  return {
    ...state,
    [user.id]: {
      ...user,
      presence
    }
  };
}
