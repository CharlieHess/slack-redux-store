import {RTM_EVENTS} from '@slack/client';
import {RTM_START} from './helpers';

export default function reduce(state = {}, action) {
  let {type, message, teamId} = action;

  switch (type) {
  case RTM_START:
    return rtmStart(state, action.data.team);
  case RTM_EVENTS.TEAM_PREF_CHANGE:
    return changePreference(state, message, teamId);
  case RTM_EVENTS.TEAM_DOMAIN_CHANGE:
    return changeTeamDomain(state, message, teamId);
  case RTM_EVENTS.TEAM_RENAME:
    return renameTeam(state, message, teamId);
  default:
    return state;
  }
}

function rtmStart(state, team) {
  return team ? {
    ...state,
    [team.id]: team
  } : state;
}

function changePreference(state, {name, value}, teamId) {
  let team = state[teamId];

  return {
    ...state,
    [team.id]: {
      ...team,
      prefs: {
        ...team.prefs,
        [name]: value
      }
    }
  };
}

function changeTeamDomain(state, {domain, url}, teamId) {
  let team = state[teamId];

  return {
    ...state,
    [team.id]: {
      ...team,
      domain,
      url
    }
  };
}

function renameTeam(state, {name}, teamId) {
  let team = state[teamId];

  return {
    ...state,
    [team.id]: {
      ...team,
      name
    }
  };
}
