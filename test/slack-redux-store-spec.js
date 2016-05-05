'use strict';

const expect = require('chai').expect;
const fixtures = require('./fixtures');
const getRtmMessage = fixtures.getRtmMessage;
const testUserId = fixtures.testUserId;
const testChannelId = fixtures.testChannelId;

const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const USER_TYPING_TIMEOUT = require('../src/actions').USER_TYPING_TIMEOUT;

const SlackReduxStore = require('../src').default;

describe('the Slack Redux Store', function() { // eslint-disable-line
  it('handles async actions', function(done) { // eslint-disable-line
    this.timeout(5000);
    
    let store = new SlackReduxStore();
    let rtmStart = {
      channels: [{
        id: testChannelId,
      }]
    };
    store.cacheRtmStart(rtmStart);
    
    let message = getRtmMessage(RTM_EVENTS.USER_TYPING);
    store.handleRtmMessage(testUserId, 'T02QYTVLG', RTM_EVENTS.USER_TYPING, message);
    
    expect(store.getState().channels[testChannelId].typing).to.include(testUserId);
    
    setTimeout(() => {
      expect(store.getState().channels[testChannelId].typing).to.be.empty;
      done();
    }, USER_TYPING_TIMEOUT);
  });
});
