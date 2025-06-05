const boxSize = 5;
const SPACEBAR = 32;
const canvasScaleDown = 15;
let targetFramerate = 5;
let currentWorld = [];
let futureWorld = [];
let updated = [];
let simulating = false;
let boxHue = 0;
let boxSaturation = 50;
let boxBrightness = 100;
let timeStep = 0;
const boxChangeTime = 1;
const boxChangeRate = 1;

function setup() {
  createCanvas(windowWidth - canvasScaleDown, windowHeight - canvasScaleDown);
  colorMode(HSB);

  frameRate(targetFramerate);

  initWorlds();
  randomBlinkers((windowWidth - canvasScaleDown) * 3);
  drawEntireWorld();
}

function initWorlds() {
  let worldWidth = (windowWidth - canvasScaleDown) / boxSize;
  let worldHeight = (windowHeight - canvasScaleDown) / boxSize;
  for (let i = 0 ; i < worldWidth ; i++) {
    if (!currentWorld[i]) {
      currentWorld[i] = [];
    }
    if (!futureWorld[i]) {
      futureWorld[i] = [];
    }
    for (let j = 0; j < worldHeight; j++) {
      currentWorld[i][j] = false;
      futureWorld[i][j] = false;
    }
  }
}

function randomBlinkers(numberBlinkers) {
  // let's choose some random starting points
  while (numberBlinkers > 0) {
    let randomX = randomInt(1, currentWorld.length - 1);
    let randomY = randomInt(1, currentWorld[0].length - 1);
    currentWorld[randomX - 1][randomY] = true;
    currentWorld[randomX][randomY] = true;
    currentWorld[randomX + 1][randomY] = true;
    numberBlinkers--;
  }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function iterateMatrix(matrix, lambda) {
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[0].length; j++) {
      lambda(i, j, matrix[i][j]);
    }
  }
}

function mod(num, max) {
  return (num + max) % max;
}

function neighbors(matrix, i, j) {
  let neighborList = [];
  // weird because of wrap around
  for (let k = mod(i - 1, matrix.length); k != mod(i + 2, matrix.length) ; k = mod(k + 1, matrix.length)) {
    for (let l = mod(j - 1, matrix[0].length); l != mod(j + 2, matrix[0].length) ; l = mod(l + 1, matrix[0].length)) {
      if (k != i || l != j) {
        neighborList.push(matrix[k][l]);
      }
    }
  }
  return neighborList;
}

function simulateCell(i, j, val) {
  let neighborList = neighbors(currentWorld, i, j)
  let numNeighbors = neighborList.map((x) => x ? 1 : 0).reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  if (val) {
    // live cell: does it die?
    if (numNeighbors < 2 || numNeighbors > 3) {
      futureWorld[i][j] = false;
      updated.push([i,j]);
    } else {
      futureWorld[i][j] = true;
    }
  } else {
    // dead cell: should it spawn?
    if (numNeighbors == 3) {
      futureWorld[i][j] = true;
      updated.push([i,j]);
    }
  }
}

function keyPressed() {
  if (keyCode === SPACEBAR) {
    simulating = !simulating;
    // we redraw to get the grid lines back up
    drawEntireWorld();
  } else if (keyCode === UP_ARROW) {
    targetFramerate++;
    frameRate(targetFramerate);
  } else if (keyCode === DOWN_ARROW) {
    targetFramerate--;
    frameRate(targetFramerate);
  }
}

function mouseClicked() {
  mouseDragged();
}

function mouseDragged() {
  // we only care if we aren't currently simulating
  if (!simulating) {
    // find the box the mouse clicked
    let boxX = Math.floor(mouseX / boxSize);
    let boxY = Math.floor(mouseY / boxSize);
    // set to on (no way to set to off right now)
    currentWorld[boxX][boxY] = true;
    updated.push([boxX, boxY]);
  }
}

function drawBox(i, j, val) {
  if (val) {
    fill(boxHue, boxSaturation, boxBrightness);
  } else {
    fill(0, 0, 0);
  }
  square(i * boxSize, j * boxSize, boxSize);
}

function drawEntireWorld() {
  if (simulating) {
    strokeWeight(0);
  } else {
    strokeWeight(1);
  }
  iterateMatrix(currentWorld, drawBox);
}

function drawUpdated() {
  if (simulating) {
    strokeWeight(0);
  } else {
    strokeWeight(1);
  }
  for ([x,y] of updated) {
    drawBox(x, y, currentWorld[x][y])
  }
  updated = [];
}

function draw() {
  // draw world
  drawUpdated();

  // simulate world
  if (simulating) {
    // evaluate future state
    iterateMatrix(currentWorld, simulateCell);

    // set future state
    currentWorld = structuredClone(futureWorld);
  }

  // UI
  let scaleFac = targetFramerate < 10 ? 1 : 1.5; // 1 if framerate < 10, ? otherwise
  fill(0, 0, 0);
  rect(0, 0, 40 * scaleFac, 60);
  fill(0, 0, 100);
  textSize(15);
  text(Math.round(frameRate()) + "/" + targetFramerate, 10, 20);
  textSize(20);
  text(simulating ? "▶️" : "⏸️", 8 * (scaleFac * 1.3), 45);

  // update box color
  if (timeStep >= boxChangeTime) {
    timeStep = 0;
    boxHue += boxChangeRate;
    boxHue %= 360;
    if (boxSaturation >= 100) {
      boxSaturation -= boxChangeRate;
    } else if (boxSaturation <= 70) {
      boxSaturation += boxChangeRate;
    } else {
      boxSaturation += randomInt(-1, 1) * boxChangeRate;
    }
    if (boxBrightness >= 100) {
      boxBrightness -= boxChangeRate;
    } else if (boxBrightness <= 70) {
      boxBrightness += boxChangeRate;
    } else {
      boxBrightness += randomInt(-1, 1) * boxChangeRate;
    }
  }
  timeStep++;
}