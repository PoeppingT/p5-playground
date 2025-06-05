let hue = randomInt(0, 360);
let hueIncrement = 0.1;
let hueChangeRate = 0.01;
let hueChangeMax = 3;
let hueChangeMin = 0.1;
let hueIncreasing = true;
let saturation = 50;
let brightness = 100;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB)
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function updateHueChangeRate() {
  // update speed of hue change
  hueIncrement += hueChangeRate;
  if (hueIncreasing) {
    hueChangeRate++;
    if (hueChangeRate >= hueChangeMax) {
      hueIncreasing = false;
    }
  } else {
    hueChangeRate--;
    if (hueChangeRate <= hueChangeMin) {
      hueIncreasing = true;
    }
  }
}

function draw() {
  background(hue, saturation, brightness);

  // update hue
  hue = (hue + hueIncrement) % 360;
}