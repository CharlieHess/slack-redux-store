import {find, reduce} from 'lodash';
import {createStore, combineReducers, applyMiddleware, compose} from 'redux';
import {RTM_START} from './reducers/helpers';
import thunkMiddleware from 'redux-thunk';
import actionForMessage from './actions';

import * as reducers from './reducers';

export default class SlackReduxStore {

  /**
   * Creates a new instance of `SlackReduxStore`.
   *
   * @param  {Array} storeEnhancers An array of store enhancers to apply
   */
  constructor(storeEnhancers = []) {
    let initialState = {};
    let toCompose = [
      applyMiddleware(thunkMiddleware),
      ...storeEnhancers
    ];

    this.store = createStore(
      combineReducers(reducers.default),
      initialState,
      compose(...toCompose)
    );
  }

  /**
   * Hydrates the store with the `rtm.start` response.
   *
   * @param  {Object} payload The full `rtm.start` response
   */
  cacheRtmStart(payload) {
    this.dispatch({
      type: RTM_START,
      data: payload
    });
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
    this.dispatch(action);
  }

  /**
   * Dispatches an action to the underlying store.
   *
   * @param  {Object} action The action to dispatch
   */
  dispatch(action) {
    this.store.dispatch(action);
  }

  /**
   * Subscribes a listener to state changes from the store.
   *
   * @param  {Function} listener The listener to subscribe
   * @return {Function}          A method that will unsubscribe it
   */
  subscribe(listener) {
    return this.store.subscribe(listener);
  }

  /**
   * Returns the current state of the store.
   *
   * @return {Object}  The state tree
   */
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
