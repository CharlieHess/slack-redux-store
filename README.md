# slack-redux-store
A Redux store that can be used in coordination with [`node-slack-client`](https://github.com/slackhq/node-slack-client). This library implements a set of reducers for real-time events from the [Slack API](https://api.slack.com/rtm).

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
client.addEventListener(CLIENT_EVENTS.RTM.AUTHENTICATED, () => {
  client.dataStore.subscribe(() => {
    console.log(client.dataStore.getState());
  });
});
```

#### Run Tests
`npm test`
