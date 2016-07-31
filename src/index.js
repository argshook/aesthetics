/* globals Promise, createImageBitmap */
const canvas = document.getElementById('canvas');

const screen = {
  w: window.innerWidth,
  h: window.innerHeight
};

canvas.setAttribute('width', screen.w);
canvas.setAttribute('height', screen.h);

const ctx = canvas.getContext('2d');

loadImg('assets/mullet.jpg')
  .then(img => {
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, screen.w, screen.h);
    ctx.clearRect(0, 0, screen.w, screen.h);

    return getKeyedImageData(imageData, {
      red: imageData.data[0],
      green: imageData.data[1],
      blue: imageData.data[2]
    });
  })
  .then(keyedImageData => {
    return createImageBitmap(keyedImageData, 0, 0, screen.w, screen.h)
  })
  .then(sprite => {
    canvas.addEventListener('mousemove', ({ layerX: x, layerY: y }) => {
      window.requestAnimationFrame(() => {
        ctx.clearRect(0, 0, screen.w, screen.h);
        drawClones(sprite, { x, y });
      })
    });
  });


function loadImg(src) {
  return new Promise((resolve, reject) => {
    const mulletImg = new Image();
    mulletImg.src = src;
    mulletImg.onload = function() { resolve(this); };
    mulletImg.onerror = reject;
  });
}

function getKeyedImageData(imageData, key) {
  const tolerance = 230;

  for (let i = 0, n = imageData.data.length; i < n; i += 4) {
    let diff =
      Math.abs(imageData.data[i] - key.red) +
      Math.abs(imageData.data[i + 1] - key.green) +
      Math.abs(imageData.data[i + 2] - key.blue);

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

