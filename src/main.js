/*
	main.js is primarily responsible for hooking up the UI to the rest of the application 
	and setting up the main event loop
*/

// We will write the functions in this file in the traditional ES5 way
// In this instance, we feel the code is more readable if written this way
// If you want to re-write these as ES6 arrow functions, to be consistent with the other files, go ahead!

import * as utils from './utils.js';
import * as audio from './audio.js';
import * as canvas from './canvas.js';

const drawParams = {
    showWaveformData : true,
    showGradient : false,
    showBars : false,
    showCircles : false,
    showNoise : false,
    showInvert : false,
    showEmboss: false

};


// 1 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
	sound1  :  "media/I Like To Move It.mp3"
});

const init = () =>{
  audio.setupWebaudio(DEFAULTS.sound1);
	console.log("init called");
	console.log(`Testing utils.getRandomColor() import: ${utils.getRandomColor()}`);
	let canvasElement = document.querySelector("canvas"); // hookup <canvas> element
  utils.loadFile('./data/av-data.json',jsonLoaded);
	setupUI(canvasElement);
  canvas.setupCanvas(canvasElement,audio.analyserNode);


  loop();
}

const jsonLoaded = json =>
{  
  //set up filepaths on track selector
  document.querySelector(`#track1`).value = json.tracks.track1.file;
  document.querySelector(`#track2`).value = json.tracks.track2.file;
  document.querySelector(`#track3`).value = json.tracks.track3.file;
  document.querySelector(`#track4`).value = json.tracks.track4.file;
  document.querySelector(`#track5`).value = json.tracks.track5.file;
  document.querySelector(`#track6`).value = json.tracks.track6.file;
  document.querySelector(`#track7`).value = json.tracks.track7.file;
  document.querySelector(`#track8`).value = json.tracks.track8.file;
  document.querySelector(`#track9`).value = json.tracks.track9.file;


  //set up text on track selector
  document.querySelector(`#track1`).text = json.tracks.track1.title;
  document.querySelector(`#track2`).text = json.tracks.track2.title;
  document.querySelector(`#track3`).text = json.tracks.track3.title;
  document.querySelector(`#track4`).text = json.tracks.track4.title;
  document.querySelector(`#track5`).text = json.tracks.track5.title;
  document.querySelector(`#track6`).text = json.tracks.track6.title;
  document.querySelector(`#track7`).text = json.tracks.track7.title;
  document.querySelector(`#track8`).text = json.tracks.track8.title;
  document.querySelector(`#track9`).text = json.tracks.track9.title;


  drawParams.showGradient = json.parameters.gradient;
  drawParams.showBars = json.parameters.bars;
  drawParams.showCircles = json.parameters.circles;
  drawParams.showNoise = json.parameters.noise;
  drawParams.showInvert = json.parameters.invert;
  drawParams.showEmboss = json.parameters.emboss;
  

    
}

const loop = () => {

    // requestAnimationFrame(loop);
    setTimeout(() => {
      loop()
    }, 1000/60);
    canvas.draw(drawParams);

}

const setupUI = (canvasElement) =>{
  // A - hookup fullscreen button
  const fsButton = document.querySelector("#button-fullScreen");
	
  // add .onclick event to button
  fsButton.onclick = e => {
    console.log("init called");
    utils.goFullscreen(canvasElement);
  };

  
  const playButton = document.querySelector("#button-play");

  // B - add .onclick event to play button
  playButton.onclick = e =>{
    console.log(`audioCtx.state before = ${audio.audioCtx.state}`);

    // check if context is in suspended state (autoplay policy)
    if(audio.audioCtx.state == "suspended")
    {
        audio.audioCtx.resume();
    }

    console.log(`audioCtx.state after = ${audio.audioCtx.state}`);
    if(e.target.dataset.playing == "no")
    {
        // if track is currently paused, play it
        audio.playCurrentSound();
        e.target.dataset.playing = "yes";   // our css will set the text to "Pause"
    }
    // if track is playing, pause it
    else
    {
        audio.pauseCurrentSound();
        e.target.dataset.playing = "no";    // our css will set the text to "Play"
    }
  };

  // C - hookup volume slider and label
  let volumeSlider = document.querySelector("#slider-volume");
  let volumeLabel = document.querySelector("#volumeLabel");

  // add .oninput event to slider
  volumeSlider.oninput = e =>{
    // set the gain
    audio.setVolume(e.target.value);

    // update value of label to match volume slider
    volumeLabel.innerHTML = Math.round((e.target.value/2)*100);
  };

  let danceSlider = document.querySelector("#slider-danceSpeed");
  let danceLabel = document.querySelector("#danceLabel");

  danceSlider.oninput = e =>{
    // set the gain
    canvas.setDanceSpeed(e.target.value);

    // update value of label to match volume slider
    danceLabel.innerHTML = e.target.value;
  };

  let arrowSlider = document.querySelector("#slider-arrowSpeed");
  let arrowLabel = document.querySelector("#arrowLabel");

  arrowSlider.oninput = e =>{
    // set the gain
    canvas.setArrowSpeed(e.target.value);

    // update value of label to match volume slider
    arrowLabel.innerHTML= e.target.value;
  };

  // set value of label to match initial value of slider
  volumeSlider.dispatchEvent(new Event("input"));
  danceSlider.dispatchEvent(new Event("input"));
  arrowSlider.dispatchEvent(new Event("input"));

  // D - hookup track <select>
  let trackSelect = document.querySelector("#trackSelect");
  // add .onchange event to <select>
  trackSelect.onchange = e =>{
    audio.loadSoundFile(e.target.value);
    canvas.resetScore();
    // pause the current track if it is playing
    if(playButton.dataset.playing == "yes")
    {
        playButton.dispatchEvent(new MouseEvent("click"));
    }
  }


  let trackUpload = document.querySelector("#trackUpload");
  trackUpload.onchange = (e) => {
    const files = e.target.files;
    canvas.resetScore();
    audio.loadSoundFile( URL.createObjectURL(files[0]));
    if(playButton.dataset.playing == "yes"){
        playButton.dispatchEvent(new MouseEvent("click"));
       }
};


    let gradientCB = document.querySelector("#checkbox-gradient");
    let barsCB = document.querySelector("#checkbox-bars");
    let circlesCB = document.querySelector("#checkbox-circle");
    let noiseCB = document.querySelector("#checkbox-noise");
    let invertCB = document.querySelector("#checkbox-invert");
    let embossCB = document.querySelector("#checkbox-emboss");

  gradientCB.onchange = e => {
    drawParams.showGradient = e.target.checked;
  }
  barsCB.onchange = e => {
      drawParams.showBars = e.target.checked;
  }
  circlesCB.onchange = e => {
      drawParams.showCircles = e.target.checked;
  }

  noiseCB.onchange = e => {
    drawParams.showNoise = e.target.checked;
  }

  invertCB.onchange = e =>{
    drawParams.showInvert = e.target.checked;
  }

  embossCB.onchange = e =>{
    drawParams.showEmboss = e.target.checked;
  }

  let waveformCB = document.querySelector("#checkbox-waveform");
  waveformCB.onchange = e =>
  {
    drawParams.showWaveformData = e.target.checked;
  }

	
} // end setupUI



export {init};