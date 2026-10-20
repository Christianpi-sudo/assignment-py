const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerScoreEl = document.getElementById('playerScore');
const cpuScoreEl = document.getElementById('cpuScore');

const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;
const PADDLE_WIDTH = 14;
const PADDLE_HEIGHT = 90;
const PADDLE_SPEED = 7;
const BALL_RADIUS = 10;

let playerScore = 0;
let cpuScore = 0;

let leftPaddle = {
  x: 20,
  y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  speed: PADDLE_SPEED,
};

let rightPaddle = {
  x: GAME_WIDTH - 20 - PADDLE_WIDTH,
  y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  speed: 5.2,
};

let ball = {
  x: GAME_WIDTH / 2,
  y: GAME_HEIGHT / 2,
  radius: BALL_RADIUS,
  speedX: 5,
  speedY: 3,
};

const keys = {
  ArrowUp: false,
  ArrowDown: false,
};

let mouseY = GAME_HEIGHT / 2;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateScoreboard() {
  playerScoreEl.textContent = playerScore;
  cpuScoreEl.textContent = cpuScore;
}

function resetBall(direction = 1) {
  ball.x = GAME_WIDTH / 2;
  ball.y = GAME_HEIGHT / 2;

  const angle = (Math.random() * 1.4 - 0.7);
  const speed = 5.5;

  ball.speedX = speed * direction;
  ball.speedY = speed * angle;
}

function updateLeftPaddle() {
  const mouseTarget = mouseY - leftPaddle.height / 2;

  if (keys.ArrowUp || keys.ArrowDown) {
    if (keys.ArrowUp) {
      leftPaddle.y -= leftPaddle.speed;
    }
    if (keys.ArrowDown) {
      leftPaddle.y += leftPaddle.speed;
    }
  } else {
    leftPaddle.y += (mouseTarget - leftPaddle.y) * 0.25;
  }

  leftPaddle.y = clamp(leftPaddle.y, 0, GAME_HEIGHT - leftPaddle.height);
}

function updateRightPaddle() {
  const paddleCenter = rightPaddle.y + rightPaddle.height / 2;

  if (ball.x > GAME_WIDTH / 2) {
    if (paddleCenter < ball.y - 18) {
      rightPaddle.y += rightPaddle.speed;
    } else if (paddleCenter > ball.y + 18) {
      rightPaddle.y -= rightPaddle.speed;
    }
  }

  rightPaddle.y = clamp(rightPaddle.y, 0, GAME_HEIGHT - rightPaddle.height);
}

function handleWallCollision() {
  if (ball.y - ball.radius <= 0) {
    ball.y = ball.radius;
    ball.speedY *= -1;
  } else if (ball.y + ball.radius >= GAME_HEIGHT) {
    ball.y = GAME_HEIGHT - ball.radius;
    ball.speedY *= -1;
  }
}

function handlePaddleCollision() {
  const leftHit =
    ball.x - ball.radius <= leftPaddle.x + leftPaddle.width &&
    ball.x + ball.radius >= leftPaddle.x &&
    ball.y >= leftPaddle.y &&
    ball.y <= leftPaddle.y + leftPaddle.height &&
    ball.speedX < 0;

  const rightHit =
    ball.x + ball.radius >= rightPaddle.x &&
    ball.x - ball.radius <= rightPaddle.x + rightPaddle.width &&
    ball.y >= rightPaddle.y &&
    ball.y <= rightPaddle.y + rightPaddle.height &&
    ball.speedX > 0;

  if (leftHit) {
    ball.x = leftPaddle.x + leftPaddle.width + ball.radius;
    ball.speedX = Math.abs(ball.speedX) + 0.25;
    ball.speedY += (ball.y - (leftPaddle.y + leftPaddle.height / 2)) * 0.12;
  }

  if (rightHit) {
    ball.x = rightPaddle.x - ball.radius;
    ball.speedX = -Math.abs(ball.speedX) - 0.25;
    ball.speedY += (ball.y - (rightPaddle.y + rightPaddle.height / 2)) * 0.12;
  }

  const maxSpeed = 11;
  ball.speedX = clamp(ball.speedX, -maxSpeed, maxSpeed);
  ball.speedY = clamp(ball.speedY, -maxSpeed, maxSpeed);
}

function updateBall() {
  ball.x += ball.speedX;
  ball.y += ball.speedY;

  handleWallCollision();
  handlePaddleCollision();

  if (ball.x - ball.radius <= 0) {
    cpuScore += 1;
    updateScoreboard();
    resetBall(1);
  } else if (ball.x + ball.radius >= GAME_WIDTH) {
    playerScore += 1;
    updateScoreboard();
    resetBall(-1);
  }
}

function drawMiddleLine() {
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 4;
  ctx.setLineDash([12, 16]);
  ctx.beginPath();
  ctx.moveTo(GAME_WIDTH / 2, 0);
  ctx.lineTo(GAME_WIDTH / 2, GAME_HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawPaddle(paddle) {
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
  ctx.beginPath();
  ctx.fillStyle = '#f472b6';
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
}

function render() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  drawMiddleLine();
  drawPaddle(leftPaddle);
  drawPaddle(rightPaddle);
  drawBall();
}

function update() {
  updateLeftPaddle();
  updateRightPaddle();
  updateBall();
}

function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault();
  }

  if (event.key in keys) {
    keys[event.key] = true;
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key in keys) {
    keys[event.key] = false;
  }
});

canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  const relativeY = ((event.clientY - rect.top) / rect.height) * GAME_HEIGHT;
  mouseY = clamp(relativeY, 0, GAME_HEIGHT);
});

updateScoreboard();
resetBall(Math.random() > 0.5 ? 1 : -1);
requestAnimationFrame(gameLoop);
