# slack-redux-store
A [Redux](https://github.com/reactjs/redux) store that can be used in coordination with [`node-slack-client`](https://github.com/slackhq/node-slack-client). This library implements a set of reducers for real-time events from the [Slack API](https://api.slack.com/rtm).

## Usage
`npm install slack-redux-store`

```js
import {RtmClient, CLIENT_EVENTS} from '@slack/client';
import SlackReduxStore from 'slack-redux-store';

let client = new RtmClient(yourApiToken, {
  dataStore: new SlackReduxStore(),
  ...
});

client.start();
client.dataStore.subscribe(() => {

  // The store now holds a state tree with the `rtm.start` payload, like:
  // {
  //    users: {},
  //    channels: {},
  //    ims: {},
  //    groups: {},
  //    bots: {},
  //    self: {},
  //    teams: {}
  // }
  //
  // And will be updated with events from the web socket.
  console.log(client.dataStore.getState());
});
```

You can pass your own reducers, initial state, and enhancers through the constructor, for full customization:
```js
import * as reducers from './your-own-reducers';

let initialState = {
  some: 'defaultState'
};

let enhancers = [
  applyMiddleware(logger),
  DevTools.instrument()
];

return new SlackReduxStore({
  reducers: reducers.default,
  initialState,
  enhancers
});
```

## So What?
If you're using React, your model should be using immutable data for optimal performance. This is because React components rely on `shouldComponentUpdate` to know when to re-render. You can easily swap out the [default store](https://github.com/slackhq/node-slack-client/blob/master/lib/data-store/memory-data-store.js) in `node-slack-client` with this one, which never mutates state.

In addition, this store can leverage extensions like [Redux DevTools](https://github.com/gaearon/redux-devtools) for monitoring, rewinding, or replaying state changes.

![](https://s3.amazonaws.com/f.cl.ly/items/1N2b0w3P3q1w103D2C0Y/Image%202016-05-10%20at%206.45.07%20PM.png?v=a6148516)

#### Run Tests
`npm test`
