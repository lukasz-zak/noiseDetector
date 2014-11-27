var pn = PUBNUB.init({
  publish_key   : 'pub-c-e3b482ce-85af-4325-af51-102d54b809ae',
  subscribe_key : 'sub-c-0bad17ea-761b-11e4-a5ea-02ee2ddab7fe'
});

pn.subscribe({
  channel: 'users',
  message: function(m){
    console.info('User join', m.user);
  }
});

pn.subscribe({
  channel: 'demo_tutorial',
  message: function(m){console.log('message', m)}
});