const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Load images
const bgImg = new Image();
bgImg.src = "background.png";

const groundImg = new Image();
groundImg.src = "ground.png";

const birdImg = new Image();
birdImg.src = "bird.png";

// Load sounds
const jumpSound = new Audio("jump.mp3");
const gameOverSound = new Audio("gameover.mp3");

// Game state variables
let birdY = 150;
let birdVelocity = 0;
const gravity = 0.5;
const jump = -8;

const groundHeight = 50;
const pipeGap = 120;

let pipes = [];
let frame = 0;
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;

let isGameOver = false;
let gameStarted = false;
let isPaused = false;
let animationFrameId;

// Jump handler
function jumpBird() {
  if (!gameStarted || isGameOver || isPaused) return;
  birdVelocity = jump;
  jumpSound.currentTime = 0;
  jumpSound.play();
}

// Game controls
document.addEventListener("keydown", (e) => {
  if (e.code === "KeyP" && gameStarted && !isGameOver) togglePause();
  else jumpBird();
});
document.addEventListener("touchstart", jumpBird);

// Start game
function startGame() {
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameOverScreen").style.display = "none";
  document.getElementById("pauseBtn").style.display = "block";
  canvas.style.display = "block";

  resetGame();
  gameStarted = true;
  draw();
}

// Restart game
function restartGame() {
  startGame();
}

// Reset game state
function resetGame() {
  birdY = 150;
  birdVelocity = 0;
  pipes = [];
  frame = 0;
  score = 0;
  isGameOver = false;
  isPaused = false;
  document.getElementById("pauseBtn").innerText = "Pause";
}

// Pause/Resume
function togglePause() {
  isPaused = !isPaused;
  const btn = document.getElementById("pauseBtn");
  btn.innerText = isPaused ? "Resume" : "Pause";

  if (!isPaused) {
    draw();
  } else {
    cancelAnimationFrame(animationFrameId);
  }
}

// Main draw loop
function draw() {
  if (isGameOver || !gameStarted || isPaused) return;

  // Background
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  // Bird physics
  birdVelocity += gravity;
  birdY += birdVelocity;

  // Bird
  ctx.drawImage(birdImg, 50, birdY, 30, 30);

  // Pipes
  if (frame % 90 === 0) {
    const topHeight = Math.random() * 200 + 50;
    pipes.push({ x: 320, top: topHeight });
  }

  for (let i = 0; i < pipes.length; i++) {
    const p = pipes[i];
    p.x -= 2;

    ctx.fillStyle = "green";
    ctx.fillRect(p.x, 0, 50, p.top);
    ctx.fillRect(p.x, p.top + pipeGap, 50, canvas.height - groundHeight - (p.top + pipeGap));

    if (
      50 + 30 > p.x &&
      50 < p.x + 50 &&
      (birdY < p.top || birdY + 30 > p.top + pipeGap)
    ) {
      triggerGameOver();
      return;
    }

    if (p.x + 50 === 50) score++;
  }

  // Ground
  ctx.drawImage(groundImg, 0, canvas.height - groundHeight, canvas.width, groundHeight);

  // Collision with ground or top
  if (birdY + 30 > canvas.height - groundHeight || birdY < 0) {
    triggerGameOver();
    return;
  }

  // Score display
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);
  ctx.fillText("Best: " + bestScore, 10, 60);

  frame++;
  animationFrameId = requestAnimationFrame(draw);
}

// Game Over
function triggerGameOver() {
  isGameOver = true;

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestScore", bestScore);
  }

  gameOverSound.currentTime = 0;
  gameOverSound.play();

  document.getElementById("finalScore").innerText = `Score: ${score} | Best: ${bestScore}`;
  document.getElementById("gameOverScreen").style.display = "block";
  document.getElementById("pauseBtn").style.display = "none";
}