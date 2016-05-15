'use strict';

const lodash = require('lodash');
const expect = require('chai').expect;
const deepFreeze = require('deep-freeze');
const reduce = require('../src/reducers/messages-reducer').default;
const actionTypeWithSubtype = require('../src/reducers/utils').actionTypeWithSubtype;

const slackClient = require('@slack/client');
const fixtures = require('./fixtures');

const getRtmMessage = fixtures.getRtmMessage;
const getWebResponse = fixtures.getWebResponse;
const testChannelId = fixtures.testChannelId;
const testUserId = fixtures.testUserId;
const initialState = fixtures.initialState;

const RTM_EVENTS = slackClient.RTM_EVENTS;
const RTM_MESSAGE_SUBTYPES = slackClient.RTM_MESSAGE_SUBTYPES;
const CLIENT_ACTIONS = require('../src/actions/client-actions').CLIENT_ACTIONS;

describe('the messages reducer', () => {
  it('adds messages', () => {
    let defaultMessageType = actionTypeWithSubtype();
    let action = {
      type: defaultMessageType,
      message: getRtmMessage(defaultMessageType)
    };

    let state = {
      [testChannelId]: {
        id: testChannelId,
        unread_count: 0,
        max_ts: '0000000000.000000'
      }
    };

    deepFreeze(state);
    state = reduce(state, action);

    let testChannel = state[testChannelId];

    expect(testChannel).to.be.ok;
    expect(testChannel.unread_count).to.equal(1);
    expect(testChannel.max_ts).to.equal(action.message.ts);

    expect(Object.keys(testChannel.messages)).to.have.length(1);
    expect(testChannel.messages).to.have.keys(action.message.ts);
  });

  it('edits messages', () => {
    let changedType = actionTypeWithSubtype(RTM_MESSAGE_SUBTYPES.MESSAGE_CHANGED);
    let action = {
      type: changedType,
      message: getRtmMessage(changedType)
    };

    let state = lodash.cloneDeep(initialState);
    deepFreeze(state);
    state = reduce(state, action);

    let testChannel = state[testChannelId];
    let originalMessageTs = getRtmMessage(actionTypeWithSubtype()).ts;
    let editedMessage = action.message.message;

    expect(Object.keys(testChannel.messages)).to.have.length(2);
    expect(testChannel.messages).to.have.keys(originalMessageTs, action.message.ts);
    expect(testChannel.messages[originalMessageTs].text).to.equal(editedMessage.text);
    expect(testChannel.messages[action.message.ts].subtype).to.equal(RTM_MESSAGE_SUBTYPES.MESSAGE_CHANGED);
  });

  it('deletes messages', () => {
    let deletedType = actionTypeWithSubtype(RTM_MESSAGE_SUBTYPES.MESSAGE_DELETED);
    let action = {
      type: deletedType,
      message: getRtmMessage(deletedType)
    };

    let state = lodash.cloneDeep(initialState);
    deepFreeze(state);
    state = reduce(state, action);

    let testChannel = state[testChannelId];
    let deletedMessageTs = action.message.deleted_ts;

    expect(Object.keys(testChannel.messages)).to.have.length(1);
    expect(testChannel.messages).to.have.keys(action.message.ts);
    expect(testChannel.messages).to.not.have.keys(deletedMessageTs);
    expect(testChannel.messages[action.message.ts].subtype).to.equal(RTM_MESSAGE_SUBTYPES.MESSAGE_DELETED);
  });

  it('handles join & leave messages', () => {
    let joinType = actionTypeWithSubtype(RTM_MESSAGE_SUBTYPES.CHANNEL_JOIN);
    let action = {
      type: joinType,
      message: getRtmMessage(joinType)
    };

    let state = lodash.cloneDeep(initialState);
    deepFreeze(state);
    state = reduce(state, action);

    let testChannel = state[testChannelId];

    expect(Object.keys(testChannel.messages)).to.have.length(2);
    expect(testChannel.messages).to.have.any.keys(action.message.ts);
    expect(testChannel.messages[action.message.ts].subtype).to.equal(RTM_MESSAGE_SUBTYPES.CHANNEL_JOIN);
    expect(testChannel.members).to.have.length(1);
    expect(testChannel.members[0]).to.equal(action.message.user);

    let leaveType = actionTypeWithSubtype(RTM_MESSAGE_SUBTYPES.CHANNEL_LEAVE);
    action = {
      type: leaveType,
      message: getRtmMessage(leaveType)
    };

    state = reduce(state, action);
    testChannel = state[testChannelId];

    expect(Object.keys(testChannel.messages)).to.have.length(3);
    expect(testChannel.messages).to.have.any.keys(action.message.ts);
    expect(testChannel.messages[action.message.ts].subtype).to.equal(RTM_MESSAGE_SUBTYPES.CHANNEL_LEAVE);
    expect(testChannel.members).to.be.empty;
  });

  it('adds & removes reactions', () => {
    let action = {
      type: RTM_EVENTS.REACTION_ADDED,
      message: getRtmMessage(RTM_EVENTS.REACTION_ADDED)
    };

    let state = lodash.cloneDeep(initialState);
    deepFreeze(state);
    state = reduce(state, action);

    let testChannel = state[testChannelId];
    assertReactionWithCountAndUsers(testChannel, 'sparkles', 1, [testUserId]);

    let someOtherUser = 'U0Y8J586A';
    action.message.user = someOtherUser;

    state = reduce(state, action);
    testChannel = state[testChannelId];
    assertReactionWithCountAndUsers(testChannel, 'sparkles', 2, [testUserId, someOtherUser]);

    action = {
      type: RTM_EVENTS.REACTION_REMOVED,
      message: getRtmMessage(RTM_EVENTS.REACTION_REMOVED)
    };

    state = reduce(state, action);
    testChannel = state[testChannelId];
    assertReactionWithCountAndUsers(testChannel, 'sparkles', 1, [someOtherUser]);

    action.message.user = someOtherUser;

    state = reduce(state, action);
    testChannel = state[testChannelId];

    let originalMessageTs = getRtmMessage(actionTypeWithSubtype()).ts;
    expect(testChannel.messages[originalMessageTs].reactions).to.be.empty;
  });

  function assertReactionWithCountAndUsers(channel, name, count, users) {
    let originalMessageTs = getRtmMessage(actionTypeWithSubtype()).ts;
    let reaction = channel.messages[originalMessageTs].reactions[0];

    expect(reaction).to.be.ok;
    expect(channel.messages[originalMessageTs].reactions).to.have.length(1);

    expect(reaction.name).to.equal(name);
    expect(reaction.count).to.equal(count);
    expect(reaction.users).to.include(...users);
  }

  it('updates channel history', () => {
    let action = {
      type: CLIENT_ACTIONS.UPDATE_HISTORY,
      channelId: testChannelId,
      response: getWebResponse(CLIENT_ACTIONS.UPDATE_HISTORY)
    };

    let state = lodash.cloneDeep(initialState);
    deepFreeze(state);
    state = reduce(state, action);

    let testChannel = state[testChannelId];

    expect(testChannel.messages).to.have.keys('1448496754.000002',
      '1358546515.000008',
      '1358546515.000007');
    expect(testChannel.min_ts).to.equal('1358546515.000007');
    expect(testChannel.max_ts).to.equal('1448496754.000002');
    expect(testChannel.messages[testChannel.min_ts].reactions).to.have.length(2);
  });
});
