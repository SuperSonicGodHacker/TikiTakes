// Get the canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Constants
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const GRAVITY = 0.5;
const MAX_POWER = 20;
const POWER_INCREMENT = 0.5;
const MAX_MISSES = 5;
const GAME_TIME = 60;
const BOUNCE_FACTOR = 0.7;
const MIN_ANGLE = 0;
const MAX_ANGLE = Math.PI;
const BALL_SPEED = 5;
const CHARACTER_HEIGHT = 60;

// Add the HTML elements for controls
const controlsDiv = document.createElement('div');
controlsDiv.id = 'game-controls';
controlsDiv.style.cssText = 'position: fixed; bottom: 20px; left: 0; right: 0; display: flex; justify-content: space-between; padding: 20px; pointer-events: none;';

const leftControls = document.createElement('div');
leftControls.style.cssText = 'display: flex; gap: 10px; pointer-events: auto;';

const rightControls = document.createElement('div');
rightControls.style.cssText = 'display: flex; gap: 10px; pointer-events: auto; margin-right: 20px;';

// Create buttons
function createButton(text, id) {
    const button = document.createElement('button');
    button.id = id;
    button.textContent = text;
    button.style.cssText = 'width: 60px; height: 60px; font-size: 24px; background: rgba(255,255,255,0.3); border: 2px solid white; color: white; border-radius: 10px; cursor: pointer;';
    return button;
}

const buttons = {
    left: createButton('←', 'btn-left'),
    right: createButton('→', 'btn-right'),
    rotateLeft: createButton('↺', 'btn-rotate-left'),
    rotateRight: createButton('↻', 'btn-rotate-right'),
    shoot: createButton('🏀', 'btn-shoot')
};

// Add buttons to containers
leftControls.appendChild(buttons.left);
leftControls.appendChild(buttons.right);
rightControls.appendChild(buttons.rotateLeft);
rightControls.appendChild(buttons.rotateRight);
rightControls.appendChild(buttons.shoot);

controlsDiv.appendChild(leftControls);
controlsDiv.appendChild(rightControls);

// Add controls to document
document.body.appendChild(controlsDiv);

// Add after the other button creations (around line 40)
const restartButton = document.createElement('button');
restartButton.id = 'btn-restart';
restartButton.textContent = '🔄 Restart';
restartButton.style.cssText = 'position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%); width: 120px; height: 40px; font-size: 20px; background: rgba(255,255,255,0.3); border: 2px solid white; color: white; border-radius: 10px; cursor: pointer; display: none;';
document.body.appendChild(restartButton);

// Colors
const WHITE = '#FFFFFF';
const BLACK = '#000000';
const ORANGE = '#FFA500';
const RED = '#FF0000';
const GREEN = '#00FF00';
const YELLOW = '#FFFF00';
const BLUE = '#0000FF';

// Hoop dimensions
const HOOP_WIDTH = 60;
const HOOP_HEIGHT = 40;
let HOOP_X = CANVAS_WIDTH / 2 - HOOP_WIDTH / 2;
let HOOP_Y = 100;
let currentHoopWidth = HOOP_WIDTH;

// Ball properties
const BALL_RADIUS = 20;
let ball = {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 100,
    velocityX: 0,
    velocityY: 0,
    isMoving: false,
    power: 0,
    angle: 0
};

// Game state
let gameState = {
    isCharging: false,
    isShot: false,
    power: 0,
    angle: 0,
    score: 0,
    shots: 0,
    misses: 0,
    message: '',
    messageTimer: 0,
    isGameOver: false,
    timeRemaining: GAME_TIME,
    difficulty: 1,
    isPaused: false
};

// Input state
const keys = {
    left: false,
    right: false,
    up: false,
    down: false,
    space: false,
    r: false,
    rotateLeft: false,
    rotateRight: false
};

// Add player name variable near the top with other game state variables
let playerName = '';

// Add high score variable
let highScore = parseInt(localStorage.getItem(`${playerName}_highScore`)) || 0;

// Add name prompt function after the resetGame function
function promptPlayerName() {
    const name = prompt("What's your name?", "Player");
    playerName = name || "Player";
    // Load high score for this player
    highScore = parseInt(localStorage.getItem(`${playerName}_highScore`)) || 0;
    return playerName;
}

function drawHoop() {
    // Draw backboard
    ctx.fillStyle = WHITE;
    ctx.fillRect(HOOP_X - 10, HOOP_Y - 60, 20, 120);
    
    // Draw rim
    ctx.fillStyle = RED;
    ctx.fillRect(HOOP_X, HOOP_Y, currentHoopWidth, HOOP_HEIGHT);
    
    // Draw net (simplified as lines)
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(HOOP_X + i * 10, HOOP_Y + HOOP_HEIGHT);
        ctx.lineTo(HOOP_X + i * 10, HOOP_Y + HOOP_HEIGHT + 40);
        ctx.stroke();
    }
}

function drawScore() {
    // Draw title
    ctx.fillStyle = YELLOW;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('BASKET HUT', CANVAS_WIDTH / 2, 60);
    
    // Draw player name in top right
    ctx.fillStyle = WHITE;
    ctx.font = '24px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Player: ${playerName}`, CANVAS_WIDTH - 20, 40);
    
    // Draw score info
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${gameState.score}`, 20, 100);
    ctx.fillText(`Shots: ${gameState.shots}`, 20, 130);
    ctx.fillText(`Misses: ${gameState.misses}/${MAX_MISSES}`, 20, 160);
    ctx.fillText(`Time: ${Math.ceil(gameState.timeRemaining)}s`, 20, 190);
    ctx.fillText(`Difficulty: ${gameState.difficulty}`, 20, 220);
    
    // Add high score display (after the score display)
    ctx.fillStyle = WHITE;
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`High Score: ${highScore}`, 20, 250);
}

function drawGameOver() {
    // Semi-transparent background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Game over text
    ctx.fillStyle = YELLOW;
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
    
    // Final score
    ctx.font = '36px Arial';
    ctx.fillText(`Final Score: ${gameState.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
    
    // Restart instructions
    ctx.font = '24px Arial';
    ctx.fillText('Press R to Restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);

    // Show the restart button
    document.getElementById('btn-restart').style.display = 'block';
}

function drawPauseScreen() {
    // Semi-transparent background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Pause text
    ctx.fillStyle = YELLOW;
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    
    // Resume instructions
    ctx.font = '24px Arial';
    ctx.fillText('Press SPACE to Resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
}

function drawMessage() {
    if (gameState.messageTimer > 0) {
        ctx.fillStyle = YELLOW;
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(gameState.message, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        gameState.messageTimer--;
    }
}

function drawCharacter() {
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 2;
    
    // Draw body
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y + BALL_RADIUS);
    ctx.lineTo(ball.x, ball.y + BALL_RADIUS + CHARACTER_HEIGHT);
    ctx.stroke();
    
    // Draw legs
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y + BALL_RADIUS + CHARACTER_HEIGHT);
    ctx.lineTo(ball.x - 15, ball.y + BALL_RADIUS + CHARACTER_HEIGHT + 20);
    ctx.moveTo(ball.x, ball.y + BALL_RADIUS + CHARACTER_HEIGHT);
    ctx.lineTo(ball.x + 15, ball.y + BALL_RADIUS + CHARACTER_HEIGHT + 20);
    ctx.stroke();
    
    // Draw arms
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y + BALL_RADIUS + 10);
    ctx.lineTo(ball.x - 20, ball.y + BALL_RADIUS + 30);
    ctx.moveTo(ball.x, ball.y + BALL_RADIUS + 10);
    ctx.lineTo(ball.x + 20, ball.y + BALL_RADIUS + 30);
    ctx.stroke();
    
    // Draw head
    ctx.beginPath();
    ctx.arc(ball.x, ball.y + BALL_RADIUS - 5, 8, 0, Math.PI * 2);
    ctx.stroke();
}

function drawBall() {
    // Draw the main ball circle
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = ORANGE;
    ctx.fill();
    
    // Add basketball details
    ctx.strokeStyle = BLACK;
    ctx.lineWidth = 2;
    
    // Draw the ball's outline
    ctx.stroke();
    
    // Draw the ball's lines
    ctx.beginPath();
    ctx.moveTo(ball.x - BALL_RADIUS, ball.y);
    ctx.lineTo(ball.x + BALL_RADIUS, ball.y);
    ctx.moveTo(ball.x, ball.y - BALL_RADIUS);
    ctx.lineTo(ball.x, ball.y + BALL_RADIUS);
    ctx.stroke();

    // Draw power meter when charging
    if (gameState.isCharging) {
        const powerBarWidth = 100;
        const powerBarHeight = 10;
        const powerBarX = ball.x - powerBarWidth / 2;
        const powerBarY = ball.y - 40;
        
        // Draw power bar background
        ctx.fillStyle = WHITE;
        ctx.fillRect(powerBarX, powerBarY, powerBarWidth, powerBarHeight);
        
        // Draw power level
        ctx.fillStyle = GREEN;
        ctx.fillRect(powerBarX, powerBarY, (gameState.power / MAX_POWER) * powerBarWidth, powerBarHeight);
    }

    // Draw shooting line to show direction
    if (!ball.isMoving && !gameState.isShot) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y);
        // Calculate end point of the line based on angle
        const lineLength = 100;
        const endX = ball.x + Math.cos(gameState.angle) * lineLength;
        const endY = ball.y - Math.sin(gameState.angle) * lineLength;
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }
}

function checkCollision() {
    // Debug visualization of collision boxes
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
    ctx.strokeRect(HOOP_X - 10, HOOP_Y - 60, 20, 120); // Backboard
    ctx.strokeRect(HOOP_X, HOOP_Y, currentHoopWidth, HOOP_HEIGHT); // Rim

    // Check collision with backboard
    if (ball.x + BALL_RADIUS > HOOP_X - 10 && 
        ball.x - BALL_RADIUS < HOOP_X + 10 && 
        ball.y + BALL_RADIUS > HOOP_Y - 60 && 
        ball.y - BALL_RADIUS < HOOP_Y + 60) {
        // Determine which side of the backboard was hit
        if (ball.x < HOOP_X) {
            ball.x = HOOP_X - 10 - BALL_RADIUS;
        } else {
            ball.x = HOOP_X + 10 + BALL_RADIUS;
        }
        ball.velocityX = -ball.velocityX * BOUNCE_FACTOR;
        return false;
    }

    // Check collision with rim
    if (ball.x + BALL_RADIUS > HOOP_X && 
        ball.x - BALL_RADIUS < HOOP_X + currentHoopWidth && 
        ball.y + BALL_RADIUS > HOOP_Y && 
        ball.y - BALL_RADIUS < HOOP_Y + HOOP_HEIGHT) {
        
        // Check if ball is going through the hoop
        if (ball.velocityY > 0 && 
            ball.x + BALL_RADIUS > HOOP_X + 5 && 
            ball.x - BALL_RADIUS < HOOP_X + currentHoopWidth - 5) {
            gameState.score++;
            gameState.message = "SCORE!";
            gameState.messageTimer = 60;
            return true;
        } else {
            // Bounce off the rim
            if (ball.y < HOOP_Y) {
                ball.y = HOOP_Y - BALL_RADIUS;
                ball.velocityY = -ball.velocityY * BOUNCE_FACTOR;
            } else if (ball.y > HOOP_Y + HOOP_HEIGHT) {
                ball.y = HOOP_Y + HOOP_HEIGHT + BALL_RADIUS;
                ball.velocityY = -ball.velocityY * BOUNCE_FACTOR;
            }
            if (ball.x < HOOP_X) {
                ball.x = HOOP_X - BALL_RADIUS;
                ball.velocityX = -ball.velocityX * BOUNCE_FACTOR;
            } else if (ball.x > HOOP_X + currentHoopWidth) {
                ball.x = HOOP_X + currentHoopWidth + BALL_RADIUS;
                ball.velocityX = -ball.velocityX * BOUNCE_FACTOR;
            }
            return false;
        }
    }

    return false;
}

function updateBall() {
    if (ball.isMoving) {
        // Update position
        ball.x += ball.velocityX;
        ball.y += ball.velocityY;
        
        // Apply gravity
        ball.velocityY += GRAVITY;
        
        // Check for collisions
        if (checkCollision()) {
            resetBall();
            return;
        }
        
        // Check if ball is out of bounds
        if (ball.y > CANVAS_HEIGHT + BALL_RADIUS || 
            ball.x < -BALL_RADIUS || 
            ball.x > CANVAS_WIDTH + BALL_RADIUS) {
            gameState.message = "MISS!";
            gameState.messageTimer = 60;
            gameState.misses++;
            resetBall();
        }
    }
}

function resetBall() {
    ball.x = CANVAS_WIDTH / 2;
    ball.y = CANVAS_HEIGHT - 100 - CHARACTER_HEIGHT;
    ball.velocityX = 0;
    ball.velocityY = 0;
    ball.isMoving = false;
    gameState.isShot = false;
    gameState.shots++;
}

function shootBall() {
    if (!ball.isMoving && !gameState.isShot) {
        ball.velocityX = gameState.power * Math.cos(gameState.angle);
        ball.velocityY = -gameState.power * Math.sin(gameState.angle);
        ball.isMoving = true;
        gameState.isShot = true;
        gameState.isCharging = false;
    }
}

function updateDifficulty() {
    if (gameState.timeRemaining % 30 === 0) {
        gameState.difficulty++;
        HOOP_Y = Math.max(50, HOOP_Y - 10);
        currentHoopWidth = Math.max(30, currentHoopWidth - 5);
    }
}

function resetGame(askName = false) {
    gameState = {
        isCharging: false,
        isShot: false,
        power: 0,
        angle: 0,
        score: 0,
        shots: 0,
        misses: 0,
        message: '',
        messageTimer: 0,
        isGameOver: false,
        timeRemaining: GAME_TIME,
        difficulty: 1,
        isPaused: false
    };
    
    HOOP_X = CANVAS_WIDTH / 2 - HOOP_WIDTH / 2;
    HOOP_Y = 100;
    currentHoopWidth = HOOP_WIDTH;
    
    resetBall();

    // Hide the restart button
    document.getElementById('btn-restart').style.display = 'none';
}

function handleInput() {
    if (keys.r) {
        resetGame();
        return;
    }

    if (gameState.isGameOver) {
        return;
    }

    if (gameState.isPaused) {
        if (keys.space) {
            gameState.isPaused = false;
        }
        return;
    }

    if (!ball.isMoving && !gameState.isShot) {
        if (keys.left) {
            ball.x = Math.max(BALL_RADIUS, ball.x - BALL_SPEED);
        }
        if (keys.right) {
            ball.x = Math.min(CANVAS_WIDTH - BALL_RADIUS, ball.x + BALL_SPEED);
        }
        
        if (keys.rotateLeft || keys.up) {
            gameState.angle = Math.min(MAX_ANGLE, gameState.angle + 0.05);
        }
        if (keys.rotateRight || keys.down) {
            gameState.angle = Math.max(MIN_ANGLE, gameState.angle - 0.05);
        }
        
        if (keys.space && !gameState.isCharging) {
            gameState.isCharging = true;
            gameState.power = 0;
        }
        
        if (gameState.isCharging && keys.space) {
            gameState.power = Math.min(MAX_POWER, gameState.power + POWER_INCREMENT);
        }
        
        if (!keys.space && gameState.isCharging) {
            shootBall();
        }
    }
}

function gameLoop() {
    ctx.fillStyle = BLACK;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    if (!gameState.isPaused && !gameState.isGameOver) {
        handleInput();
        updateBall();
        gameState.timeRemaining -= 1/60;
        updateDifficulty();
        
        if (gameState.misses >= MAX_MISSES || gameState.timeRemaining <= 0) {
            gameState.isGameOver = true;
            // Update high score if current score is higher
            if (gameState.score > highScore) {
                highScore = gameState.score;
                localStorage.setItem(`${playerName}_highScore`, highScore);
            }
        }
    }
    
    drawHoop();
    if (!ball.isMoving) {
        drawCharacter();
    }
    drawBall();
    drawScore();
    drawMessage();
    
    if (gameState.isPaused) {
        drawPauseScreen();
    } else if (gameState.isGameOver) {
        drawGameOver();
    }
    
    requestAnimationFrame(gameLoop);
}

// Event listeners for keyboard input
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.up = true;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.down = true;
    if (e.key === ' ') keys.space = true;
    if (e.key === 'r' || e.key === 'R') {
        keys.r = true;
        resetGame();
    }
    if (e.key === 'Escape') gameState.isPaused = !gameState.isPaused;
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.up = false;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.down = false;
    if (e.key === ' ') keys.space = false;
    if (e.key === 'r' || e.key === 'R') keys.r = false;
});

// Add touch button event listeners
document.getElementById('btn-left').addEventListener('mousedown', () => keys.left = true);
document.getElementById('btn-left').addEventListener('mouseup', () => keys.left = false);
document.getElementById('btn-left').addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.left = true;
});
document.getElementById('btn-left').addEventListener('touchend', () => keys.left = false);

document.getElementById('btn-right').addEventListener('mousedown', () => keys.right = true);
document.getElementById('btn-right').addEventListener('mouseup', () => keys.right = false);
document.getElementById('btn-right').addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.right = true;
});
document.getElementById('btn-right').addEventListener('touchend', () => keys.right = false);

document.getElementById('btn-rotate-left').addEventListener('mousedown', () => keys.rotateLeft = true);
document.getElementById('btn-rotate-left').addEventListener('mouseup', () => keys.rotateLeft = false);
document.getElementById('btn-rotate-left').addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.rotateLeft = true;
});
document.getElementById('btn-rotate-left').addEventListener('touchend', () => keys.rotateLeft = false);

document.getElementById('btn-rotate-right').addEventListener('mousedown', () => keys.rotateRight = true);
document.getElementById('btn-rotate-right').addEventListener('mouseup', () => keys.rotateRight = false);
document.getElementById('btn-rotate-right').addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.rotateRight = true;
});
document.getElementById('btn-rotate-right').addEventListener('touchend', () => keys.rotateRight = false);

document.getElementById('btn-shoot').addEventListener('mousedown', () => keys.space = true);
document.getElementById('btn-shoot').addEventListener('mouseup', () => keys.space = false);
document.getElementById('btn-shoot').addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.space = true;
});
document.getElementById('btn-shoot').addEventListener('touchend', () => keys.space = false);

// Add restart button event listeners
document.getElementById('btn-restart').addEventListener('click', resetGame);
document.getElementById('btn-restart').addEventListener('touchstart', (e) => {
    e.preventDefault();
    resetGame();
});

promptPlayerName();
gameLoop();
