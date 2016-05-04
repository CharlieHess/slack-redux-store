'use strict';

const lodash = require('lodash');
const expect = require('chai').expect;
const deepFreeze = require('deep-freeze');
const reduce = require('../src/reducers/users-reducer').default;

const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const fixtures = require('./fixtures');
const getRtmMessage = fixtures.getRtmMessage;
const testUserId = fixtures.testUserId;

const initialState = {
  [testUserId]: {
    id: testUserId,
    name: 'charlie',
    prefs: {
      display_real_names_override: 0
    }
  }
};

describe('the users reducer', () => {
  it('adds or modifies users', () => {
    let action = {
      type: RTM_EVENTS.USER_CHANGE,
      message: getRtmMessage(RTM_EVENTS.USER_CHANGE)
    };

    let state = {};
    deepFreeze(state);
    state = reduce(state, action);

    let userId = action.message.user.id;
    let userName = action.message.user.name;

    expect(state).to.have.keys(userId);
    expect(state[userId].name).to.equal(userName);

    action.message.user.name = 'nega-charlie';

    state = reduce(state, action);

    expect(state).to.have.keys(testUserId);
    expect(state[userId].name).to.equal('nega-charlie');
  });

  it('updates user preferences', () => {
    let action = {
      userId: testUserId,
      type: RTM_EVENTS.PREF_CHANGE,
      message: getRtmMessage(RTM_EVENTS.PREF_CHANGE)
    };

    let state = lodash.cloneDeep(initialState);
    deepFreeze(state);
    state = reduce(state, action);

    expect(state).to.have.keys(testUserId);
    expect(state[testUserId].prefs.display_real_names_override).to.equal(1);
  });

  it('handles presence changes', () => {
    let action = {
      type: RTM_EVENTS.PRESENCE_CHANGE,
      message: getRtmMessage(RTM_EVENTS.PRESENCE_CHANGE)
    };

    let state = lodash.cloneDeep(initialState);
    deepFreeze(state);
    state = reduce(state, action);

    expect(state).to.have.keys(testUserId);
    expect(state[testUserId].presence).to.equal('away');

    action = {
      userId: testUserId,
      type: RTM_EVENTS.MANUAL_PRESENCE_CHANGE,
      message: getRtmMessage(RTM_EVENTS.MANUAL_PRESENCE_CHANGE)
    };

    state = reduce(state, action);

    expect(state).to.have.keys(testUserId);
    expect(state[testUserId].presence).to.equal('online');
  });
});
