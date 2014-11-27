var aCtx;
var analyser;
var microphone;
var siarapGraphValue = document.getElementById('siarap-graph-value');
var siarapMaxVolumeValue = document.getElementById('siarap-max-volume');
var maxNoise = 10;

var pn = PUBNUB.init({
  publish_key   : 'pub-c-e3b482ce-85af-4325-af51-102d54b809ae',
  subscribe_key : 'sub-c-0bad17ea-761b-11e4-a5ea-02ee2ddab7fe'
});

pn.publish({
  channel : 'users',
  message : {'user' : navigator.userAgent}
});

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

    var currNoise = average / maxNoise * 100;

    if(average > maxNoise) {
      maxNoise = average;
    }

    siarapGraphValue.style.width = currNoise + '%';
    siarapMaxVolumeValue.textContent = Math.round(maxNoise, 2);

    if(currNoise >= 40) {
      siarapGraphValue.style.backgroundColor = 'red';
    } else {
      siarapGraphValue.style.backgroundColor = 'green';
    }

    pn.publish({
      channel: 'demo_tutorial',
      message: {"volume": currNoise}
    });

  },1000);
}