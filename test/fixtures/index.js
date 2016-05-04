'use strict';

const lodash = require('lodash');
const eventFixtures = require('./client-events');
const actionTypeWithSubtype = require('../../src/reducers/utils').actionTypeWithSubtype;

function getRtmMessage(evt) {
  return lodash.cloneDeep(eventFixtures[evt]);
}

const testUserId = 'U02QYTVLJ';
const testChannelId = 'C02QYTVLQ';

module.exports.getRtmMessage = getRtmMessage;
module.exports.testUserId = testUserId;
module.exports.testChannelId = testChannelId;
module.exports.initialState = {
  [testChannelId]: {
    id: testChannelId,
    unread_count: 0,
    max_ts: '1448496754.000002',
    messages: {
      '1448496754.000002': getRtmMessage(actionTypeWithSubtype())
    },
    members: []
  }
};
