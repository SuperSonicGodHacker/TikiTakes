// Get the canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Constants
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const GRAVITY = 0.5;
const MAX_POWER = 20; // Increased max power
const POWER_INCREMENT = 0.5;
const MAX_MISSES = 5;
const GAME_TIME = 60; // seconds
const BOUNCE_FACTOR = 0.7; // Reduced bounce factor for more realistic physics
const MIN_ANGLE = 0; // Allow full range from 0 to 180 degrees
const MAX_ANGLE = Math.PI; // 180 degrees
const BALL_SPEED = 5; // Speed of ball movement
const CHARACTER_HEIGHT = 60; // Height of the character

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
    isPaused: false,
    isMenu: true, // Add menu state
    controlMode: null // 'touch' or 'cursor'
};

// Input state
const keys = {
    left: false,
    right: false,
    up: false,
    down: false,
    space: false,
    r: false
};

// Touch controls
const touchControls = {
    leftButton: { x: 50, y: CANVAS_HEIGHT - 100, width: 60, height: 60 },
    rightButton: { x: 120, y: CANVAS_HEIGHT - 100, width: 60, height: 60 },
    upButton: { x: 190, y: CANVAS_HEIGHT - 100, width: 60, height: 60 },
    downButton: { x: 260, y: CANVAS_HEIGHT - 100, width: 60, height: 60 },
    shootButton: { x: CANVAS_WIDTH - 100, y: CANVAS_HEIGHT - 100, width: 80, height: 80 }
};

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
    
    // Draw score info
    ctx.fillStyle = WHITE;
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${gameState.score}`, 20, 100);
    ctx.fillText(`Shots: ${gameState.shots}`, 20, 130);
    ctx.fillText(`Misses: ${gameState.misses}/${MAX_MISSES}`, 20, 160);
    ctx.fillText(`Time: ${Math.ceil(gameState.timeRemaining)}s`, 20, 190);
    ctx.fillText(`Difficulty: ${gameState.difficulty}`, 20, 220);
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
    ball.y = CANVAS_HEIGHT - 100 - CHARACTER_HEIGHT; // Adjust starting position to account for character height
    ball.velocityX = 0;
    ball.velocityY = 0;
    ball.isMoving = false;
    gameState.isShot = false;
    gameState.shots++;
}

function shootBall() {
    if (!ball.isMoving && !gameState.isShot) {
        // Calculate velocity based on power and angle
        ball.velocityX = gameState.power * Math.cos(gameState.angle);
        ball.velocityY = -gameState.power * Math.sin(gameState.angle);
        ball.isMoving = true;
        gameState.isShot = true;
        gameState.isCharging = false;
    }
}

function updateDifficulty() {
    // Increase difficulty every 30 seconds
    if (gameState.timeRemaining % 30 === 0) {
        gameState.difficulty++;
        // Move hoop higher and make it narrower
        HOOP_Y = Math.max(50, HOOP_Y - 10);
        currentHoopWidth = Math.max(30, currentHoopWidth - 5);
    }
}

function resetGame() {
    // Reset game state
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
        isPaused: false,
        isMenu: true,
        controlMode: null
    };
    
    // Reset hoop position and size
    HOOP_X = CANVAS_WIDTH / 2 - HOOP_WIDTH / 2;
    HOOP_Y = 100;
    currentHoopWidth = HOOP_WIDTH;
    
    // Reset ball
    resetBall();
}

function drawMenu() {
    // Draw title
    ctx.fillStyle = YELLOW;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('BASKET HUT', CANVAS_WIDTH / 2, 100);
    
    // Draw control options
    ctx.fillStyle = WHITE;
    ctx.font = '36px Arial';
    
    // Draw cursor option
    ctx.fillStyle = gameState.controlMode === 'cursor' ? YELLOW : WHITE;
    ctx.fillRect(CANVAS_WIDTH / 2 - 150, 200, 300, 60);
    ctx.strokeStyle = WHITE;
    ctx.strokeRect(CANVAS_WIDTH / 2 - 150, 200, 300, 60);
    ctx.fillStyle = gameState.controlMode === 'cursor' ? BLACK : WHITE;
    ctx.fillText('Cursor Controls', CANVAS_WIDTH / 2, 240);
    
    // Draw touchscreen option
    ctx.fillStyle = gameState.controlMode === 'touch' ? YELLOW : WHITE;
    ctx.fillRect(CANVAS_WIDTH / 2 - 150, 300, 300, 60);
    ctx.strokeStyle = WHITE;
    ctx.strokeRect(CANVAS_WIDTH / 2 - 150, 300, 300, 60);
    ctx.fillStyle = gameState.controlMode === 'touch' ? BLACK : WHITE;
    ctx.fillText('Touchscreen Controls', CANVAS_WIDTH / 2, 340);
    
    // Draw start button
    ctx.fillStyle = GREEN;
    ctx.fillRect(CANVAS_WIDTH / 2 - 100, 400, 200, 50);
    ctx.fillStyle = WHITE;
    ctx.font = '24px Arial';
    ctx.fillText('Press SPACE to Start', CANVAS_WIDTH / 2, 435);
}

function drawTouchControls() {
    if (!gameState.isMenu && gameState.controlMode === 'touch') {
        // Draw movement buttons
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(touchControls.leftButton.x, touchControls.leftButton.y, 
                    touchControls.leftButton.width, touchControls.leftButton.height);
        ctx.fillRect(touchControls.rightButton.x, touchControls.rightButton.y, 
                    touchControls.rightButton.width, touchControls.rightButton.height);
        ctx.fillRect(touchControls.upButton.x, touchControls.upButton.y, 
                    touchControls.upButton.width, touchControls.upButton.height);
        ctx.fillRect(touchControls.downButton.x, touchControls.downButton.y, 
                    touchControls.downButton.width, touchControls.downButton.height);
        
        // Draw shoot button
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(touchControls.shootButton.x, touchControls.shootButton.y, 
                    touchControls.shootButton.width, touchControls.shootButton.height);
        
        // Draw button labels
        ctx.fillStyle = WHITE;
        ctx.font = '24px Arial';
        ctx.fillText('←', touchControls.leftButton.x + 25, touchControls.leftButton.y + 40);
        ctx.fillText('→', touchControls.rightButton.x + 25, touchControls.rightButton.y + 40);
        ctx.fillText('↑', touchControls.upButton.x + 25, touchControls.upButton.y + 40);
        ctx.fillText('↓', touchControls.downButton.x + 25, touchControls.downButton.y + 40);
        ctx.fillText('SHOOT', touchControls.shootButton.x + 15, touchControls.shootButton.y + 45);
    }
}

function isPointInRect(point, rect) {
    return point.x >= rect.x && point.x <= rect.x + rect.width &&
           point.y >= rect.y && point.y <= rect.y + rect.height;
}

// Add touch event listeners
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const point = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
    };
    
    if (gameState.isMenu) {
        // Check menu options
        if (point.y >= 200 && point.y <= 260) {
            gameState.controlMode = 'cursor';
        } else if (point.y >= 300 && point.y <= 360) {
            gameState.controlMode = 'touch';
        }
    } else if (gameState.controlMode === 'touch') {
        // Check touch controls
        if (isPointInRect(point, touchControls.leftButton)) keys.left = true;
        if (isPointInRect(point, touchControls.rightButton)) keys.right = true;
        if (isPointInRect(point, touchControls.upButton)) keys.up = true;
        if (isPointInRect(point, touchControls.downButton)) keys.down = true;
        if (isPointInRect(point, touchControls.shootButton)) keys.space = true;
    }
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (gameState.controlMode === 'touch') {
        keys.left = false;
        keys.right = false;
        keys.up = false;
        keys.down = false;
        keys.space = false;
    }
});

function handleInput() {
    // Handle menu state
    if (gameState.isMenu) {
        if (keys.space && gameState.controlMode) {
            gameState.isMenu = false;
        }
        return;
    }

    // Handle restart key press regardless of game state
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
        // Handle ball movement
        if (keys.left) {
            ball.x = Math.max(BALL_RADIUS, ball.x - BALL_SPEED);
        }
        if (keys.right) {
            ball.x = Math.min(CANVAS_WIDTH - BALL_RADIUS, ball.x + BALL_SPEED);
        }
        
        // Handle angle adjustment (now using Up/Down arrows)
        if (keys.up) {
            gameState.angle = Math.min(MAX_ANGLE, gameState.angle + 0.05);
        }
        if (keys.down) {
            gameState.angle = Math.max(MIN_ANGLE, gameState.angle - 0.05);
        }
        
        // Handle power charging
        if (keys.space && !gameState.isCharging) {
            gameState.isCharging = true;
            gameState.power = 0;
        }
        
        // Increase power while charging
        if (gameState.isCharging && keys.space) {
            gameState.power = Math.min(MAX_POWER, gameState.power + POWER_INCREMENT);
        }
        
        // Release shot when space is released
        if (!keys.space && gameState.isCharging) {
            shootBall();
        }
    }
}

// Event listeners for input
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

function gameLoop() {
    // Clear the canvas
    ctx.fillStyle = BLACK;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw menu or game
    if (gameState.isMenu) {
        drawMenu();
    } else {
        // Update game state
        if (!gameState.isPaused && !gameState.isGameOver) {
            handleInput();
            updateBall();
            gameState.timeRemaining -= 1/60;
            updateDifficulty();
            
            if (gameState.misses >= MAX_MISSES || gameState.timeRemaining <= 0) {
                gameState.isGameOver = true;
            }
        }
        
        // Draw game elements
        drawHoop();
        if (!ball.isMoving) {
            drawCharacter();
        }
        drawBall();
        drawScore();
        drawMessage();
        drawTouchControls();
        
        if (gameState.isPaused) {
            drawPauseScreen();
        } else if (gameState.isGameOver) {
            drawGameOver();
        }
    }
    
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop(); 
