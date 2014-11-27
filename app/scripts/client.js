var aCtx;
var analyser;
var microphone;
var siarapGraphValue = document.getElementById('siarap-graph-value');
var siarapMaxVolumeValue = document.getElementById('siarap-max-volume');
var areaName;
var intervalTime = 10;

var input = $('#userName');
var detector = $('#detector');
detector.hide();

var pn = PUBNUB.init({
  publish_key   : 'pub-c-e3b482ce-85af-4325-af51-102d54b809ae',
  subscribe_key : 'sub-c-0bad17ea-761b-11e4-a5ea-02ee2ddab7fe'
});


$('#submit').click(function (e){
  e.preventDefault();

  areaName = input.val();

  $('.container').hide();
  detector.show();
  init();

  pn.publish({
    channel : 'users',
    message : {
      'user' : navigator.userAgent,
      'areaName' : areaName
    }
  });
});

var maxNoise = 10;

var init = function (){

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

  if (navigator.getUserMedia) {

    navigator.getUserMedia(
      {audio: true},
      function(stream) {
        aCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = aCtx.createAnalyser();
        analyser.smoothingTimeConstant  = 0.3;
        analyser.fftSize = 1024;
        microphone = aCtx.createMediaStreamSource(stream);
        microphone.connect(analyser);
//      analyser.connect(aCtx.destination);
        process();
      }, function (){}
    );
  }

  function getAverageVolume(array) {
    var values = 0;
    var average;

    var length = array.length;

    // get all the frequency amplitudes
    for (var i = 0; i < length; i++) {
      values += array[i];
    }

    average = values / length;
    return average;
  }

  function process(){
    setInterval(function(){
      var array =  new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(array);

      var average = getAverageVolume(array);

      var currNoise = Math.round(average / maxNoise * 100, 2);

      if(average > maxNoise) {
        maxNoise = Math.round(average, 2);

        pn.publish({
          channel: 'noiseInfo',
          message: {
            areaName    : areaName,
            maxVolume  : maxNoise
          }
        });
      }

      siarapGraphValue.style.width = currNoise + '%';
      siarapMaxVolumeValue.textContent = maxNoise;

      if(currNoise >= 40) {
        siarapGraphValue.style.backgroundColor = 'red';
      } else {
        siarapGraphValue.style.backgroundColor = 'green';
      }

      var ms = new Date().getMilliseconds();

      if(ms >= 1 && ms <= intervalTime + 1 || ms >= 500 && ms <= 500 + intervalTime + 1){
        console.log('log', currNoise);
        pn.publish({
          channel: 'noiseInfo',
          message: {
            areaName    : areaName,
            currVolume  : currNoise
          }
        });
      }

    },intervalTime);
  }
};