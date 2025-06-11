class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return `(${this.x}, ${this.y})`
  }
}
class Line {
  constructor(fixed, movable) {
    this.fixed = fixed;
    this.movable = movable;
  }

  translate(vector) {
    // vector is [x,y]
    this.fixed.x += vector.x
    this.fixed.y += vector.y
    this.movable.x += vector.x
    this.movable.y += vector.y
  }

  rotate(degrees) {
    // always rotate about fixed
    let radians = degrees / 180 * Math.PI;
    // translate fixed to origin
    let originX = this.movable.x - this.fixed.x; 
    let originY = this.movable.y - this.fixed.y;
    // rotate movable about origin
    let rotatedX = originX * Math.cos(radians) - originY * Math.sin(radians);
    let rotatedY = originX * Math.sin(radians) + originY * Math.cos(radians);
    // translate back to fixed
    this.movable.x = rotatedX + this.fixed.x;
    this.movable.y = rotatedY + this.fixed.y;
  }

  magnitude() {
    return Math.sqrt(Math.pow(this.movable.x - this.fixed.x, 2) + Math.pow(this.movable.y - this.fixed.y, 2));
  }

  toString() {
    return `Line ${this.fixed}->${this.movable}`
  }
}
class Segment {
  constructor(line, rotationSpeed) {
    this.line = line;
    this.rotationSpeed = rotationSpeed;
  }

  doRotate() {
    this.line.rotate(this.rotationSpeed * deltaTime);
  }

  toString() {
    return `Segment ${this.line} @ ${this.rotationSpeed}`
  }
}
class Segments {
  constructor(start) {
    this.segments = [];
    this.start = start;
  }

  addSegment(magnitude, rotationSpeed) {
    if (this.segments.length == 0) {
      // create a segment from start
      this.segments.push(new Segment(new Line(new Vector(this.start.x, this.start.y), new Vector(this.start.x, this.start.y - magnitude)), rotationSpeed));
    } else {
      // append this segment from the previous
      let previousSegment = this.segments[this.segments.length - 1];
      this.segments.push(new Segment(new Line(new Vector(previousSegment.line.movable.x, previousSegment.line.movable.y), new Vector(previousSegment.line.movable.x, previousSegment.line.movable.y - magnitude)), rotationSpeed));
    }
  }

  getEndpoint() {
    let endpoint = this.segments[this.segments.length - 1].line.movable;
    return new Vector(endpoint.x, endpoint.y);
  }

  process() {
    for (let i = 0; i < this.segments.length; i++) {
      let segment = this.segments[i];
      if (i > 0) {
        let previous = this.segments[i-1];
        // if we have a previous, first translate to where the previous one ended
        segment.line.translate(new Vector(previous.line.movable.x - segment.line.fixed.x, previous.line.movable.y - segment.line.fixed.y));
      }
      segment.doRotate();
    }
  }

  drawWithLines() {
    for (let i = 0; i < this.segments.length; i++) {
      drawLine(this.segments[i].line, i);
    }
  }

  drawWithCurves() {
    for (let i = 0; i < this.segments.length; i++) {
      // I want to draw my curves with 4 points
      // let's do the previous line's fixed, my line's fixed and movable, and the next line's movable
      let previousFixed = (i == 0) ? this.segments[i].line.fixed : this.segments[i-1].line.fixed;
      let nextMovable = (i == this.segments.length - 1) ? this.segments[i].line.movable : this.segments[i+1].line.movable;
      drawCurve(previousFixed, this.segments[i].line.fixed, this.segments[i].line.movable, nextMovable, i);
    }
  }

  draw() {
    // this.drawWithLines();
    this.drawWithCurves();
  }

  toString() {
    return `Segments ${this.segments}`
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

  length() {
    return this._queue.length;
  }

  get(i) {
    return this._queue[i];
  }

  *[Symbol.iterator]() {
    return this._queue;
  }

  toString() {
    return `FixedQueue of ${this.size}: ${this._queue}`
  }
}
class Trail {
  constructor(size) {
    this.queue = new FixedQueue(size);
  }

  add(point) {
    this.queue.push(point);
  }

  drawWithCircles() {
    for (let i = 0; i < this.queue.length(); i++) {
      let p = this.queue.get(i);
      drawPoint(p, i, i / this.queue.length());
    }
  }

  drawWithLines() {
    for (let i = 0; i < this.queue.length(); i++) {
      if (i != 0) {
        drawLine(new Line(this.queue.get(i-1), this.queue.get(i)), i, i / this.queue.length());
      }
    }
  }

  drawWithCurves() {
    for (let i = 0; i < this.queue.length(); i++) {
      let first = (i > 1) ? this.queue.get(i-2) : (i == 0) ? this.queue.get(i) : this.queue.get(i-1);
      let second = (i > 0) ? this.queue.get(i-1) : this.queue.get(i);
      let third = this.queue.get(i);
      let fourth = (i == this.queue.length() - 1) ? this.queue.get(i) : this.queue.get(i+1);
      drawCurve(first, second, third, fourth, i, i / this.queue.length());
    }
  }

  draw() {
    // this.drawWithCircles();
    // this.drawWithLines();
    this.drawWithCurves();
  }

  toString() {
    return `Trail ${this.queue}`;
  }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function drawPoint(point, i, transparency) {
  strokeWeight(0);
  fill((100 * (i + 1)) % 360, 100, 100, transparency);
  circle(point.x, point.y, 2);
}

function drawLine(lineToDraw, i, transparency = 1) {
  strokeWeight(3);
  stroke((100 * (i + 1)) % 360, 100, 100, transparency);
  line(lineToDraw.fixed.x, lineToDraw.fixed.y, lineToDraw.movable.x, lineToDraw.movable.y);
}

function drawCurve(v1, v2, v3, v4, i, transparency = 1) {
  noFill();
  strokeWeight(3);
  stroke((100 * (i + 1)) % 360, 100, 100);
  curve(v1.x, v1.y, v2.x, v2.y, v3.x, v3.y, v4.x, v4.y);
}

let segments;
let trail;
const maxTrailSize = 2500;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  segments = new Segments(new Vector(windowWidth / 2, windowHeight / 2));
  trail = new Trail(maxTrailSize);
  for (let i = 0; i < 50; i++) {
    segments.addSegment(80 * (1/(i + 1)), (0.25+i) * 0.03);
  }
}

function draw() {
  clear();
  segments.process();
  trail.add(segments.getEndpoint());
  segments.draw();
  trail.draw();
}
