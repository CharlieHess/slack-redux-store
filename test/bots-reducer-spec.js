'use strict';

const expect = require('chai').expect;
const deepFreeze = require('deep-freeze');
const reduce = require('../src/reducers/bots-reducer').default;
const getRtmMessage = require('./fixtures').getRtmMessage;

const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

describe('the bots reducer', () => {
  it('adds or modifies bots', () => {
    let action = {
      type: RTM_EVENTS.BOT_ADDED,
      message: getRtmMessage(RTM_EVENTS.BOT_ADDED)
    };

    let state = {};
    deepFreeze(state);
    state = reduce(state, action);

    expect(state).to.have.keys('B0Y8J586A');
    expect(state['B0Y8J586A'].name).to.equal('bot');

    action.message.bot.name = 'Optimus Prime';
    state = reduce(state, action);

    expect(state).to.have.keys('B0Y8J586A');
    expect(state['B0Y8J586A'].name).to.equal('Optimus Prime');
  });
});
