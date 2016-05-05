import {find, reduce} from 'lodash';
import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';
import actionForMessage from './actions';

import * as reducers from './reducers';

export default class SlackReduxStore {

  /**
   * Create the store and use the `rtm.start` response to hydrate it.
   *
   * @param  {Object} payload The full rtm.start response
   */
  cacheRtmStart(payload) {
    this.store = createStore(
      combineReducers(reducers.default),
      this.getInitialStateFromRtmStart(payload),
      applyMiddleware(thunkMiddleware)
    );
  }

  /**
   * Transforms the `rtm.start` response from arrays to keyed objects. The
   * overall shape of the state tree looks like:
   *
   * @example {
   *    users: {},
   *    channels: {},
   *    ims: {},
   *    groups: {},
   *    bots: {},
   *    self: {},
   *    teams: {}
   *  }
   */
  getInitialStateFromRtmStart(payload = {}) {
    let users = {};
    let channels = {};
    let ims = {};
    let groups = {};
    let bots = {};

    for (let user of payload.users || []) users[user.id] = user;
    for (let channel of payload.channels || []) channels[channel.id] = channel;
    for (let im of payload.ims || []) ims[im.id] = im;
    for (let group of payload.groups || []) groups[group.id] = group;
    for (let bot of payload.bots || []) bots[bot.id] = bot;

    let self = payload.self ? {
      ...users[payload.self.id],
      ...payload.self
    } : {};
      
    let teams = payload.team ? {
      [payload.team.id]: payload.team
    } : {};

    return {users, channels, ims, groups, bots, self, teams};
  }

  /**
   * Handles a real-time message by dispatching an action to the store.
   *
   * @param  {String} userId  The ID of the active user
   * @param  {String} teamId  The ID of the active team
   * @param  {String} type    The type of message
   * @param  {Object} message The message from the socket
   */
  handleRtmMessage(userId, teamId, type, message) {
    let action = actionForMessage(type, message, userId, teamId);
    this.store.dispatch(action);
  }

  subscribe(listener) {
    return this.store.subscribe(listener);
  }

  getState() {
    return this.store.getState();
  }

  getUserById(userId) {
    return this.getState().users[userId];
  }

  getUserByName(name) {
    return find(this.getState().users, (user) => user.name === name);
  }

  getUserByEmail(email) {
    return find(this.getState().users, (user) => user.email === email);
  }

  getChannelById(channelId) {
    return this.getState().channels[channelId];
  }

  getChannelByName(name) {
    return find(this.getState().channels, (channel) => channel.name === name);
  }

  getGroupById(groupId) {
    return this.getState().groups[groupId];
  }

  getGroupByName(name) {
    return find(this.getState().groups, (group) => group.name === name);
  }

  getDMById(dmId) {
    return this.getState().ims[dmId];
  }

  getDMByName(name) {
    return find(this.getState().ims, (dm) => dm.name === name);
  }

  getBotById(botId) {
    return this.getState().bots[botId];
  }

  getBotByName(name) {
    return find(this.getState().bots, (bot) => bot.name === name);
  }

  getTeamById(teamId) {
    return this.getState().teams[teamId];
  }

  getUnreadCount() {
    let getUnreads = (collection) =>
      reduce(collection, (total, c) => total + c.unread_count, 0);

    return getUnreads(this.getState().channels) +
      getUnreads(this.getState().ims) +
      getUnreads(this.getState().groups);
  }

  getChannelGroupOrDMById(objId) {
    let ret;
    let firstChar = objId.substring(0, 1);

    if (firstChar === 'C') {
      ret = this.getChannelById(objId);
    } else if (firstChar === 'G') {
      ret = this.getGroupById(objId);
    } else if (firstChar === 'D') {
      ret = this.getDMById(objId);
    }

    return ret;
  }

  getChannelOrGroupByName(name) {
    let channel = this.getChannelByName(name);
    return channel || this.getGroupByName(name);
  }
}
