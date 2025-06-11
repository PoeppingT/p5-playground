bezierPoints = []
curvePoints = []

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  for (i = 0; i < 4; i++) {
    bezierPoints.push(randomPoint(windowWidth, windowHeight));
    curvePoints.push(randomPoint(windowWidth, windowHeight));
  }
  console.log("bezierPoints: " + bezierPoints);
  console.log("curvePoints: " + curvePoints);
}

function randomPoint(w, h) {
  return [randomInt(0, w), randomInt(0, h)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function sinWave(min, max, t) {
  let factor = (max-min)/2
  return factor * sin(t) + (min + factor);
}

function drawBezier(points) {
  let [control1, anchor1, anchor2, control2] = points;

  // first draw anchors
  // Draw the anchor points in black.
  stroke(0);
  strokeWeight(5);
  point(anchor1[0], anchor1[1]);
  point(anchor2[0], anchor2[1]);

  // Draw the control points in red.
  stroke(0, 100, 100);
  point(control1[0], control1[1]);
  point(control2[0], control2[1]);

  // Draw a black bezier curve.
  noFill();
  stroke(0);
  strokeWeight(1);
  bezier(anchor1[0], anchor1[1], control1[0], control1[1], control2[0], control2[1], anchor2[0], anchor2[1]);

  // Draw red lines from the anchor points to the control points.
  stroke(0, 100, 100);
  line(anchor1[0], anchor1[1], control1[0], control1[1]);
  line(anchor2[0], anchor2[1], control2[0], control2[1]);
}

function drawCurve(points) {
  let [control1, anchor1, anchor2, control2] = points;

  // first draw anchors
  // Draw the anchor points in black.
  stroke(0);
  strokeWeight(5);
  point(anchor1[0], anchor1[1]);
  point(anchor2[0], anchor2[1]);

  // Draw the control points in not red.
  stroke(180, 100, 100);
  point(control1[0], control1[1]);
  point(control2[0], control2[1]);

  // Draw a black spline curve.
  noFill();
  strokeWeight(1);
  stroke(0);
  curve(control1[0], control1[1], anchor1[0], anchor1[1], anchor2[0], anchor2[1], control2[0], control2[1]);

  // Draw not red spline curves from the anchor points to the control points.
  stroke(180, 100, 100);
  curve(control1[0], control1[1], control1[0], control1[1], anchor1[0], anchor1[1], anchor2[0], anchor2[1]);
  curve(anchor1[0], anchor1[1], anchor2[0], anchor2[1], control2[0], control2[1], control2[0], control2[1]);
}

function draw() {
  drawBezier(bezierPoints);
  drawCurve(curvePoints);
}