/*
	The purpose of this file is to take in the analyser node and a <canvas> element: 
	  - the module will create a drawing context that points at the <canvas> 
	  - it will store the reference to the analyser node
	  - in draw(), it will loop through the data in the analyser node
	  - and then draw something representative on the canvas
	  - maybe a better name for this file/module would be *visualizer.js* ?
*/

import * as utils from './utils.js';

//#region variables

let ctx,canvasWidth,canvasHeight,gradient,analyserNode,audioData;

let  audioDataWF;

let kobeni; //kobeni object

//set up kobeni sprites
let kobeniSprites = [
    document.querySelector("#kobeni1"),
    document.querySelector("#kobeni2"),
    document.querySelector("#kobeni3"),
    document.querySelector("#kobeni4"),
    document.querySelector("#kobeni5")
];

//kobeni control
let danceSpeed = 60;
let danceTimer =2.5;
let danceSpeedSelection = 40;

//arrow control
let arrowimg = document.querySelector("#arrows");
let lastTime = 0; 
let deltaTime = 0;
let spawnTimer = 2.5;
let spawnedArrows = [];
let scrollSpeed;
let spawnSpeed;
let arrowSpeedSelection = 35;
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

//set up arrow spawns
let arrowx1, arrowx2, arrowx3, arrowx4;
[arrowx1, arrowx2, arrowx3, arrowx4] = [20, 100, 180, 260]; 

//#endregion variables


class Kobeni
{
    constructor(x,y)
    {
        this.sprites = [];
        this.x=x;
        this.y=y;
        this.frame = 0;
        this.lastFrame = 0;
    }

    //calculates what's going to be the next sprite of kobeni dancing
    updateFrame = () =>
    {
        this.frame = Math.floor(utils.getRandom(0,4.9));

        //if the new sprite calculates is the same as the last one, try again
        if (this.frame == this.lastFrame) 
        {
            this.updateFrame();
        }
        //if the new sprite isn't the same as the last one, update the last sprite
        else{
            this.lastFrame= this.frame;
        }

    }

    //draws kobeni
    drawKobeni = () =>
    {
        ctx.drawImage(this.sprites[this.frame], this.x, this.y, (this.sprites[this.frame].width)/2, (this.sprites[this.frame].height)/2);
    }

}

class arrows {
    constructor(image, direction, arrowW, arrowH){
        this.image = image;

        //set what arrow sprite is used (imgx) based on direction &
        //make it spawn in the same location (arrowX) as other arrows of that direction
        switch(direction)
        {
            case 1:
                this.imgx = 0; 
                this.arrowX = arrowx1; 
                break;
            case 2:
                this.imgx = 168; 
                this.arrowX= arrowx2;
                break;
            case 3: 
            this.imgx = 168 *2; 
            this.arrowX = arrowx3;

                break;
            default:
                this.imgx= 168 *3; 
                this.arrowX = arrowx4;
        }
        this.imgy = 0; 
        this.imgw=166;
        this.imgh=168;

        this.arrowY = canvasHeight;
        this.arrowW = arrowW;
        this.arrowH = arrowH;
    }
    
    //updates arrow size and vertical position
    updateArrow = (size, deltaTime, scrollSpeed) =>
    {
        this.arrowW = size *1.2;
        this.arrowH = size *1.2;
        this.drawArrow();
        this.arrowY -= 20*deltaTime * scrollSpeed;
    }

    //draws arrow
    drawArrow = () =>
    {
        ctx.drawImage(this.image, this.imgx, this.imgy,this.imgw, this.imgh, this.arrowX, this.arrowY, this.arrowW, this.arrowH);
    }


}


                
const setupCanvas = (canvasElement,analyserNodeRef, img) => {
	// create drawing context
	ctx = canvasElement.getContext("2d");
	canvasWidth = canvasElement.width;
	canvasHeight = canvasElement.height;
	// create a gradient that runs top to bottom
	gradient = utils.getLinearGradient(ctx,0,0,0,canvasHeight,[{percent:0,color:"blue"},{percent:.5,color:"purple"},{percent:1, color:"magenta"}]);
	// keep a reference to the analyser node
	analyserNode = analyserNodeRef;
	// this is the array where the analyser data will be stored
	audioData = new Uint8Array(analyserNode.fftSize/2);


    
    audioDataWF = new Uint8Array(analyserNode.fftSize/2);


    //creates kobeni objext
    kobeni = (new Kobeni(canvasWidth/2+130, canvasHeight/2-200));
    for(let i=0; i < kobeniSprites.length; i++)
    {
        kobeni.sprites.push(kobeniSprites[i]);
    }

}

const draw = (params={}, time=0) =>{
    //#region VARIABLES
    
    analyserNode.getByteFrequencyData(audioData);
    
    
    analyserNode.getByteTimeDomainData(audioDataWF);
    
    deltaTime = (time - lastTime)/1000;
    deltaTime = clamp(deltaTime,1/144,1/12);
    lastTime = time;
    
    let percent = 0;
    for(let i = 0; i < audioData.length; i++){
        percent += audioData[i] / 255;
    }
    // if(params.showWaveformData == true)
    // {
    //     percent -= 64.25098039215669;
    // }
    // if(percent <0)
    // {
    //     percent = 0;
    // }

    //#endregion

    //#region BACKGROUND
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    //#endregion BACKGROUND

    //#region GRADIENT
    if(params.showGradient){
        ctx.save();
        ctx.fillStyle = gradient;
        ctx.globalAlpha = .8;
        ctx.fillRect(0,0,canvasWidth,canvasHeight);
        ctx.restore();
    }
    //#endregion GRADIENT

    //#region BARS
    if(params.showBars)
    {
        let barSpacing = 4;
        let margin = 5;
        let screenWidthForBars = canvasWidth - (audioData.length * barSpacing) - margin * 2;
        let barWidth = canvasWidth/audioData.length;
        let barHeight = 200;
        let topSapcing = 100;
        ctx.save();
        //draw
        let x = 0;

        if(params.showWaveformData == true)
        {
            for (let i = 0; i < audioDataWF.length; i++) {
                barHeight = (audioDataWF[i] * 1.2)/2;
                if(barHeight<10) barHeight=0;
                ctx.globalAlpha =.8;
    
                const red = 250 * (i/audioDataWF.length);
                const green = 0;
                const blue = barHeight + (2 * (i/audioDataWF.length));    
                ctx.fillStyle = "rgb(" + red + "," + green + "," + blue + ")";
                ctx.fillRect(x, canvasHeight - barHeight, barWidth, barHeight);
                x += barWidth + 1;
            }

        }
        else
        {
            for (let i = 0; i < audioData.length; i++) {
                barHeight = audioData[i] * 1.2;
                if(barHeight<10) barHeight=5;
    
                const red = 250 * (i/audioData.length);
                const green = 0;
                const blue = barHeight + (2 * (i/audioData.length));    
                ctx.fillStyle = "rgb(" + red + "," + green + "," + blue + ")";
                ctx.fillRect(x, canvasHeight - barHeight, barWidth, barHeight);
                x += barWidth + 1;
            }

        }
    
        
        ctx.restore();
    }
    //#endregion BARS

    //#region DDR MACHINE BACKGROUND
    let machineimg;
    machineimg = document.querySelector("#machine");
    ctx.drawImage(machineimg, 200, 0, machineimg.width*1.35, machineimg.height*1.35);
    //#endregion DDR MACHINE BACKGROUND

    //#region SPEAKERS
    if(params.showCircles)
    {
        let maxRadius = canvasHeight/15;
        let speaker1x, speaker1y, speaker2x, speaker2y;
        [speaker1x, speaker1y, speaker2x, speaker2y] = 
        [canvasWidth/2 +315,canvasHeight/2+90,
        canvasWidth/2 +220,canvasHeight/2+75];

        ctx.save();
        ctx.globalAlpha = 0.2;
        
    ctx.globalCompositeOperation = "hard-light";
        for(let i = 0; i<audioData.length; i++)
        {
            let percent = audioData[i]/255;
            let circleRadius = percent*maxRadius*0.7;
            //left speaker

            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = utils.makeColor(145,127,255,.5 - percent/5.0);
            ctx.arc(speaker2x, speaker2y,circleRadius,0,2*Math.PI,false);
            ctx.fill();
            ctx.closePath();
            ctx.restore();
            ctx.beginPath();
            ctx.fillStyle = utils.makeColor(77,55,90,.34 - percent/3.0);
            ctx.arc(speaker2x, speaker2y,circleRadius,0,2*Math.PI,false);
            ctx.fill();
            ctx.closePath();
            ctx.beginPath();
            ctx.fillStyle = utils.makeColor(234,233,255,.10 - percent/10.0);
            ctx.arc(speaker2x, speaker2y,circleRadius*1.4,0,2*Math.PI,false);
            ctx.fill();
            ctx.closePath();
            //right speaker
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = utils.makeColor(145,127,255,.5 - percent/5.0);
            ctx.arc(speaker1x, speaker1y,circleRadius,0,2*Math.PI,false);
            ctx.fill();
            ctx.closePath();
            ctx.restore();
            ctx.beginPath();
            ctx.fillStyle = utils.makeColor(77,55,90,.34 - percent/3.0);
            ctx.arc(speaker1x, speaker1y,circleRadius,0,2*Math.PI,false);
            ctx.fill();
            ctx.closePath();
            ctx.beginPath();
            ctx.fillStyle = utils.makeColor(234,233,255,.10 - percent/10.0);
            ctx.arc(speaker1x, speaker1y,circleRadius*1.4,0,2*Math.PI,false);
            ctx.fill();
            ctx.closePath();
        }
        ctx.restore();
    }
    //#endregion SPEAKERS

    //#region KOBENI
    let percentKobeni = percent;
    percentKobeni /= (audioData.length / 2);
    danceSpeed =  danceSpeedSelection * percentKobeni ; //kobeni's sprite changes to the music
    if(danceTimer > (3/danceSpeed)){
        kobeni.updateFrame(); //changes sprite 
        danceTimer = 0;
    }
    kobeni.drawKobeni();
    danceTimer += deltaTime;
    //#endregion KOBENI

    //#region DDR MACHINE FOREGROUND
    let barimg;
    barimg = document.querySelector("#bars");
    ctx.drawImage(barimg, 200, 0, barimg.width*1.35, barimg.height*1.35);
    //#endregion DDR MACHINE FOREGROUND

    //#region DDR ARROWS 
    let maxSize = canvasHeight/6;

    ctx.save();
    let percentArrows = percent;
    percentArrows /= (audioData.length / 2);
    let size = percentArrows * maxSize *1.1;
    if(size< 50)
    {
        size = 50;
    }
    scrollSpeed = 100;
    spawnSpeed = arrowSpeedSelection * percentArrows; //arrows spawn to the music

    //#region BG arrows
    ctx.save();
    ctx.globalCompositeOperation = "luminosity";
    ctx.drawImage(arrowimg, 
    0, 0, 166, 168,
    arrowx1, 30, size*1.2, size*1.2);
    ctx.drawImage(arrowimg, 
    168, 0, 166, 168,
    arrowx2, 30, size*1.2, size*1.2);
    ctx.drawImage(arrowimg, 
    168*2, 0, 166, 168,
    arrowx3, 30, size*1.2, size*1.2);
    ctx.drawImage(arrowimg, 
    168*3, 0, 166, 168,
    arrowx4, 30, size*1.2, size*1.2);
    ctx.restore();
    //#endregion BG arrows
    
    //spawns new arrows to th ebeat
    if(spawnTimer > (3/spawnSpeed)){
        spawnedArrows.push(new arrows(
            arrowimg, //img
            Math.floor(utils.getRandom(0,3.1)), //direction randomized
            arrowimg.width, //w
            arrowimg.height //h
            ));
        spawnTimer = 0;
    }

    //animates arrows
    for(let i = 0; i < spawnedArrows.length; i++){
        if(spawnedArrows[i].arrowY < 50)
        {
            spawnedArrows.splice(i,1);
            break;
        } 
        spawnedArrows[i].updateArrow(size, deltaTime,scrollSpeed);
    }
    ctx.restore();
    spawnTimer += deltaTime;
    //#endregion DDR ARROWS

    //#region BITMAP MANIPULATION
    let imageData = ctx.getImageData(0,0,canvasWidth,canvasHeight);
    let data = imageData.data;
    let length = data.length;
    let width = imageData.width;
    for (let i = 0; i<length; i+=4){
        if(params.showNoise && Math.random()<0.05){
            
            data[i] =189;
            data[i+1] = 134;
            data[i+2] = 78;
        } // end if
        if(params.showInvert){
            let red = data[i], green = data[i+1], blue = data[i+2];
            data[i] = 255 - red;
            data[i+1] =255 - green;
            data[i+2] = 255 - blue;
        }
     } 
    if(params.showEmboss){
        for(let i =0;i<length;i++)
        {
            if(i%4==3)continue; 
            data[i] = 127 +2*data[i] - data[i+4]-data[i+width*4];
        }
    }
    ctx.putImageData(imageData,0,0);
    //#endregion BITMAP MANIPULATION
}


//user's prefered dance speed set up
const setDanceSpeed = (value) =>
{
  danceSpeedSelection = Number(value);   // make sure that it's a Number rather than a String
}

//user's prefered arrow spawn speed
const setArrowSpeed =(value)=>
{
    arrowSpeedSelection = Number(value);   // make sure that it's a Number rather than a String
}

  
export {setupCanvas, setDanceSpeed, setArrowSpeed, draw};