const canvas = document.getElementById('canvas');

const screen = {
  w: window.innerWidth,
  h: window.innerHeight
};

canvas.setAttribute('width', screen.w);
canvas.setAttribute('height', screen.h);

const ctx = canvas.getContext('2d');

ctx.rect(100, 100, 100, 100);
ctx.fill();

