// Konstanty pro AI
const aiPlayer = 'O'; // Symbol AI
const humanPlayer = 'X'; // Symbol hráče
const MAX_DEPTH = 3; // Maximální hloubka rekurze

function aiMove(board, gridSize) {
    let bestScore = -Infinity;
    let bestMove = null;

    // Seznam prioritních políček (v blízkosti již obsazených políček)
    const priorityMoves = getPriorityMoves(board, gridSize);

    // Projde prioritní políčka
    for (const { row, col } of priorityMoves) {
        if (board[row][col] === null) {
            board[row][col] = aiPlayer;
            let score = minimax(board, 0, false, -Infinity, Infinity, gridSize);
            board[row][col] = null; // Vrátí změnu zpět

            if (score > bestScore) {
                bestScore = score;
                bestMove = { row, col };
            }
        }
    }

    // Pokud nejsou žádná prioritní políčka, projde všechna políčka
    if (!bestMove) {
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (board[row][col] === null) {
                    board[row][col] = aiPlayer;
                    let score = minimax(board, 0, false, -Infinity, Infinity, gridSize);
                    board[row][col] = null; // Vrátí změnu zpět

                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = { row, col };
                    }
                }
            }
        }
    }

    return bestMove;
}

// Funkce pro získání prioritních políček
function getPriorityMoves(board, gridSize) {
    const priorityMoves = [];
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (board[row][col] !== null) {
                // Přidá políčka v okolí již obsazených políček
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        const newRow = row + i;
                        const newCol = col + j;
                        if (
                            newRow >= 0 && newRow < gridSize &&
                            newCol >= 0 && newCol < gridSize &&
                            board[newRow][newCol] === null
                        ) {
                            priorityMoves.push({ row: newRow, col: newCol });
                        }
                    }
                }
            }
        }
    }
    return priorityMoves;
}

function minimax(board, depth, isMaximizing, alpha, beta, gridSize) {
    // Kontrola výhry nebo prohry
    if (checkWin(aiPlayer, board, gridSize)) {
        return 10 - depth; // AI vyhrává
    }
    if (checkWin(humanPlayer, board, gridSize)) {
        return depth - 10; // Hráč vyhrává
    }
    if (checkDraw(board, gridSize)) {
        return 0; // Remíza
    }

    // Pokud dosáhneme maximální hloubky, použijeme heuristiku
    if (depth >= MAX_DEPTH) {
        return evaluateBoard(board, gridSize);
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (board[row][col] === null) {
                    board[row][col] = aiPlayer;
                    let score = minimax(board, depth + 1, false, alpha, beta, gridSize);
                    board[row][col] = null; // Vrátí změnu zpět
                    bestScore = Math.max(score, bestScore);
                    alpha = Math.max(alpha, bestScore);
                    if (beta <= alpha) {
                        break; // Alpha-Beta prořezávání
                    }
                }
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (board[row][col] === null) {
                    board[row][col] = humanPlayer;
                    let score = minimax(board, depth + 1, true, alpha, beta, gridSize);
                    board[row][col] = null; // Vrátí změnu zpět
                    bestScore = Math.min(score, bestScore);
                    beta = Math.min(beta, bestScore);
                    if (beta <= alpha) {
                        break; // Alpha-Beta prořezávání
                    }
                }
            }
        }
        return bestScore;
    }
}

// Heuristika pro ohodnocení herní plochy
function evaluateBoard(board, gridSize) {
    let score = 0;

    // Ohodnotí všechny řádky, sloupce a diagonály
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (board[row][col] === aiPlayer) {
                score += evaluatePosition(row, col, aiPlayer, board, gridSize);
            } else if (board[row][col] === humanPlayer) {
                score -= evaluatePosition(row, col, humanPlayer, board, gridSize);
            }
        }
    }

    return score;
}

// Ohodnocení pozice v daném směru
function evaluatePosition(row, col, player, board, gridSize) {
    let score = 0;

    // Hodnotí všechny směry (řádky, sloupce, diagonály)
    score += evaluateDirection(row, col, 1, 0, player, board, gridSize); // Řádky
    score += evaluateDirection(row, col, 0, 1, player, board, gridSize); // Sloupce
    score += evaluateDirection(row, col, 1, 1, player, board, gridSize); // Diagonála doprava
    score += evaluateDirection(row, col, 1, -1, player, board, gridSize); // Diagonála doleva

    return score;
}

// Ohodnocení směru
function evaluateDirection(row, col, rowDir, colDir, player, board, gridSize) {
    let score = 0;
    let count = 0; // Počet symbolů hráče v řadě
    let empty = 0; // Počet volných políček v řadě

    // Projde 5 políček v daném směru
    for (let i = -4; i <= 4; i++) {
        const newRow = row + i * rowDir;
        const newCol = col + i * colDir;

        // Pokud je políčko na hracím poli
        if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
            if (board[newRow][newCol] === player) {
                count++;
            } else if (board[newRow][newCol] === null) {
                empty++;
            } else {
                // Přeruší řadu, pokud narazí na symbol protihráče
                count = 0;
                empty = 0;
            }
        }

        // Přidá skóre na základě počtu symbolů a volných políček
        if (count > 0 && empty > 0) {
            if (count === 4) {
                score += 2000; // Téměř vyhrávající řada
            } else if (count === 3) {
                score += 200; // Silná řada
            } else if (count === 2) {
                score += 10; // Slabá řada
            } else if (count === 1) {
                score += 1; // Začínající řada
            }
        }
    }

    return score;
}

// Kontrola výhry
function checkWin(player, board, gridSize) {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (
                checkDirection(row, col, 1, 0, player, board, gridSize) || // Řádky
                checkDirection(row, col, 0, 1, player, board, gridSize) || // Sloupce
                checkDirection(row, col, 1, 1, player, board, gridSize) || // Diagonála doprava
                checkDirection(row, col, 1, -1, player, board, gridSize) // Diagonála doleva
            ) {
                return true;
            }
        }
    }
    return false;
}

// Kontrola směru
function checkDirection(row, col, rowDir, colDir, player, board, gridSize) {
    let count = 0;
    for (let i = 0; i < 5; i++) {
        const newRow = row + i * rowDir;
        const newCol = col + i * colDir;
        if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize && board[newRow][newCol] === player) {
            count++;
        } else {
            break;
        }
    }
    return count === 5;
}

// Kontrola remízy
function checkDraw(board, gridSize) {
    return board.every(row => row.every(cell => cell !== null));
}