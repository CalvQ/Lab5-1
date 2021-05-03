// script.js

const img = new Image(); // used to load image from <input> and draw to canvas
const gen = document.querySelector('button[type="submit"]');
const clear = document.querySelector('button[type="reset"]');
const read = document.querySelector('button[type="button"]');

const canvas = document.getElementById("user-image");
var ctx = canvas.getContext("2d");
const new_img = document.getElementById("image-input");
const form = document.getElementById("generate-meme");

var top_txt = document.getElementById('text-top');
var bot_txt = document.getElementById('text-bottom');

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
    //set buttons
    clear.disabled = true;
    read.disabled = true;
    gen.disabled = false;

    //clear canvas and fill with black
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //draw image
    const dim = getDimmensions(canvas.width, canvas.height, img.width, img.height);
    ctx.drawImage(img, dim.startX, dim.startY, dim.width, dim.height);

    //clear form
    form.reset();
    speechSynthesis.cancel();
});

new_img.addEventListener('change', (event) => {
    img.src = URL.createObjectURL(event.target.files[0]);
});

// document.getElementById('text-top').addEventListener('change',() => {
//     top_txt.value = document.getElementById('text-top').value;
// });

// document.getElementById('text-bottom').addEventListener('change',() => {
//     bot_txt.value = document.getElementById('text-bottom').value;
// });

gen.addEventListener('click', () => {
    //set buttons
    gen.disabled = true;
    clear.disabled = false;
    read.disabled = false;

    //set text style
    ctx.font = "50px Impact";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 8;

    //write text
    ctx.strokeText(top_txt.value, (canvas.width - ctx.measureText(top_txt.value).width)/2, 60);
    ctx.fillText(top_txt.value, (canvas.width - ctx.measureText(top_txt.value).width)/2, 60);
    ctx.strokeText(bot_txt.value, (canvas.width - ctx.measureText(bot_txt.value).width)/2, canvas.height-20);
    ctx.fillText(bot_txt.value, (canvas.width - ctx.measureText(bot_txt.value).width)/2, canvas.height-20);
    speechSynthesis.cancel();
});

clear.addEventListener('click', () => {
    //clear canvas
    ctx.clearRect(0,0,canvas.width,canvas.height);

    //set buttons
    gen.disabled = false;
    clear.disabled = true;
    read.disabled = true;

    //clear form
    form.reset();
    speechSynthesis.cancel();
});

var dropdown = document.getElementById('voice-selection');
var voices = speechSynthesis.getVoices();

//from https://developer.mozilla.org/en-US/docs/Web/API/Window/speechSynthesis: 
function populateVoiceList() {
    voices = speechSynthesis.getVoices();
    dropdown.remove(0);

    for(let i = 0; i < voices.length ; i++) {
        var option = document.createElement('option');
        option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

        if(voices[i].default) {
            option.textContent += ' -- DEFAULT';
        }

        option.setAttribute('data-lang', voices[i].lang);
        option.setAttribute('data-name', voices[i].name);
        dropdown.appendChild(option);
    }

    dropdown.disabled = false;
    speechSynthesis.cancel();
}

setTimeout(populateVoiceList, 10);

const slider = document.querySelector('input[type="range"]');
const vol = document.getElementsByTagName("img")[0];

read.addEventListener('click', () => {
    console.log(top_txt.value);
    let top = new SpeechSynthesisUtterance(top_txt.value);
    let bot = new SpeechSynthesisUtterance(bot_txt.value);

    top.volume = slider.value*0.01;
    bot.volume = slider.value*0.01;

    var voice = dropdown.selectedOptions[0].getAttribute('data-name');
    for(var i = 0; i < voices.length; ++i) {
      if(voices[i].name === voice) {
        top.voice = voices[i];
        bot.voice = voices[i];
      }
    }
    speechSynthesis.speak(top);
    speechSynthesis.speak(bot);
});

slider.addEventListener('input', value => { 
    if(Number(slider.value) == 0){vol.src = "icons/volume-level-0.svg"}
    if(Number(slider.value) > 0 && Number(slider.value) <= 33){vol.src = "icons/volume-level-1.svg"}
    if(Number(slider.value) > 33 && Number(slider.value) <= 66){vol.src = "icons/volume-level-2.svg"}
    if(Number(slider.value) > 66 && Number(slider.value) <= 100){vol.src = "icons/volume-level-3.svg"}
});

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
