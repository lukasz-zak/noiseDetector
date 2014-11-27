var pn = PUBNUB.init({
  publish_key   : 'pub-c-e3b482ce-85af-4325-af51-102d54b809ae',
  subscribe_key : 'sub-c-0bad17ea-761b-11e4-a5ea-02ee2ddab7fe'
});

var smoothie = new SmoothieChart({
  grid: {
    strokeStyle:'rgb(125, 0, 0)', fillStyle:'rgb(60, 0, 0)',
    lineWidth: 1, millisPerLine: 250, verticalSections: 6
  },
  labels: {
    fillStyle:'rgb(60, 0, 0)'
  }
});
smoothie.streamTo(document.getElementById("myChart"), 500);

var lines = [];
var colors = [];

function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function hexToRgb(hex, opacity) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  return result ? 'rgba('+ parseInt(result[1], 16) +', '+ parseInt(result[2], 16) +', '+ parseInt(result[3], 16) +', ' + opacity +')' : null;
}

var generateHtmlForNewUser = function (areaName, ua){

  return $('<a href="#" style="background-color: '+colors[areaName]+'" class="list-group-item">' +
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
    colors[m.areaName] = getRandomColor();

    var color = hexToRgb(colors[m.areaName], 0.4);
    console.log('color', color);

    lines[m.areaName] = new TimeSeries();
    smoothie.addTimeSeries(lines[m.areaName], {
      strokeStyle : hexToRgb(colors[m.areaName], 1),
      fillStyle :  hexToRgb(colors[m.areaName], 0.4),
      lineWidth: 3
    });

    $('.list-group').append(generateHtmlForNewUser(m.areaName, m.user));
  }
});

pn.subscribe({
  channel: 'noiseInfo',
  message: function(m){
    console.log('m', m);

    if(m.currVolume){
      $('#currVol_' + m.areaName).text(m.currVolume);

      if(lines[m.areaName]) {
        lines[m.areaName].append(new Date().getTime(), m.currVolume)
      }
    }

    if(m.maxVolume) {
      $('#maxVol_' + m.areaName).text(m.maxVolume);
    }
  }
});