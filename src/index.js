/* globals Promise, createImageBitmap */

const canvas = document.getElementById('canvas');

const screen = new Screen();

const ctx = canvas.getContext('2d');

const assets = ['mullet.jpg', 'man.jpg', 'bart.gif', 'philosophy.jpg', 'hipster.jpg'];

const STATE = {
  previousTime: +new Date,
  changeDelay: 5000, // in ms
  currentImage: '',
  numClones: 15
};

lifecycle();

function lifecycle() {
  return loadImg(getAssetPath())
    .then(getImageData)
    .then(prepareImageData)
    .then(render)
    .then(lifecycle);
}

function getAssetPath() {
  return `assets/${assets[rand(assets.length)]}`;
}

function Screen() {
  this.w = window.innerWidth;
  this.h = window.innerHeight;
  this.center = getCenterCoords(this.w, this.h);

  function setCanvasSize() {
    let { innerWidth: w, innerHeight: h } = window;

    this.w = w;
    this.h = h;
    this.center = getCenterCoords(this.w, this.h);

    canvas.setAttribute('width', w);
    canvas.setAttribute('height', h);
  }

  window.addEventListener('resize', setCanvasSize.bind(this));

  setCanvasSize.call(this);
}

function loadImg(src) {
  return new Promise((resolve, reject) => {
    const mulletImg = new Image();
    mulletImg.src = src;
    mulletImg.onload = function() { resolve(this); };
    mulletImg.onerror = reject;
  });
}

function getImageData(imageNode) {
  ctx.drawImage(imageNode, 0, 0);

  const imageData = ctx.getImageData(0,
    0,
    Math.min(imageNode.width, screen.w),
    Math.min(imageNode.height, screen.h)
  );

  ctx.clearRect(0, 0, screen.w, screen.h);

  return Promise.resolve(imageData);
}

function prepareImageData(imageData) {
  const keyedImageData = removeAlphaFromImageData(imageData, {
    red: imageData.data[0],
    green: imageData.data[1],
    blue: imageData.data[2]
  });

  return createImageBitmap(
    keyedImageData,
    0,
    0,
    keyedImageData.width,
    keyedImageData.height
  );
}

function removeAlphaFromImageData(imageData, colorKey) {
  const tolerance = 170;

  for (let i = 0, n = imageData.data.length; i < n; i += 4) {
    let diff =
      Math.abs(imageData.data[i] - colorKey.red) +
      Math.abs(imageData.data[i + 1] - colorKey.green) +
      Math.abs(imageData.data[i + 2] - colorKey.blue);

    imageData.data[i + 3] = (diff * diff) / tolerance;
  }

  return imageData;
}

function drawClones(imageData) {
  let i = STATE.numClones;
  const imageCenter = getCenterCoords(imageData.width, imageData.height);

  while (i--) {
    let { x, y } = getClonePosition(imageData, imageCenter, i + 1);
    ctx.drawImage(imageData, x, y);
  }
}

function getClonePosition(imageData, { y: imageY0 }, index) {
  const time = +new Date;

  return {
    x: screen.center.x + imageData.width / 4 - (50 * Math.sin(time / 6000) + (index * 80)),
    y: screen.center.y - imageY0 - (100 * Math.sin(time / 1000 * (index + 4) * Math.PI / 32)),
  };
}

function getCenterCoords(width, height) {
  return {
    x: width / 2,
    y: height / 2
  };
}

function render(sprite) {
  let resolve;

  // requestAnimationFrame eats 4x more CPU than
  // interval drawing every 40ms
  // not 60 fps but nobody needs that here
  let intervalId = setInterval(draw, 40);

  return new Promise(_resolve_ => {
    resolve = _resolve_;
    draw();
  });

  function draw() {
    const time = +new Date;

    ctx.clearRect(0, 0, screen.w, screen.h);
    drawClones(sprite);

    if (time >= STATE.previousTime + STATE.changeDelay) {
      STATE.previousTime = time;
      clearInterval(intervalId);
      resolve();
    }
  }
}

function rand(n) {
  return Math.floor(Math.random() * n);
}

document.querySelector('audio').volume = 0.4;
