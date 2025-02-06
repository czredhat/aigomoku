const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 10; // Počet políček na řádek/sloupec
const cellSize = canvas.width / gridSize;

let board = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
let gameOver = false;

// Proměnná pro uložení posledního tahu
let lastMove = null;

// Funkce pro vykreslení hracího pole
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000';

    // Vykreslení mřížky
    for (let i = 1; i < gridSize; i++) {
        // Vodorovné čáry
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.stroke();

        // Svislé čáry
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, canvas.height);
        ctx.stroke();
    }

    // Vykreslení žlutého pozadí pro poslední tah
    if (lastMove) {
        ctx.fillStyle = 'rgba(255, 255, 0, 0.5)'; // Žlutá s 50% průhledností
        ctx.fillRect(lastMove.col * cellSize, lastMove.row * cellSize, cellSize, cellSize);
    }

    // Vykreslení symbolů
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (board[row][col] === 'X') {
                drawX(row, col);
            } else if (board[row][col] === 'O') {
                drawO(row, col);
            }
        }
    }
}

// Funkce pro vykreslení křížku
function drawX(row, col) {
    ctx.strokeStyle = '#f00';
    ctx.beginPath();
    ctx.moveTo(col * cellSize + 10, row * cellSize + 10);
    ctx.lineTo((col + 1) * cellSize - 10, (row + 1) * cellSize - 10);
    ctx.moveTo((col + 1) * cellSize - 10, row * cellSize + 10);
    ctx.lineTo(col * cellSize + 10, (row + 1) * cellSize - 10);
    ctx.stroke();
}

// Funkce pro vykreslení kolečka
function drawO(row, col) {
    ctx.strokeStyle = '#00f';
    ctx.beginPath();
    ctx.arc(col * cellSize + cellSize / 2, row * cellSize + cellSize / 2, cellSize / 3, 0, Math.PI * 2);
    ctx.stroke();
}

// Funkce pro umístění symbolu
function placeSymbol(row, col, player) {
    if (board[row][col] === null && !gameOver) {
        board[row][col] = player;
        lastMove = { row, col }; // Uložení posledního tahu
        drawBoard();
        if (checkWin(player, board, gridSize)) {
            gameOver = true;
            alert(`${player} vyhrál!`);
            return;
        }
        if (checkDraw(board, gridSize)) {
            gameOver = true;
            alert('Remíza!');
            return;
        }
        if (player === 'X') {
            setTimeout(() => {
                const ai = aiMove(board, gridSize);
                if (ai) {
                    placeSymbol(ai.row, ai.col, 'O');
                }
            }, 500);
        }
    }
}

// Posluchač události kliknutí
canvas.addEventListener('click', (event) => {
    if (gameOver) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    placeSymbol(row, col, 'X');
});

// Inicializace hry
drawBoard();