const canvas = document.getElementById('tetris-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let score = 0;
let gameOver = false;

// Tetromino shapes
const TETROMINOES = {
    I: {
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        color: '#00FFFF'
    },
    O: {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: '#FFFF00'
    },
    T: {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#800080'
    },
    S: {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        color: '#00FF00'
    },
    Z: {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        color: '#FF0000'
    },
    J: {
        shape: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#0000FF'
    },
    L: {
        shape: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#FFA500'
    }
};

let currentPiece = null;
let currentX = 0;
let currentY = 0;

function getRandomTetromino() {
    const keys = Object.keys(TETROMINOES);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return TETROMINOES[randomKey];
}

function spawnPiece() {
    currentPiece = getRandomTetromino();
    currentX = Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2);
    currentY = 0;

    if (isCollision(currentX, currentY, currentPiece.shape)) {
        gameOver = true;
    }
}

function isCollision(x, y, shape) {
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col] && (board[y + row] && board[y + row][x + col]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function placePiece() {
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col]) {
                board[currentY + row][currentX + col] = currentPiece.color;
            }
        }
    }
}

function clearLines() {
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row].every(cell => cell !== 0)) {
            board.splice(row, 1);
            board.unshift(Array(COLS).fill(0));
            score += 100;
            scoreElement.textContent = `Score: ${score}`;
            row++; // Check the same row again
        }
    }
}

function rotatePiece() {
    const rotated = currentPiece.shape[0].map((_, index) =>
        currentPiece.shape.map(row => row[index]).reverse()
    );
    if (!isCollision(currentX, currentY, rotated)) {
        currentPiece.shape = rotated;
    }
}

function movePiece(dx, dy) {
    if (!isCollision(currentX + dx, currentY + dy, currentPiece.shape)) {
        currentX += dx;
        currentY += dy;
    } else if (dy > 0) {
        // Hit bottom
        placePiece();
        clearLines();
        spawnPiece();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw board
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col]) {
                ctx.fillStyle = board[row][col];
                ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeStyle = '#000';
                ctx.strokeRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }

    // Draw current piece
    if (currentPiece) {
        ctx.fillStyle = currentPiece.color;
        for (let row = 0; row < currentPiece.shape.length; row++) {
            for (let col = 0; col < currentPiece.shape[row].length; col++) {
                if (currentPiece.shape[row][col]) {
                    ctx.fillRect((currentX + col) * BLOCK_SIZE, (currentY + row) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    ctx.strokeStyle = '#000';
                    ctx.strokeRect((currentX + col) * BLOCK_SIZE, (currentY + row) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                }
            }
        }
    }
}

function gameLoop() {
    if (!gameOver) {
        movePiece(0, 1); // Drop down
        draw();
    } else {
        ctx.fillStyle = '#FFF';
        ctx.font = '30px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 80, canvas.height / 2);
    }
}

document.addEventListener('keydown', (e) => {
    if (gameOver) return;
    switch (e.key) {
        case 'ArrowLeft':
            movePiece(-1, 0);
            break;
        case 'ArrowRight':
            movePiece(1, 0);
            break;
        case 'ArrowDown':
            movePiece(0, 1);
            break;
        case 'ArrowUp':
            rotatePiece();
            break;
    }
    draw();
});

function init() {
    spawnPiece();
    draw();
    setInterval(gameLoop, 1000); // Drop every second
}

init();