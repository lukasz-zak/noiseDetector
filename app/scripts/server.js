var pn = PUBNUB.init({
  publish_key   : 'pub-c-e3b482ce-85af-4325-af51-102d54b809ae',
  subscribe_key : 'sub-c-0bad17ea-761b-11e4-a5ea-02ee2ddab7fe'
});

var generateHtmlForNewUser = function (areaName, ua){
  return $('<a href="#" class="list-group-item">' +
      '<h4 class="list-group-item-heading">'+ areaName +'</h4>' +
      '<span class="label label-danger pull-right" id="maxVol_'+areaName+'"></span>' +
      '<span class="label label-info pull-right" id="currVol_'+areaName+'"></span>' +
      '<p class="list-group-item-text">'+ ua +'</p>' +
    '</a>'
  );
};

pn.subscribe({
  channel: 'users',
  message: function(m){
    console.info('User join', m.user);

    $('.list-group').append(generateHtmlForNewUser(m.areaName, m.user));
  }
});

pn.subscribe({
  channel: 'noiseInfo',
  message: function(m){
    console.log('m', m);
    if(m.currVolume){
      $('#currVol_' + m.areaName).text(m.currVolume);
    }

    if(m.maxVolume) {
      $('#maxVol_' + m.areaName).text(m.maxVolume);
    }
  }
});