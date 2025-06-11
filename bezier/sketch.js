class Point {
  constructor(posX, posY, velX=0, velY=0) {
    this.posX = posX;
    this.posY = posY;
    this.velX = velX;
    this.velY = velY;
  }
}

class FixedQueue {
  constructor(size) {
    this.size = size;
    this._queue = [];
  }

  poll() {
    return this._queue.shift();
  }

  push(o) {
    this._queue.push(o);
    if (this._queue.length > this.size) {
      this.poll(); // discard
    }
  }

  *[Symbol.iterator]() {
    return this._queue;
  }
}

const changeRate = 30;
let curveHue = 0;
let curves = []
const trailSize = 5000;
let trail = new FixedQueue(trailSize);

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  curves.push(randomCurve())
}

function randomCurve() {
  return [randomPoint(), randomPoint(), randomPoint(), randomPoint()];
}

function randomPoint() {
  return new Point(randomInt(0, windowWidth), randomInt(0, windowHeight), (Math.random() * 5) - 2.5, (Math.random() * 5) - 2.5);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function drawCurve(curvePoints) {
  let [anchor1, control1, control2, anchor2] = curvePoints;
  noFill();
  stroke(curveHue, 80, 80);
  strokeWeight(1);
  bezier(anchor1.posX, anchor1.posY, control1.posX, control1.posY, control2.posX, control2.posY, anchor2.posX, anchor2.posY)
}

function getPointOnCurve(curvePoints, t) {
  let [p1, p2, p3, p4] = curvePoints;
  let pointX = bezierPoint(p1.posX, p2.posX, p3.posX, p4.posX, t);
  let pointY = bezierPoint(p1.posY, p2.posY, p3.posY, p4.posY, t);
  return new Point(pointX, pointY)
}

function drawPoint(point, color) {
  // stroke(0, 0, 0);
  strokeWeight(0);
  fill(color);
  circle(point.posX, point.posY, 5);
}

function movePoint(point) {
  point.posX += point.velX;
  point.posY += point.velY;
  // X edge detection
  if (point.posX <= 0) {
    point.posX = 0;
    point.velX = -point.velX;
  } else if (point.posX >= width) {
    point.posX = width;
    point.velX = -point.velX;
  }
  // Y edge detection
  if (point.posY <= 0) {
    point.posY = 0;
    point.velY = -point.velY;
  } else if (point.posY >= height) {
    point.posY = height;
    point.velY = -point.velY;
  }
}

function transparency(i) {
  let linear = (i) => {
    return i * 1.0 / trail._queue.length;
  }
  let cliff = (i) => {
    if (i === 0) {
      // avoid divide by 0
      return 1;
    }
    // at trail._queue.length we want it to be 0
    // at 0 we want it to be 1
    return 1 - (Math.atan((trail._queue.length / i) - 1) / (Math.PI / 2));
  }

  // return cliff(i);
  return linear(i);
}

function drawTrail() {
  for (let i = 0; i < trail._queue.length; i++) {
    let p = trail._queue[i];
    drawPoint(p, color(i % 360, 80, 80, transparency(i)));
  }
}

function sinWave(min, max, t) {
  let factor = (max-min)/2
  return factor * sin(t) + (min + factor);
}

function draw() {
  clear();

  for (c of curves) {
    trail.push(getPointOnCurve(c, sinWave(0, 1, 0.01 * frameCount)));
    drawTrail();
    // drawCurve(c);
    // drawPointOnCurve(c, t);
    for (p of c) {
      movePoint(p);
    }

  }

  curveHue = (curveHue + 1) % 360;
}