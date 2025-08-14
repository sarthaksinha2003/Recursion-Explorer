export const examples = {
  fibonacci: {
    title: "Fibonacci Sequence",
    description: "Calculate the nth Fibonacci number using recursion",
    category: "recursion",
    difficulty: "Beginner",
    pseudocode: `function fibonacci(n):
  if n <= 1:
    return n
  return fibonacci(n-1) + fibonacci(n-2)`,
    code: `// Fibonacci sequence using recursion
function fibonacci(n) {
  api.enter('fibonacci', { n });
  
  if (n <= 1) {
    api.exit(n);
    return n;
  }
  
  const result = fibonacci(n - 1) + fibonacci(n - 2);
  api.exit(result);
  return result;
}

// Calculate fibonacci(5)
fibonacci(5);`
  },

  factorial: {
    title: "Factorial",
    description: "Calculate the factorial of a number using recursion",
    category: "recursion",
    difficulty: "Beginner",
    pseudocode: `function factorial(n):
  if n <= 1:
    return 1
  return n * factorial(n-1)`,
    code: `// Factorial using recursion
function factorial(n) {
  api.enter('factorial', { n });
  
  if (n <= 1) {
    api.exit(1);
    return 1;
  }
  
  const result = n * factorial(n - 1);
  api.exit(result);
  return result;
}

// Calculate factorial(5)
factorial(5);`
  },

  subsets: {
    title: "Generate Subsets",
    description: "Generate all possible subsets of an array using backtracking",
    category: "backtracking",
    difficulty: "Intermediate",
    pseudocode: `function generateSubsets(nums):
  result = []
  backtrack(nums, [], 0, result)
  return result

function backtrack(nums, current, start, result):
  result.append(current[:])
  for i in range(start, len(nums)):
    current.append(nums[i])
    backtrack(nums, current, i + 1, result)
    current.pop()`,
    code: `// Generate all subsets using backtracking
function generateSubsets(nums) {
  const result = [];
  
  function backtrack(nums, current, start) {
    api.enter('backtrack', { nums, current, start });
    
    result.push([...current]);
    
    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]);
      backtrack(nums, current, i + 1);
      current.pop();
    }
    
    api.exit();
  }
  
  backtrack(nums, [], 0);
  return result;
}

// Generate subsets of [1, 2, 3]
generateSubsets([1, 2, 3]);`
  },

  nQueens: {
    title: "N-Queens Problem",
    description: "Place N queens on an NxN chessboard so no two queens threaten each other",
    category: "backtracking",
    difficulty: "Advanced",
    pseudocode: `function solveNQueens(n):
  board = create empty n×n board
  result = []
  solve(board, 0, result)
  return result

function solve(board, col, result):
  if col >= n:
    add solution to result
    return
  
  for row in range(n):
    if isValid(board, row, col):
      board[row][col] = 'Q'
      solve(board, col + 1, result)
      board[row][col] = '.'`,
    code: `// N-Queens problem using backtracking
function solveNQueens(n) {
  const board = Array(n).fill().map(() => Array(n).fill('.'));
  const result = [];
  
  function isValid(board, row, col) {
    // Check row
    for (let c = 0; c < col; c++) {
      if (board[row][c] === 'Q') return false;
    }
    
    // Check upper diagonal
    for (let r = row - 1, c = col - 1; r >= 0 && c >= 0; r--, c--) {
      if (board[r][c] === 'Q') return false;
    }
    
    // Check lower diagonal
    for (let r = row + 1, c = col - 1; r < n && c >= 0; r++, c--) {
      if (board[r][c] === 'Q') return false;
    }
    
    return true;
  }
  
  function solve(board, col) {
    api.enter('solve', { col });
    
    if (col >= n) {
      result.push(board.map(row => row.join('')));
      api.exit();
      return;
    }
    
    for (let row = 0; row < n; row++) {
      if (isValid(board, row, col)) {
        board[row][col] = 'Q';
        solve(board, col + 1);
        board[row][col] = '.';
      }
    }
    
    api.exit();
  }
  
  solve(board, 0);
  return result;
}

// Solve 4-Queens problem
solveNQueens(4);`
  },

  sudoku: {
    title: "Sudoku Solver",
    description: "Solve a Sudoku puzzle using backtracking",
    category: "backtracking",
    difficulty: "Advanced",
    pseudocode: `function solveSudoku(board):
  if solve(board):
    return board
  return null

function solve(board):
  find empty cell (row, col)
  if no empty cell:
    return true
  
  for num in 1-9:
    if isValid(board, row, col, num):
      board[row][col] = num
      if solve(board):
        return true
      board[row][col] = 0
  return false`,
    code: `// Sudoku solver using backtracking
function solveSudoku(board) {
  function isValid(board, row, col, num) {
    // Check row
    for (let c = 0; c < 9; c++) {
      if (board[row][c] === num) return false;
    }
    
    // Check column
    for (let r = 0; r < 9; r++) {
      if (board[r][col] === num) return false;
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if (board[r][c] === num) return false;
      }
    }
    
    return true;
  }
  
  function solve(board) {
    api.enter('solve', { board: JSON.stringify(board) });
    
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num;
              if (solve(board)) {
                api.exit(true);
                return true;
              }
              board[row][col] = 0;
            }
          }
          api.exit(false);
          return false;
        }
      }
    }
    
    api.exit(true);
    return true;
  }
  
  if (solve(board)) {
    return board;
  }
  return null;
}

// Example Sudoku board (0 represents empty cells)
const board = [
  [5,3,0,0,7,0,0,0,0],
  [6,0,0,1,9,5,0,0,0],
  [0,9,8,0,0,0,0,6,0],
  [8,0,0,0,6,0,0,0,3],
  [4,0,0,8,0,3,0,0,1],
  [7,0,0,0,2,0,0,0,6],
  [0,6,0,0,0,0,2,8,0],
  [0,0,0,4,1,9,0,0,5],
  [0,0,0,0,8,0,0,7,9]
];

solveSudoku(board);`
  },

  maze: {
    title: "Rat in a Maze",
    description: "Find a path from source to destination in a maze using backtracking",
    category: "backtracking",
    difficulty: "Intermediate",
    pseudocode: `function solveMaze(maze):
  path = create empty path
  if solveMazeUtil(maze, 0, 0, path):
    return path
  return null

function solveMazeUtil(maze, row, col, path):
  if row, col is destination:
    return true
  
  if isValid(maze, row, col):
    mark cell as visited
    path.append([row, col])
    
    if solveMazeUtil(maze, row+1, col, path):
      return true
    if solveMazeUtil(maze, row, col+1, path):
      return true
    
    path.pop()
    mark cell as unvisited
  return false`,
    code: `// Rat in a Maze using backtracking
function solveMaze(maze) {
  const n = maze.length;
  const path = [];
  const visited = Array(n).fill().map(() => Array(n).fill(false));
  
  function isValid(maze, row, col) {
    return row >= 0 && row < n && col >= 0 && col < n && 
           maze[row][col] === 1 && !visited[row][col];
  }
  
  function solveMazeUtil(maze, row, col) {
    api.enter('solveMazeUtil', { row, col });
    
    if (row === n - 1 && col === n - 1) {
      path.push([row, col]);
      api.exit(true);
      return true;
    }
    
    if (isValid(maze, row, col)) {
      visited[row][col] = true;
      path.push([row, col]);
      
      // Try moving down
      if (solveMazeUtil(maze, row + 1, col)) {
        api.exit(true);
        return true;
      }
      
      // Try moving right
      if (solveMazeUtil(maze, row, col + 1)) {
        api.exit(true);
        return true;
      }
      
      // Try moving up
      if (solveMazeUtil(maze, row - 1, col)) {
        api.exit(true);
        return true;
      }
      
      // Try moving left
      if (solveMazeUtil(maze, row, col - 1)) {
        api.exit(true);
        return true;
      }
      
      path.pop();
      visited[row][col] = false;
    }
    
    api.exit(false);
    return false;
  }
  
  if (solveMazeUtil(maze, 0, 0)) {
    return path;
  }
  return null;
}

// Example maze (1 = path, 0 = wall)
const maze = [
  [1, 0, 0, 0],
  [1, 1, 0, 1],
  [0, 1, 0, 0],
  [1, 1, 1, 1]
];

solveMaze(maze);`
  },

  fibonacciDP: {
    title: "Fibonacci with Memoization",
    description: "Calculate Fibonacci numbers using dynamic programming and memoization",
    category: "memoization",
    difficulty: "Intermediate",
    pseudocode: `function fibonacciDP(n, memo = {}):
  if n in memo:
    return memo[n]
  if n <= 1:
    return n
  
  memo[n] = fibonacciDP(n-1, memo) + fibonacciDP(n-2, memo)
  return memo[n]`,
    code: `// Fibonacci with memoization (Dynamic Programming)
function fibonacciDP(n, memo = {}) {
  api.enter('fibonacciDP', { n, memo: Object.keys(memo) });
  
  if (n in memo) {
    api.set({ memo: { ...memo } });
    api.exit(memo[n]);
    return memo[n];
  }
  
  if (n <= 1) {
    memo[n] = n;
    api.set({ memo: { ...memo } });
    api.exit(n);
    return n;
  }
  
  memo[n] = fibonacciDP(n - 1, memo) + fibonacciDP(n - 2, memo);
  api.set({ memo: { ...memo } });
  api.exit(memo[n]);
  return memo[n];
}

// Calculate fibonacci(10) with memoization
fibonacciDP(10);`
  },

  knapsack: {
    title: "Knapsack with Memoization",
    description: "Solve the 0/1 knapsack problem using dynamic programming and memoization",
    category: "memoization",
    difficulty: "Advanced",
    pseudocode: `function knapsack(weights, values, capacity, memo = {}):
  key = capacity + "," + len(weights)
  if key in memo:
    return memo[key]
  
  if len(weights) == 0 or capacity == 0:
    return 0
  
  if weights[0] > capacity:
    result = knapsack(weights[1:], values[1:], capacity, memo)
  else:
    result = max(
      values[0] + knapsack(weights[1:], values[1:], capacity - weights[0], memo),
      knapsack(weights[1:], values[1:], capacity, memo)
    )
  
  memo[key] = result
  return result`,
    code: `// 0/1 Knapsack with memoization (Dynamic Programming)
function knapsack(weights, values, capacity, memo = {}) {
  const key = capacity + ',' + weights.length;
  
  api.enter('knapsack', { weights, values, capacity, memo: Object.keys(memo) });
  
  if (key in memo) {
    api.set({ memo: { ...memo } });
    api.exit(memo[key]);
    return memo[key];
  }
  
  if (weights.length === 0 || capacity === 0) {
    memo[key] = 0;
    api.set({ memo: { ...memo } });
    api.exit(0);
    return 0;
  }
  
  let result;
  if (weights[0] > capacity) {
    result = knapsack(weights.slice(1), values.slice(1), capacity, memo);
  } else {
    const include = values[0] + knapsack(
      weights.slice(1), 
      values.slice(1), 
      capacity - weights[0], 
      memo
    );
    const exclude = knapsack(weights.slice(1), values.slice(1), capacity, memo);
    result = Math.max(include, exclude);
  }
  
  memo[key] = result;
  api.set({ memo: { ...memo } });
  api.exit(result);
  return result;
}

// Example: weights, values, and capacity
const weights = [2, 3, 4, 5];
const values = [3, 4, 5, 6];
const capacity = 10;

knapsack(weights, values, capacity);`
  }
};