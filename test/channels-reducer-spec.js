'use strict';

const lodash = require('lodash');
const expect = require('chai').expect;
const deepFreeze = require('deep-freeze');
const reduce = require('../src/reducers/channels-reducer').default;
const actionTypeWithSubtype = require('../src/reducers/utils').actionTypeWithSubtype;

const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const fixtures = require('./fixtures');
const getRtmMessage = fixtures.getRtmMessage;
const initialState = fixtures.initialState;
const testUserId = fixtures.testUserId;
const testChannelId = fixtures.testChannelId;

describe('the channels reducer', () => {
  function makeMessageActionWithTimestamp(text, ts) {
    return {
      type: actionTypeWithSubtype(),
      message: {
        text, ts,
        type: 'message',
        channel: testChannelId,
      }
    };
  }

  it('adds channels', () => {
    let action = {
      type: RTM_EVENTS.CHANNEL_CREATED,
      message: getRtmMessage(RTM_EVENTS.CHANNEL_CREATED)
    };

    let state = {};
    deepFreeze(state);
    state = reduce(state, action);

    expect(state).to.be.ok;
    expect(state).to.have.keys(testChannelId);
  });

  it('deletes channels', () => {
    let action = {
      type: RTM_EVENTS.CHANNEL_DELETED,
      message: getRtmMessage(RTM_EVENTS.CHANNEL_DELETED)
    };

    let state = lodash.cloneDeep(initialState);
    deepFreeze(state);
    state = reduce(state, action);

    expect(state).to.be.ok;
    expect(state).to.be.empty;
  });

  it('updates existing channels', () => {
    let action = {
      type: RTM_EVENTS.CHANNEL_JOINED,
      message: getRtmMessage(RTM_EVENTS.CHANNEL_JOINED)
    };

    let state = lodash.cloneDeep(initialState);
    deepFreeze(state);
    state = reduce(state, action);

    let testChannel = state[testChannelId];
    let originalMessageTs = getRtmMessage(actionTypeWithSubtype()).ts;

    expect(state).to.have.keys(testChannelId);
    expect(testChannel.messages).to.have.keys(originalMessageTs);
    expect(testChannel).to.have.any.keys('creator', 'latest', 'topic', 'purpose');
  });

  it('renames channels', () => {
    let action = {
      type: RTM_EVENTS.CHANNEL_RENAME,
      message: getRtmMessage(RTM_EVENTS.CHANNEL_RENAME)
    };

    let state = lodash.cloneDeep(initialState);
    deepFreeze(state);
    state = reduce(state, action);

    let testChannel = state[testChannelId];
    expect(testChannel.name).to.equal('a-channel-by-any-other-name');
  });

  it('removes members when they leave', () => {
    let action = {
      type: RTM_EVENTS.CHANNEL_LEFT,
      message: getRtmMessage(RTM_EVENTS.CHANNEL_LEFT),
      userId: testUserId
    };

    let state = lodash.cloneDeep(initialState);
    state[testChannelId].members.push(testUserId);
    deepFreeze(state);
    state = reduce(state, action);

    let testChannel = state[testChannelId];

    expect(state).to.have.keys(testChannelId);
    expect(testChannel.members).to.be.empty;
  });

  it('keeps track of unread messages', () => {
    let state = lodash.cloneDeep(initialState);
    deepFreeze(state);

    let firstTs = '1500000000.000000';
    let secondTs = '1500000001.000001';
    let thirdTs = '1500000002.000002';

    let action = makeMessageActionWithTimestamp('Toy Story', firstTs);
    state = reduce(state, action);
    action = makeMessageActionWithTimestamp('The Incredibles', secondTs);
    state = reduce(state, action);
    action = makeMessageActionWithTimestamp('WALL-E', thirdTs);
    state = reduce(state, action);

    let testChannel = state[testChannelId];
    let originalMessageTs = getRtmMessage(actionTypeWithSubtype()).ts;

    expect(testChannel.messages).to.have.keys(originalMessageTs, firstTs, secondTs, thirdTs);
    expect(testChannel.unread_count).to.equal(3);

    action = {
      type: RTM_EVENTS.CHANNEL_MARKED,
      message: {
        ...getRtmMessage(RTM_EVENTS.CHANNEL_MARKED),
        ts: thirdTs
      }
    };

    state = reduce(state, action);
    testChannel = state[testChannelId];

    expect(testChannel.unread_count).to.equal(0);
  });

  it('archives & unarchives channels', () => {
    let action = {
      type: RTM_EVENTS.CHANNEL_ARCHIVE,
      message: getRtmMessage(RTM_EVENTS.CHANNEL_ARCHIVE)
    };

    let state = lodash.cloneDeep(initialState);
    deepFreeze(state);

    state = reduce(state, action);
    expect(state[testChannelId].is_archived).to.be.true;

    action = {
      type: RTM_EVENTS.CHANNEL_UNARCHIVE,
      message: getRtmMessage(RTM_EVENTS.CHANNEL_UNARCHIVE)
    };

    state = reduce(state, action);
    expect(state[testChannelId].is_archived).to.be.false;
  });
});
