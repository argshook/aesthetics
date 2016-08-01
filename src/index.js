/* globals Promise, createImageBitmap */
const canvas = document.getElementById('canvas');

const screen = new Screen();

const ctx = canvas.getContext('2d');

loadImg('assets/mullet.jpg')
  .then(getImageData)
  .then(imageData =>
    removeAlphaFromImageData(imageData, {
      red: imageData.data[0],
      green: imageData.data[1],
      blue: imageData.data[2]
    }
  ))

  .then(keyedImageData => createImageBitmap(keyedImageData, 0, 0, screen.w, screen.h))

  .then(sprite => {
    canvas.addEventListener('mousemove', ({ layerX: x, layerY: y }) => {
      window.requestAnimationFrame(() => {
        ctx.clearRect(0, 0, screen.w, screen.h);
        drawClones(sprite, { x, y });
      })
    });
  });

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

  const imageData = ctx.getImageData(0, 0, screen.w, screen.h);
  ctx.clearRect(0, 0, screen.w, screen.h);

  return Promise.resolve(imageData);
}

function removeAlphaFromImageData(imageData, colorKey) {
  const tolerance = 230;

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

function drawClones(imageData, { x, y }) {
  const sizeToCut = 0;

  ' '
    .repeat(10)
    .split('')
    .forEach((_, i, { length }) => {
      ctx.drawImage(
        imageData,
        i < length - 1 ? (x - screen.w / 2) + i * 20 : 0,
        i < length - 1 ? (y - screen.h / 2) + i * 20 : 0
      );
    });
}

