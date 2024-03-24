const { emitKeypressEvents } = require("readline");
const { stdin, stdout } = process;

// ==================== CONSTANTS ====================

const TICK_TIMEOUT = 150;

const BOX = {
  TOP_LEFT_CORNER: "\u250C",
  TOP_RIGHT_CORNER: "\u2510",
  BOTTOM_LEFT_CORNER: "\u2514",
  BOTTOM_RIGHT_CORNER: "\u2518",
  HORIZONTAL_LINE: "\u2500",
  VERTICAL_LINE: "\u2502",
  PADDLE: "\u2588",
  BALL: "\u2B24",
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

stdin.on("keypress", (str, key) => {
  if (key.ctrl && key.name === "c") {
    return endGame("See you soon again :)");
  }

  switch (key.name) {
    case "up":
      paddle1.move = -1;
      break;
    case "right":
      break;
    case "down":
      paddle1.move = 1;
      break;
    case "left":
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
  if (paddle.move === 1 && paddle.v !== rows - paddle.height - 1) {
    paddle.v++;
  }
  if (paddle.move === -1 && paddle.v !== 1) {
    paddle.v--;
  }
};

const drawPaddle = (paddle) => {
  clearPaddle(paddle);
  movePaddle(paddle);
  cursorTo(paddle.v + 1, paddle.h + 1);
  for (let i = 0; i < paddle.height; i++) {
    output(BOX.PADDLE);
    moveCursor(-1, 1);
  }
};

const drawBall = (ball) => {
  cursorTo(ball.h, ball.v);
  output(BOX.BALL);
};

const paddle1 = {
  height: 3,
  v: 10,
  h: 5,
  move: 0,
};

const paddle2 = {
  height: 3,
  v: 10,
  h: columns - 5,
  move: 0,
};

const ball = {
  h: Math.floor(rows / 2),
  v: Math.floor(columns / 2),
};

emitKeypressEvents(stdin);
stdin.setRawMode(true);
stdin.setEncoding("utf8");

hideCursor();
drawBoard();

const render = () => {
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
