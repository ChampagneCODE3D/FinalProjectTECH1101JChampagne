/*
  script.js - GLA3 Connect Three Game
  Author: Jordan Champagne

  This project is part of the course requirements for the
  Software Development Diploma program at Bow Valley College (BVC).

  Course: TECH1101 - Web and Internet Fundamentals
  Instructor: Michael Dorsey
  Assignment: Graded Learning Activity 3 - Connect Three
  Date: 2026-04-17
  Version: v1.0

  Authorship Declaration:
  This work is my own. The structure and approach are based on
  class exercises and concepts taught in TECH1101 (Winter 2026) at BVC,
  and adapted by me for this assignment.

  AI Tools Used:
  - GitHub Copilot: Assisted with win-checking algorithm, gravity logic,
    event handling, and comment clarity.
  - All suggestions were reviewed and modified by me to fit the assignment
    requirements and my coding style.
  - All final logic, design decisions, and research were done by me.

  Description:
  Implements the game logic for Connect Three:
  - 3 columns x 6 rows board
  - Two players (X and O) take turns
  - Pieces fall to the lowest empty slot in a column (gravity)
  - Checks for 3-in-a-row wins (horizontal, vertical, diagonal)
  - Restart button resets the board without refreshing
*/

// ===== Constants =====
var ROWS = 6;       // Number of rows in the board
var COLS = 3;       // Number of columns in the board
var EMPTY = "";     // Represents an empty cell

// ===== Game State =====
var board = [];             // 2D array representing the board state
var currentPlayer = "X";    // Tracks whose turn it is ("X" or "O")
var gameOver = false;       // Flag to prevent moves after a win or draw

// ===== DOM References =====
var statusDisplay = document.getElementById("status");
var restartBtn = document.getElementById("restartBtn");
var cells = document.querySelectorAll(".cell");

// ===== Initialize the Board =====
// Creates a 2D array (6 rows x 3 cols) filled with empty strings
function initBoard() {
  board = [];
  for (var r = 0; r < ROWS; r++) {
    var row = [];
    for (var c = 0; c < COLS; c++) {
      row.push(EMPTY);
    }
    board.push(row);
  }
}

// ===== Render the Board =====
// Syncs the visual cells with the board array state
function renderBoard() {
  cells.forEach(function (cell) {
    var row = parseInt(cell.getAttribute("data-row"));
    var col = parseInt(cell.getAttribute("data-col"));
    var value = board[row][col];

    // Clear previous classes and content
    cell.textContent = "";
    cell.className = "cell";

    // Apply player symbol and class if the cell is occupied
    if (value === "X") {
      cell.textContent = "\u2716";   // Heavy X symbol
      cell.classList.add("player-x");
    } else if (value === "O") {
      cell.textContent = "O";
      cell.classList.add("player-o");
    }
  });
}

// ===== Find Lowest Empty Row =====
// Simulates gravity: returns the lowest empty row index in a column
// Returns -1 if the column is full
function getLowestEmptyRow(col) {
  for (var r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === EMPTY) {
      return r;
    }
  }
  return -1; // Column is full
}

// ===== Check for a Winner =====
// Scans all possible lines of three on the board
// Returns the winning player ("X" or "O") or null if no winner
function checkWinner() {
  // Check horizontal lines (3 consecutive in a row)
  for (var r = 0; r < ROWS; r++) {
    for (var c = 0; c <= COLS - 3; c++) {
      if (board[r][c] !== EMPTY &&
        board[r][c] === board[r][c + 1] &&
        board[r][c] === board[r][c + 2]) {
        // Highlight the winning cells
        highlightWinner(r, c, r, c + 1, r, c + 2);
        return board[r][c];
      }
    }
  }

  // Check vertical lines (3 consecutive in a column)
  for (var r = 0; r <= ROWS - 3; r++) {
    for (var c = 0; c < COLS; c++) {
      if (board[r][c] !== EMPTY &&
        board[r][c] === board[r + 1][c] &&
        board[r][c] === board[r + 2][c]) {
        highlightWinner(r, c, r + 1, c, r + 2, c);
        return board[r][c];
      }
    }
  }

  // Check diagonal lines (top-left to bottom-right)
  for (var r = 0; r <= ROWS - 3; r++) {
    for (var c = 0; c <= COLS - 3; c++) {
      if (board[r][c] !== EMPTY &&
        board[r][c] === board[r + 1][c + 1] &&
        board[r][c] === board[r + 2][c + 2]) {
        highlightWinner(r, c, r + 1, c + 1, r + 2, c + 2);
        return board[r][c];
      }
    }
  }

  // Check diagonal lines (top-right to bottom-left)
  for (var r = 0; r <= ROWS - 3; r++) {
    for (var c = 2; c < COLS; c++) {
      if (board[r][c] !== EMPTY &&
        board[r][c] === board[r + 1][c - 1] &&
        board[r][c] === board[r + 2][c - 2]) {
        highlightWinner(r, c, r + 1, c - 1, r + 2, c - 2);
        return board[r][c];
      }
    }
  }

  return null; // No winner found
}

// ===== Highlight Winning Cells =====
// Adds a visual highlight to the three winning cells
function highlightWinner(r1, c1, r2, c2, r3, c3) {
  cells.forEach(function (cell) {
    var row = parseInt(cell.getAttribute("data-row"));
    var col = parseInt(cell.getAttribute("data-col"));

    if ((row === r1 && col === c1) ||
      (row === r2 && col === c2) ||
      (row === r3 && col === c3)) {
      cell.classList.add("winner");
    }
  });
}

// ===== Check for Draw =====
// Returns true if every cell on the board is occupied (no empty cells)
function checkDraw() {
  for (var r = 0; r < ROWS; r++) {
    for (var c = 0; c < COLS; c++) {
      if (board[r][c] === EMPTY) {
        return false;
      }
    }
  }
  return true;
}

// ===== Handle Cell Click =====
// Main game logic: places a piece, checks for win/draw, switches turn
function handleCellClick(event) {
  // Ignore clicks if the game is already over
  if (gameOver) {
    return;
  }

  // Get the column the user clicked on
  var col = parseInt(event.target.getAttribute("data-col"));

  // Find the lowest empty row in that column (gravity)
  var row = getLowestEmptyRow(col);

  // If column is full, ignore the click
  if (row === -1) {
    return;
  }

  // Place the current player's piece on the board
  board[row][col] = currentPlayer;

  // Update the visual board
  renderBoard();

  // Apply drop animation to the placed cell
  var placedCell = document.querySelector(
    '.cell[data-row="' + row + '"][data-col="' + col + '"]'
  );
  placedCell.classList.add("drop");

  // Check if this move wins the game
  var winner = checkWinner();
  if (winner) {
    statusDisplay.textContent = "Player " + winner + " Wins!";
    gameOver = true;
    return;
  }

  // Check if the board is completely full (draw)
  if (checkDraw()) {
    statusDisplay.textContent = "It's a Draw!";
    gameOver = true;
    return;
  }

  // Switch to the other player's turn
  currentPlayer = (currentPlayer === "X") ? "O" : "X";
  statusDisplay.textContent = "Player " + currentPlayer + "'s Turn";
}

// ===== Restart Game =====
// Resets the board, state, and visuals without refreshing the page
function restartGame() {
  initBoard();
  currentPlayer = "X";
  gameOver = false;
  statusDisplay.textContent = "Player X's Turn";
  renderBoard();
}

// ===== Event Listeners =====
// Attach click handlers to each cell on the board
cells.forEach(function (cell) {
  cell.addEventListener("click", handleCellClick);
});

// Attach click handler to the restart button
restartBtn.addEventListener("click", restartGame);

// ===== Start the Game =====
// Initialize and render the board on page load
initBoard();
renderBoard();
