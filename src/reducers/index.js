import usersReducer from './users-reducer';
import channelsReducer from './channels-reducer';
import imsReducer from './ims-reducer';
import groupsReducer from './groups-reducer';
import botsReducer from './bots-reducer';
import selfReducer from './self-reducer';
import teamsReducer from './teams-reducer';

export default {
  users: usersReducer,
  channels: channelsReducer,
  ims: imsReducer,
  groups: groupsReducer,
  bots: botsReducer,
  self: selfReducer,
  teams: teamsReducer
};
