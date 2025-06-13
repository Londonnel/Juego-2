// game.js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  calculatePlayerPosition();
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const roadWidth = 300;
const laneCount = 3;
const laneWidth = roadWidth / laneCount;
let marginX = (canvas.width - roadWidth) / 2;

const playerImage = new Image();
playerImage.src = 'images/player.png';

const enemyImage = new Image();
enemyImage.src = 'images/enemy.png';

let player = {
  x: 0,
  y: 0,
  width: 50,
  height: 80,
  lane: 1
};

function calculatePlayerPosition() {
  marginX = (canvas.width - roadWidth) / 2;
  player.x = marginX + player.lane * laneWidth + (laneWidth - player.width) / 2;
  player.y = canvas.height - player.height - 20;
}

calculatePlayerPosition();

let enemies = [];
let enemySpeed = 5;
let spawnTimer = 0;

let score = 0;
let lives = 3;
let isGameRunning = false;

const crashSound = new Audio('sounds/crash.mp3');

function drawObject(obj, image) {
  if (image && image.complete) {
    ctx.drawImage(image, obj.x, obj.y, obj.width, obj.height);
  } else {
    ctx.fillStyle = obj.color || '#0f0';
    ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
  }
}

function spawnEnemy() {
  const lane = Math.floor(Math.random() * laneCount);
  const enemy = {
    x: marginX + lane * laneWidth + (laneWidth - 50) / 2,
    y: -100,
    width: 50,
    height: 80
  };
  enemies.push(enemy);
}

function update() {
  if (!isGameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawObject(player, playerImage);

  for (let i = 0; i < enemies.length; i++) {
    enemies[i].y += enemySpeed;
    drawObject(enemies[i], enemyImage);

    if (
      player.x < enemies[i].x + enemies[i].width &&
      player.x + player.width > enemies[i].x &&
      player.y < enemies[i].y + enemies[i].height &&
      player.y + player.height > enemies[i].y
    ) {
      crashSound.play();
      enemies.splice(i, 1);
      lives--;
      document.getElementById('lives').innerText = `Lives: ${lives}`;
      if (lives <= 0) {
        showGameOverScreen();
        return;
      }
      break;
    }
  }

  enemies = enemies.filter(e => e.y < canvas.height);

  spawnTimer++;
  if (spawnTimer > 60) {
    spawnEnemy();
    spawnTimer = 0;
  }

  score++;
  document.getElementById('score').innerText = `Score: ${score}`;
  if (score % 100 === 0) enemySpeed += 1;

  requestAnimationFrame(update);
}

// Pantallas y botones
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const namePrompt = document.getElementById('namePrompt');
const playerNameInput = document.getElementById('playerName');
const saveScoreBtn = document.getElementById('saveScoreBtn');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const backToStartBtn = document.getElementById('backToStartBtn');
const finalScoreText = document.getElementById('finalScore');

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
backToStartBtn.addEventListener('click', showStartScreen);
saveScoreBtn.addEventListener('click', saveEnteredName);

function handleKeyDown(e) {
  if (e.key === "Enter") {
    if (!isGameRunning) {
      if (startScreen.style.display === "flex" || startScreen.style.display === "") {
        startGame();
      } else if (gameOverScreen.style.display === "flex") {
        startGame();
      } else if (pauseScreen.style.display === "flex") {
        resumeGame();
      }
    }
  }

  if (isGameRunning) {
    if (e.key === "ArrowLeft" && player.lane > 0) {
      player.lane--;
      calculatePlayerPosition();
    } else if (e.key === "ArrowRight" && player.lane < laneCount - 1) {
      player.lane++;
      calculatePlayerPosition();
    } else if (e.key === "Escape") {
      pauseGame();
    }
  }
}

document.addEventListener("keydown", handleKeyDown);

canvas.addEventListener("touchstart", function (e) {
  const touchX = e.touches[0].clientX;
  const canvasRect = canvas.getBoundingClientRect();
  const relativeX = touchX - canvasRect.left;

  if (relativeX < canvas.width / 2 && player.lane > 0) {
    player.lane--;
  } else if (relativeX >= canvas.width / 2 && player.lane < laneCount - 1) {
    player.lane++;
  }
  calculatePlayerPosition();
});

document.getElementById('leftBtn').addEventListener('touchstart', () => {
  if (player.lane > 0) {
    player.lane--;
    calculatePlayerPosition();
  }
});

document.getElementById('rightBtn').addEventListener('touchstart', () => {
  if (player.lane < laneCount - 1) {
    player.lane++;
    calculatePlayerPosition();
  }
});

function resetGame() {
  score = 0;
  lives = 3;
  enemySpeed = 5;
  enemies = [];
  spawnTimer = 0;
  player.lane = 1;
  calculatePlayerPosition();
  document.getElementById('score').innerText = `Score: ${score}`;
  document.getElementById('lives').innerText = `Lives: ${lives}`;
}

function startGame() {
  resetGame();
  isGameRunning = true;
  startScreen.style.display = 'none';
  gameOverScreen.style.display = 'none';
  namePrompt.style.display = 'none';
  update();
}

function showStartScreen() {
  isGameRunning = false;
  startScreen.style.display = 'flex';
  gameOverScreen.style.display = 'none';
  namePrompt.style.display = 'none';
}

function showGameOverScreen() {
  isGameRunning = false;
  finalScoreText.innerText = `Puntuación final: ${score}`;
  namePrompt.style.display = 'flex';
  playerNameInput.focus();
}

function saveEnteredName() {
  const name = playerNameInput.value.trim() || "Anónimo";
  const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
  highScores.push({ name, score });
  highScores.sort((a, b) => b.score - a.score);
  highScores.splice(5);
  localStorage.setItem('highScores', JSON.stringify(highScores));
  namePrompt.style.display = 'none';
  displayHighScores();
  gameOverScreen.style.display = 'flex';
}

function displayHighScores() {
  const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
  const highScoreList = document.getElementById('highScores');
  highScoreList.innerHTML = "<h3>🏆 Récords:</h3>" + highScores.map(s => `<p>${s.name}: ${s.score}</p>`).join('');
}

window.addEventListener('load', () => {
  setTimeout(() => {
    document.body.focus();
  }, 100);
});

window.addEventListener('click', () => {
  document.body.focus();
});

