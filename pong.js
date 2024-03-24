#!/usr/bin/env node

const { emitKeypressEvents } = require("readline");
const { stdin, stdout } = process;

const TICK_TIMEOUT = 120;

const BOX = {
  TOP_LEFT_CORNER: "\u250C",
  TOP_RIGHT_CORNER: "\u2510",
  BOTTOM_LEFT_CORNER: "\u2514",
  BOTTOM_RIGHT_CORNER: "\u2518",
  HORIZONTAL_LINE: "\u2500",
  VERTICAL_LINE: "\u2502",
  PADDLE: "\u2588",
  BALL: "\u2B24",
  RESET_COLOR: "\x1b[0m",
  SET_YELLOW_COLOR: "\x1b[1;33m",
};

const { columns, rows } = stdout;

const cursorTo = (row = 1, column = 1) => stdout.cursorTo(column - 1, row - 1);
const moveCursor = (h, v) => stdout.moveCursor(h, v);
const clearScreen = () => stdout.write("\x1b[2J");
const showCursor = () => stdout.write("\x1b[?25h");
const hideCursor = () => stdout.write("\x1b[?25l");
const output = (data) => stdout.write(data);

const drawBoard = () => {
  let i = -1;

  clearScreen();
  cursorTo(1, 1);

  for (i = 0; i < columns; ++i) {
    if (i === 0) output(BOX.TOP_LEFT_CORNER);
    else if (i === columns - 1) output(BOX.TOP_RIGHT_CORNER);
    else output(BOX.HORIZONTAL_LINE);
  }

  cursorTo(2, columns);

  for (i = 0; i < rows; ++i) {
    if (i === rows - 1) output(BOX.BOTTOM_RIGHT_CORNER);
    else output(BOX.VERTICAL_LINE);
    moveCursor(0, 1);
  }

  cursorTo(rows, columns - 1);

  for (i = 0; i < columns - 1; ++i) {
    if (i === columns - 2) output(BOX.BOTTOM_LEFT_CORNER);
    else output(BOX.HORIZONTAL_LINE);
    moveCursor(-2, 0);
  }

  cursorTo(rows - 1, 1);

  for (i = 0; i < rows - 2; ++i) {
    output(BOX.VERTICAL_LINE);
    moveCursor(-1, -1);
  }
};

const endGame = (message) => {
  showCursor();
  cursorTo(1, 1);
  clearScreen();
  console.log(message);
  return process.exit(0);
};

stdin.on("keypress", (_, key) => {
  if (key.ctrl && key.name === "c") {
    return endGame(`Final Score ${paddle1.score} - ${paddle2.score}.`);
  }
  switch (key.name) {
    case "w":
      paddle1.velX = -1;
      break;
    case "up":
      paddle2.velX = -1;
      break;
    case "d":
      paddle1.velX = 1;
      break;
    case "down":
      paddle2.velX = 1;
      break;
  }
});

const clearPaddle = (paddle) => {
  cursorTo(paddle.v + 1, paddle.h + 1);
  for (let i = 0; i < 3; i++) {
    output(" ");
    moveCursor(-1, 1);
  }
};

const movePaddle = (paddle) => {
  if (
    (paddle.v === rows - paddle.height - 1 && paddle.velX === 1) ||
    (paddle.v === 1 && paddle.velX === -1)
  ) {
    paddle.velX = 0;
  } else {
    paddle.v += paddle.velX;
  }
};

const drawPaddle = (paddle) => {
  if (paddle.velX !== 0) {
    clearPaddle(paddle);
  }
  movePaddle(paddle);
  cursorTo(paddle.v + 1, paddle.h + 1);
  for (let i = 0; i < paddle.height; i++) {
    output(BOX.PADDLE);
    moveCursor(-1, 1);
  }
};

const clearBall = (ball) => {
  cursorTo(ball.v, ball.h);
  output(" ");
};

const resetBall = (ball) => {
  ball.h = Math.floor(columns / 2);
  ball.v = Math.floor(rows / 2);
  ball.velX = Math.random() < 0.5 ? 1 : -1;
  ball.velY = Math.random() < 0.5 ? 1 : -1;
};

const moveBall = (ball) => {
  if (ball.v === 2) {
    ball.velY *= -1;
  }

  if (ball.v === rows - 1) {
    ball.velY *= -1;
  }

  if (ball.h === 3) {
    paddle2.score++;
    resetBall(ball);
  }

  if (ball.h === columns - 4) {
    paddle1.score++;
    resetBall(ball);
  }

  if (
    ball.h + ball.velX === paddle1.h + 1 &&
    ball.v >= paddle1.v &&
    ball.v <= paddle1.v + paddle1.height
  ) {
    ball.velX *= -1;
  }

  if (
    ball.h + ball.velX === paddle2.h &&
    ball.v >= paddle2.v &&
    ball.v <= paddle2.v + paddle2.height
  ) {
    ball.velX *= -1;
  }

  ball.h += ball.velX;
  ball.v += ball.velY;
};

const drawBall = (ball) => {
  clearBall(ball);
  moveBall(ball);
  output(BOX.SET_YELLOW_COLOR);
  cursorTo(ball.v, ball.h);
  output(BOX.BALL);
  output(BOX.RESET_COLOR);
};

const paddle1 = {
  height: 3,
  v: 10,
  h: 5,
  velX: 0,
  score: 0,
};

const paddle2 = {
  height: 3,
  v: 10,
  h: columns - 5,
  velX: 0,
  score: 0,
};

const ball = {
  v: Math.floor(rows / 2),
  h: Math.floor(columns / 2),
  velX: Math.random() < 0.5 ? 1 : -1,
  velY: Math.random() < 0.5 ? 1 : -1,
};

emitKeypressEvents(stdin);
stdin.setRawMode(true);
stdin.setEncoding("utf8");

hideCursor();
drawBoard();

const render = () => {
  cursorTo(1, 2);
  console.log(`${paddle1.score}-${paddle2.score}`);
  [paddle1, paddle2].forEach((paddle) => {
    drawPaddle(paddle);
  });
  drawBall(ball);
};

mainTicks = setInterval(render, TICK_TIMEOUT);
stdout.on("drain", () => {
  clearInterval(mainTicks);
  mainTicks = setInterval(render, TICK_TIMEOUT);
});
