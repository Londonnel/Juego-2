// Referencias del canvas y contexto
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Variables globales para el tamaño y posición
let laneWidth;
let marginX;

const roadWidth = 300;
const laneCount = 3;

function calculateLaneWidth() {
  laneWidth = roadWidth / laneCount;
  marginX = (canvas.width - roadWidth) / 2;
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  calculateLaneWidth();
  player.x = marginX + player.lane * laneWidth + (laneWidth - player.width) / 2;
  player.y = canvas.height - 100;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Imágenes
const playerImage = new Image();
playerImage.src = 'images/player.png';
const enemyImage = new Image();
enemyImage.src = 'images/enemy.png';

let player = {
  x: 0,
  y: 0,
  width: 50,
  height: 80,
  color: "lime",
  lane: 1
};

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
    ctx.fillStyle = obj.color;
    ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
  }
}

function spawnEnemy() {
  const lane = Math.floor(Math.random() * laneCount);
  const enemy = {
    x: marginX + lane * laneWidth + (laneWidth - 50) / 2,
    y: -100,
    width: 50,
    height: 80,
    color: "red"
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
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const finalScoreText = document.getElementById('finalScore');
const backToStartBtn = document.getElementById('backToStartBtn');
const highScoreList = document.getElementById('highScores');

backToStartBtn.addEventListener('click', showStartScreen);
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

function showStartScreen() {
  isGameRunning = false;
  startScreen.style.display = 'flex';
  gameOverScreen.style.display = 'none';
}

function showGameOverScreen() {
  isGameRunning = false;
  finalScoreText.innerText = `Puntuación final: ${score}`;
  saveHighScore(score);
  displayHighScores();
  gameOverScreen.style.display = 'flex';
  startScreen.style.display = 'none';
}

function saveHighScore(score) {
  const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
  const name = prompt("¡Nuevo récord! Ingresa tu nombre:");
  highScores.push({ name: name || "Anónimo", score });
  highScores.sort((a, b) => b.score - a.score);
  highScores.splice(5);
  localStorage.setItem('highScores', JSON.stringify(highScores));
}

function displayHighScores() {
  const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
  highScoreList.innerHTML = "<h3>🏆 Récords:</h3>" + highScores.map(s => `<p>${s.name}: ${s.score}</p>`).join('');
}

function resetGame() {
  score = 0;
  lives = 3;
  enemySpeed = 5;
  enemies = [];
  spawnTimer = 0;
  player.lane = 1;
  player.x = marginX + laneWidth + (laneWidth - player.width) / 2;
  player.y = canvas.height - 100;
  document.getElementById('score').innerText = `Score: ${score}`;
  document.getElementById('lives').innerText = `Lives: ${lives}`;
}

function startGame() {
  resetGame();
  isGameRunning = true;
  startScreen.style.display = 'none';
  gameOverScreen.style.display = 'none';
  update();
}

// Controles por teclado y foco
window.addEventListener('load', () => {
  document.body.setAttribute('tabindex', '0');
  document.body.focus();
});

['touchstart', 'click'].forEach(event =>
  document.addEventListener(event, () => document.body.focus())
);

document.addEventListener("keydown", function (e) {
  if (e.code === "Enter" || e.code === "NumpadEnter") {
    if (!isGameRunning && (startScreen.style.display === 'flex' || gameOverScreen.style.display === 'flex')) {
      startGame();
    }
    e.preventDefault();
    return;
  }

  if (isGameRunning) {
    if (e.code === "ArrowLeft" && player.lane > 0) {
      player.lane--;
    } else if (e.code === "ArrowRight" && player.lane < laneCount - 1) {
      player.lane++;
    }
    player.x = marginX + player.lane * laneWidth + (laneWidth - player.width) / 2;
  }
});

// Controles táctiles por pantalla
canvas.addEventListener("touchstart", function (e) {
  const touchX = e.touches[0].clientX;
  const canvasRect = canvas.getBoundingClientRect();
  const relativeX = touchX - canvasRect.left;

  if (relativeX < canvas.width / 2 && player.lane > 0) {
    player.lane--;
  } else if (relativeX >= canvas.width / 2 && player.lane < laneCount - 1) {
    player.lane++;
  }

  player.x = marginX + player.lane * laneWidth + (laneWidth - player.width) / 2;
});

// Botones táctiles
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

leftBtn.addEventListener('touchstart', () => {
  if (player.lane > 0) {
    player.lane--;
    player.x = marginX + player.lane * laneWidth + (laneWidth - player.width) / 2;
  }
});

rightBtn.addEventListener('touchstart', () => {
  if (player.lane < laneCount - 1) {
    player.lane++;
    player.x = marginX + player.lane * laneWidth + (laneWidth - player.width) / 2;
  }
});

showStartScreen();
