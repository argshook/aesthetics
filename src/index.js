/* globals Promise, createImageBitmap */

const canvas = document.getElementById('canvas');

const screen = new Screen();

const ctx = canvas.getContext('2d');

const assets = [ 'mullet.jpg', 'what.png', 'thanks.jpg', 'gif.gif' ];

loadImg(`assets/${assets[rand(assets.length)]}`)
  .then(getImageData)
  .then(imageData =>
    removeAlphaFromImageData(imageData, {
      red: imageData.data[0],
      green: imageData.data[1],
      blue: imageData.data[2]
    }
  ))

  .then(keyedImageData =>
    createImageBitmap(
      keyedImageData,
      0,
      0,
      keyedImageData.width,
      keyedImageData.height
    )
  )

  .then(render);

function Screen() {
  this.w = window.innerWidth;
  this.h = window.innerHeight;

  let setCanvasSize = function() {
    let { innerWidth: w, innerHeight: h } = window;

    this.w = w;
    this.h = h;

    canvas.setAttribute('width', w);
    canvas.setAttribute('height', h);
  }.bind(this);

  window.addEventListener('resize', setCanvasSize);

  setCanvasSize();
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

function removeAlphaFromImageData(imageData, colorKey) {
  const tolerance = 180;

  for (let i = 0, n = imageData.data.length; i < n; i += 4) {
    let diff =
      Math.abs(imageData.data[i] - colorKey.red) +
      Math.abs(imageData.data[i + 1] - colorKey.green) +
      Math.abs(imageData.data[i + 2] - colorKey.blue);

    if (diff < tolerance) {
      // set alpha channel
      imageData.data[i + 3] = 0;
    }
  }

  return imageData;
}

const numClones = 10;
function drawClones(imageData, mousePosition) {
  let i = numClones;

  while (i--) {
    let { x, y } = getClonePosition(imageData, mousePosition, i);
    ctx.drawImage(imageData, x, y);
  }
}

function getClonePosition(imageData, { x: mouseX, y: mouseY }, index) {
  const { x: canvasX0, y: canvasY0 } = getCenterCoords(screen.w, screen.h);
  const { x: imageX0, y: imageY0 } = getCenterCoords(imageData.width, imageData.height);
  const { x: mouseX0, y: mouseY0 } = { x: canvasX0 - mouseX, y: canvasY0 - mouseY };

  return {
    x: (20 * Math.sin(+new Date / 800 * (Math.PI / 2)) + canvasX0 - imageX0 - mouseX0 * index),
    y: (10 * Math.sin((+new Date + index * 1000) / 100 * (Math.PI / 16)) + canvasY0 - imageY0 - mouseY0 * index)
  };
}

function getCenterCoords(width, height) {
  return {
    x: width / 2,
    y: height / 2
  };
}

function render(sprite) {
  let { x, y } = {
    x: screen.w / 2 - 100,
    y: (20 * Math.sin(+new Date / 2000 * (Math.PI / 2)) + screen.h / 2)
  };

  ctx.clearRect(0, 0, screen.w, screen.h);
  drawClones(sprite, { x, y });
  window.requestAnimationFrame(() => render(sprite));
}

function rand(n) {
  return Math.floor(Math.random() * n);
}

