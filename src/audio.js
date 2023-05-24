// 1 - our WebAudio context, **we will export and make this public at the bottom of the file**
let audioCtx;

// **These are "private" properties - these will NOT be visible outside of this module (i.e. file)**
// 2 - WebAudio nodes that are part of our WebAudio audio routing graph
let element,sourceNode,analyserNode, gainNode,lowshelfBiquadFilter,biquadFilter/*,distortionFilter*/;

let highshelf = false;
let lowshelf = false;
/*let distortion =false;
let distortionAmount = 20;*/
// 3 - here we are faking an enumeration
const DEFAULTS =Object.freeze({
    gain        :   .5,
    numSamples  :   256
});

// 4 - create a new array of 8-bit integers (0-255)
// this is a typed array to hold the audio frequency data
let audioData = new Uint8Array (DEFAULTS.numSamples/2);

// **Next are "public" methods - we are going to export all of these at the bottom of this file**
function setupWebaudio (filePath){
// 1 - The || is because WebAudio has not been standardized across browsers yet
const AudioContext = window.AudioContext || window.webkitAudioContext;
audioCtx = new AudioContext();

// 2 - this creates an <audio> element
element = new Audio();

// 3 - have it point at a sound file
loadSoundFile(filePath);

// 4 - create an a source node that points at the <audio> element
sourceNode = audioCtx.createMediaElementSource(element);

// 5 - create an analyser node
analyserNode = audioCtx.createAnalyser(); // note the UK spelling of "Analyser"

/*
// 6
We will request DEFAULTS.numSamples number of samples or "bins" spaced equally 
across the sound spectrum.

If DEFAULTS.numSamples (fftSize) is 256, then the first bin is 0 Hz, the second is 172 Hz, 
the third is 344Hz, and so on. Each bin contains a number between 0-255 representing 
the amplitude of that frequency.
*/ 

// fft stands for Fast Fourier Transform
analyserNode.fftSize = DEFAULTS.numSamples;

// 7 - create a gain (volume) node
gainNode = audioCtx.createGain();
gainNode.gain.value = DEFAULTS.gain;

//Adudio shifters
 // Adding an Audio Effect Node - highshelf
  biquadFilter = audioCtx.createBiquadFilter();
 biquadFilter.type = "highshelf";
 
 // Adding an Audio Effect Node - lowshelf
 lowshelfBiquadFilter = audioCtx.createBiquadFilter();  
lowshelfBiquadFilter.type = "lowshelf";

//distortion node
 /*distortionFilter = audioCtx.createWaveShaper();*/

// 8 - connect the nodes - we now have an audio graph
sourceNode.connect(analyserNode);
analyserNode.connect(gainNode);
gainNode.connect(biquadFilter);
biquadFilter.connect(lowshelfBiquadFilter);
/*lowshelfBiquadFilter.connect(distortionFilter);
distortionFilter.connect(audioCtx.destination)*/
lowshelfBiquadFilter.connect(audioCtx.destination)

setupAudioUI();

}

const loadSoundFile = (filePath) =>{
    element.src = filePath;
}

const playCurrentSound = () =>{
    element.play();
}

const pauseCurrentSound = () =>{
    element.pause();
}

const setVolume = (value) =>  {
value = Number(value);// make sure that it's a Number rather than a String
gainNode.gain.value = value;
}

const toggleHighshelf = (value)=>{
    if(highshelf){
      biquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime); // we created the `biquadFilter` (i.e. "treble") node last time
      biquadFilter.gain.setValueAtTime(25, audioCtx.currentTime);
    }else{
      biquadFilter.gain.setValueAtTime(0, audioCtx.currentTime);
    }
  }
  const toggleLowshelf = () =>{
    if(lowshelf){
      lowshelfBiquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);
      lowshelfBiquadFilter.gain.setValueAtTime(15, audioCtx.currentTime);
    }else{
      lowshelfBiquadFilter.gain.setValueAtTime(0, audioCtx.currentTime);
    }
  }

  const setupAudioUI = () =>{
    // I. set the initial state of the high shelf checkbox
    document.querySelector('#checkbox-highshelf').checked = highshelf; // `highshelf` is a boolean we will declare in a second
    
    // II. change the value of `highshelf` every time the high shelf checkbox changes state
    document.querySelector('#checkbox-highshelf').onchange = e => {
      highshelf = e.target.checked;
      toggleHighshelf(); // turn on or turn off the filter, depending on the value of `highshelf`!
    };
  
    document.querySelector('#checkbox-lowshelf').onchange = e => {
      lowshelf = e.target.checked;
      toggleLowshelf(); // turn on or turn off the filter, depending on the value of `highshelf`!
    };

    // toggleHighshelf(); 
  }
  
export{audioCtx,setupWebaudio,playCurrentSound,pauseCurrentSound,loadSoundFile,setVolume,analyserNode,biquadFilter,lowshelfBiquadFilter,toggleHighshelf,toggleLowshelf};