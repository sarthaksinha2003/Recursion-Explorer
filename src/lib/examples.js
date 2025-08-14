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
fibonacci(5);`,
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
factorial(5);`,
  },

  subsets: {
    title: "Generate Subsets",
    description:
      "Generate all possible subsets of an array using backtracking (Enhanced)",
    category: "backtracking",
    difficulty: "Intermediate",
    pseudocode: `function generateSubsets(nums):
    print "Starting subset generation..."
    result = []
    backtrack(nums, [], 0)
    print "All subsets generated:", result
    return result

function backtrack(nums, current, start):
    print "Adding subset:", current
    add current to result

    for i from start to len(nums) - 1:
        print "Including element:", nums[i]
        add nums[i] to current
        backtrack(nums, current, i + 1)
        print "Backtracking, removing:", nums[i]
        remove nums[i] from current
`,
    code: `// Generate all subsets using backtracking - ENHANCED VERSION
function generateSubsets(nums) {
  const result = [];
  const totalPossibleSubsets = Math.pow(2, nums.length); // 2^n subsets possible
  
  api.enter('generateSubsets', { 
    nums, 
    totalPossibleSubsets,
    inputSize: nums.length 
  });
  
  function backtrack(nums, current, start) {
    api.enter('backtrack', { 
      nums, 
      current: [...current], 
      start,
      subsetsFoundSoFar: result.length,
      remainingToFind: totalPossibleSubsets - result.length
    });
    
    // Add current subset to result
    result.push([...current]);
    api.set({ 
      subsetsGenerated: result.length,
      totalPossibleSubsets,
      progress: \`\${result.length}/\${totalPossibleSubsets}\`,
      currentSubset: [...current],
      percentComplete: Math.round((result.length / totalPossibleSubsets) * 100)
    });
    
    for (let i = start; i < nums.length; i++) {
      // Add element to current subset
      current.push(nums[i]);
      api.set({ 
        current: [...current], 
        addedElement: nums[i], 
        i,
        action: \`Added \${nums[i]} to subset\`
      });
      
      // Recursively generate subsets
      backtrack(nums, current, i + 1);
      
      // Remove element (backtrack)
      const removed = current.pop();
      api.set({ 
        current: [...current], 
        removedElement: removed,
        action: \`Removed \${removed} from subset (backtracking)\`
      });
    }
    
    api.exit();
  }
  
  backtrack(nums, [], 0);
  
  api.set({ 
    finalResult: result,
    totalSubsetsGenerated: result.length,
    allSubsets: result
  });
  api.exit(result);
  
  return result;
}

// Generate subsets of [1, 2, 3]
// Expected: 2^3 = 8 subsets total
generateSubsets([1, 2, 3]);`,
  },

  // Enhanced Algorithms with Proper Variable Tracking

  // ===============================
  // N-QUEENS PROBLEM - ENHANCED
  // ===============================
  nQueens: {
    title: "N-Queens Problem",
    description:
      "Place N queens on an NxN chessboard so no two queens threaten each other",
    category: "backtracking",
    difficulty: "Advanced",
    code: `// N-Queens problem using backtracking - ENHANCED
function solveNQueens(n) {
  const board = Array(n).fill().map(() => Array(n).fill('.'));
  const result = [];
  const totalPossiblePositions = n * n;
  
  api.enter('solveNQueens', { 
    n, 
    boardSize: \`\${n}x\${n}\`,
    totalPossiblePositions,
    expectedSolutions: n === 4 ? 2 : (n === 8 ? 92 : 'unknown')
  });
  
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
    api.enter('solve', { 
      col,
      progress: \`Column \${col + 1}/\${n}\`,
      queensPlaced: col,
      solutionsFound: result.length,
      currentBoard: board.map(row => row.join(''))
    });
    
    if (col >= n) {
      const solution = board.map(row => row.join(''));
      result.push(solution);
      api.set({ 
        foundSolution: true,
        solutionsFound: result.length,
        newSolution: solution,
        boardState: 'COMPLETE'
      });
      api.exit(true);
      return true;
    }
    
    let validPositionsInCol = 0;
    for (let row = 0; row < n; row++) {
      api.set({ 
        tryingRow: row,
        tryingPosition: \`(\${row}, \${col})\`,
        checkingConflicts: true
      });
      
      if (isValid(board, row, col)) {
        validPositionsInCol++;
        
        // Place queen
        board[row][col] = 'Q';
        api.set({ 
          placedQueen: \`(\${row}, \${col})\`,
          boardState: board.map(r => r.join('')),
          queensPlaced: col + 1,
          action: \`Placed queen at (\${row}, \${col})\`
        });
        
        // Try to place remaining queens
        if (solve(board, col + 1)) {
          api.exit(true);
          return true;
        }
        
        // Backtrack - remove queen
        board[row][col] = '.';
        api.set({ 
          removedQueen: \`(\${row}, \${col})\`,
          boardState: board.map(r => r.join('')),
          action: \`Removed queen from (\${row}, \${col}) - backtracking\`
        });
      } else {
        api.set({ 
          invalidPosition: \`(\${row}, \${col})\`,
          reason: 'Queen would be under attack'
        });
      }
    }
    
    api.set({ 
      validPositionsInCol,
      backtracking: true,
      reason: validPositionsInCol === 0 ? 'No valid positions in column' : 'All positions tried'
    });
    
    api.exit(false);
    return false;
  }
  
  solve(board, 0);
  
  api.set({ 
    totalSolutions: result.length,
    allSolutions: result
  });
  api.exit(result);
  
  return result;
}

// Solve 4-Queens problem
solveNQueens(4);`,
  },

  // ===============================
  // SUDOKU SOLVER - ENHANCED
  // ===============================
  sudoku: {
    title: "Sudoku Solver",
    description: "Solve a Sudoku puzzle using backtracking",
    category: "backtracking",
    difficulty: "Advanced",
    code: `// Sudoku solver using backtracking - ENHANCED
function solveSudoku(board) {
  const totalCells = 81;
  const emptyCells = board.flat().filter(cell => cell === 0).length;
  
  api.enter('solveSudoku', { 
    totalCells,
    emptyCells,
    filledCells: totalCells - emptyCells,
    completionRate: \`\${Math.round(((totalCells - emptyCells) / totalCells) * 100)}%\`
  });
  
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
    const currentEmpty = board.flat().filter(cell => cell === 0).length;
    
    api.enter('solve', { 
      emptyCellsRemaining: currentEmpty,
      progress: \`\${Math.round(((totalCells - currentEmpty) / totalCells) * 100)}% complete\`,
      boardState: JSON.stringify(board)
    });
    
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          api.set({ 
            currentCell: \`(\${row}, \${col})\`,
            tryingNumbers: '1-9',
            cellsRemaining: currentEmpty
          });
          
          for (let num = 1; num <= 9; num++) {
            api.set({ 
              tryingNumber: num,
              atPosition: \`(\${row}, \${col})\`,
              checkingValidity: true
            });
            
            if (isValid(board, row, col, num)) {
              // Place number
              board[row][col] = num;
              api.set({ 
                placedNumber: num,
                atPosition: \`(\${row}, \${col})\`,
                action: \`Placed \${num} at (\${row}, \${col})\`,
                cellsRemaining: currentEmpty - 1
              });
              
              if (solve(board)) {
                api.exit(true);
                return true;
              }
              
              // Backtrack
              board[row][col] = 0;
              api.set({ 
                removedNumber: num,
                fromPosition: \`(\${row}, \${col})\`,
                action: \`Removed \${num} from (\${row}, \${col}) - backtracking\`
              });
            } else {
              api.set({ 
                rejectedNumber: num,
                reason: 'Conflicts with existing numbers'
              });
            }
          }
          
          api.set({ 
            noValidNumbers: true,
            backtracking: true
          });
          api.exit(false);
          return false;
        }
      }
    }
    
    api.set({ 
      puzzleSolved: true,
      finalBoard: board
    });
    api.exit(true);
    return true;
  }
  
  const solved = solve(board);
  
  api.set({ 
    solutionFound: solved,
    finalResult: solved ? board : null
  });
  api.exit(solved ? board : null);
  
  return solved ? board : null;
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

solveSudoku(board);`,
  },

  // ===============================
  // RAT IN A MAZE - ENHANCED
  // ===============================
  maze: {
    title: "Rat in a Maze",
    description:
      "Find a path from source to destination in a maze using backtracking",
    category: "backtracking",
    difficulty: "Intermediate",
    code: `// Rat in a Maze using backtracking - ENHANCED
function solveMaze(maze) {
  const n = maze.length;
  const path = [];
  const visited = Array(n).fill().map(() => Array(n).fill(false));
  const totalCells = n * n;
  const wallCells = maze.flat().filter(cell => cell === 0).length;
  const pathCells = totalCells - wallCells;
  
  api.enter('solveMaze', { 
    mazeSize: \`\${n}x\${n}\`,
    totalCells,
    pathCells,
    wallCells,
    startPosition: '(0,0)',
    endPosition: \`(\${n-1},\${n-1})\`
  });
  
  function isValid(maze, row, col) {
    return row >= 0 && row < n && col >= 0 && col < n && 
           maze[row][col] === 1 && !visited[row][col];
  }
  
  function solveMazeUtil(maze, row, col) {
    const distanceToEnd = Math.abs(row - (n-1)) + Math.abs(col - (n-1));
    
    api.enter('solveMazeUtil', { 
      currentPosition: \`(\${row}, \${col})\`,
      pathLength: path.length,
      distanceToEnd,
      visitedCells: visited.flat().filter(v => v).length,
      currentPath: path.map(p => \`(\${p[0]},\${p[1]})\`).join(' → ')
    });
    
    // Check if we reached the destination
    if (row === n - 1 && col === n - 1) {
      path.push([row, col]);
      api.set({ 
        reachedDestination: true,
        finalPath: path.map(p => \`(\${p[0]},\${p[1]})\`).join(' → '),
        pathLength: path.length,
        success: true
      });
      api.exit(true);
      return true;
    }
    
    if (isValid(maze, row, col)) {
      // Mark as visited and add to path
      visited[row][col] = true;
      path.push([row, col]);
      
      api.set({ 
        visitedPosition: \`(\${row}, \${col})\`,
        currentPath: path.map(p => \`(\${p[0]},\${p[1]})\`).join(' → '),
        pathLength: path.length,
        action: \`Added (\${row}, \${col}) to path\`
      });
      
      // Try all four directions
      const directions = [
        { name: 'DOWN', dr: 1, dc: 0 },
        { name: 'RIGHT', dr: 0, dc: 1 },
        { name: 'UP', dr: -1, dc: 0 },
        { name: 'LEFT', dr: 0, dc: -1 }
      ];
      
      for (const dir of directions) {
        const newRow = row + dir.dr;
        const newCol = col + dir.dc;
        
        api.set({ 
          tryingDirection: dir.name,
          targetPosition: \`(\${newRow}, \${newCol})\`,
          isValidMove: isValid(maze, newRow, newCol)
        });
        
        if (solveMazeUtil(maze, newRow, newCol)) {
          api.exit(true);
          return true;
        }
      }
      
      // Backtrack
      const removedPos = path.pop();
      visited[row][col] = false;
      
      api.set({ 
        backtracking: true,
        removedFromPath: \`(\${removedPos[0]}, \${removedPos[1]})\`,
        newPathLength: path.length,
        currentPath: path.map(p => \`(\${p[0]},\${p[1]})\`).join(' → ') || 'empty',
        action: 'Backtracking - removed from path and marked unvisited'
      });
    } else {
      api.set({ 
        invalidMove: true,
        reason: row < 0 || row >= n || col < 0 || col >= n ? 'Out of bounds' :
               maze[row][col] === 0 ? 'Wall cell' : 'Already visited'
      });
    }
    
    api.exit(false);
    return false;
  }
  
  const solutionFound = solveMazeUtil(maze, 0, 0);
  
  api.set({ 
    solutionExists: solutionFound,
    finalPath: solutionFound ? path : null,
    totalSteps: solutionFound ? path.length : 0
  });
  api.exit(solutionFound ? path : null);
  
  return solutionFound ? path : null;
}

// Example maze (1 = path, 0 = wall)
const maze = [
  [1, 0, 0, 0],
  [1, 1, 0, 1],
  [0, 1, 0, 0],
  [1, 1, 1, 1]
];

solveMaze(maze);`,
  },

  // ===============================
  // FIBONACCI WITH MEMOIZATION - ENHANCED
  // ===============================
  fibonacciDP: {
    title: "Fibonacci with Memoization",
    description:
      "Calculate Fibonacci numbers using dynamic programming and memoization",
    category: "memoization",
    difficulty: "Intermediate",
    code: `// Fibonacci with memoization (Dynamic Programming) - ENHANCED
function fibonacciDP(n, memo = {}) {
  const memoSize = Object.keys(memo).length;
  const memoHitRate = memoSize > 0 ? 
    \`\${Math.round((Object.keys(memo).filter(k => parseInt(k) <= n).length / (n + 1)) * 100)}%\` : '0%';
  
  api.enter('fibonacciDP', { 
    n, 
    memoSize,
    memoKeys: Object.keys(memo).map(k => \`f(\${k})=\${memo[k]}\`),
    memoHitRate,
    expectedCallsWithoutMemo: n <= 1 ? 1 : 'exponential',
    expectedCallsWithMemo: n + 1
  });
  
  // Check if already computed
  if (n in memo) {
    api.set({ 
      memoHit: true,
      retrievedValue: memo[n],
      fromMemo: \`f(\${n}) = \${memo[n]}\`,
      timeComplexity: 'O(1)',
      savedComputation: true
    });
    api.exit(memo[n]);
    return memo[n];
  }
  
  // Base cases
  if (n <= 1) {
    memo[n] = n;
    api.set({ 
      baseCase: true,
      computedValue: n,
      memoUpdated: \`f(\${n}) = \${n}\`,
      newMemoSize: Object.keys(memo).length,
      action: \`Stored base case f(\${n}) = \${n}\`
    });
    api.exit(n);
    return n;
  }
  
  // Recursive case with memoization
  api.set({ 
    computingRecursively: true,
    needsToCompute: \`f(\${n-1}) + f(\${n-2})\`,
    memoMisses: n - memoSize
  });
  
  const result1 = fibonacciDP(n - 1, memo);
  const result2 = fibonacciDP(n - 2, memo);
  const result = result1 + result2;
  
  // Store in memo
  memo[n] = result;
  
  api.set({ 
    computed: \`f(\${n}) = f(\${n-1}) + f(\${n-2}) = \${result1} + \${result2} = \${result}\`,
    storedInMemo: \`f(\${n}) = \${result}\`,
    newMemoSize: Object.keys(memo).length,
    completeMemo: Object.keys(memo).sort((a,b) => a-b).map(k => \`f(\${k})=\${memo[k]}\`),
    efficiency: \`Saved \${Math.pow(2, n) - (n + 1)} recursive calls\`
  });
  
  api.exit(result);
  return result;
}

// Calculate fibonacci(10) with memoization
fibonacciDP(10);`,
  },

  // ===============================
  // KNAPSACK WITH MEMOIZATION - ENHANCED
  // ===============================
  knapsack: {
    title: "Knapsack with Memoization",
    description:
      "Solve the 0/1 knapsack problem using dynamic programming and memoization",
    category: "memoization",
    difficulty: "Advanced",
    code: `// 0/1 Knapsack with memoization (Dynamic Programming) - ENHANCED
function knapsack(weights, values, capacity, memo = {}) {
  const key = capacity + ',' + weights.length;
  const totalItems = weights.length;
  const totalValue = values.reduce((sum, val) => sum + val, 0);
  const totalWeight = weights.reduce((sum, wt) => sum + wt, 0);
  
  api.enter('knapsack', { 
    remainingItems: weights.length,
    remainingCapacity: capacity,
    currentItems: weights.map((w, i) => \`Item\${i+1}(w:\${w}, v:\${values[i]})\`),
    memoKey: key,
    memoSize: Object.keys(memo).length,
    totalPossibleValue: totalValue,
    totalWeight,
    utilizationRate: totalWeight > 0 ? \`\${Math.round((capacity / totalWeight) * 100)}%\` : 'N/A'
  });
  
  // Check memo
  if (key in memo) {
    api.set({ 
      memoHit: true,
      retrievedValue: memo[key],
      fromKey: key,
      savedComputation: true,
      efficiency: 'O(1) lookup'
    });
    api.exit(memo[key]);
    return memo[key];
  }
  
  // Base cases
  if (weights.length === 0 || capacity === 0) {
    memo[key] = 0;
    api.set({ 
      baseCase: true,
      reason: weights.length === 0 ? 'No items left' : 'No capacity left',
      result: 0,
      memoUpdated: \`[\${key}] = 0\`
    });
    api.exit(0);
    return 0;
  }
  
  const currentItem = {
    weight: weights[0],
    value: values[0],
    valueToWeightRatio: Math.round((values[0] / weights[0]) * 100) / 100
  };
  
  // Current item analysis
  api.set({ 
    analyzingItem: \`Item(weight:\${currentItem.weight}, value:\${currentItem.value})\`,
    valueToWeightRatio: currentItem.valueToWeightRatio,
    canFit: currentItem.weight <= capacity,
    remainingItems: weights.length - 1
  });
  
  let result;
  
  if (weights[0] > capacity) {
    // Item doesn't fit
    api.set({ 
      itemTooHeavy: true,
      itemWeight: weights[0],
      availableCapacity: capacity,
      decision: 'EXCLUDE - item too heavy',
      action: 'Skip this item and try remaining items'
    });
    
    result = knapsack(weights.slice(1), values.slice(1), capacity, memo);
  } else {
    // Item fits - try both including and excluding
    api.set({ 
      itemFits: true,
      evaluatingOptions: true,
      option1: 'INCLUDE - take item and reduce capacity',
      option2: 'EXCLUDE - skip item and keep full capacity'
    });
    
    // Option 1: Include current item
    const includeValue = values[0] + knapsack(
      weights.slice(1), 
      values.slice(1), 
      capacity - weights[0], 
      memo
    );
    
    // Option 2: Exclude current item  
    const excludeValue = knapsack(weights.slice(1), values.slice(1), capacity, memo);
    
    result = Math.max(includeValue, excludeValue);
    
    api.set({ 
      includedItemValue: \`\${values[0]} + \${includeValue - values[0]} = \${includeValue}\`,
      excludedItemValue: excludeValue,
      optimalChoice: includeValue > excludeValue ? 'INCLUDE' : 'EXCLUDE',
      maxValue: result,
      decision: \`Take \${includeValue > excludeValue ? 'INCLUDE' : 'EXCLUDE'} option\`
    });
  }
  
  // Store result in memo
  memo[key] = result;
  
  api.set({ 
    computedValue: result,
    storedInMemo: \`[\${key}] = \${result}\`,
    newMemoSize: Object.keys(memo).length,
    subproblemsolved: true,
    efficiency: \`Avoided \${Math.pow(2, totalItems) - Object.keys(memo).length} redundant calculations\`
  });
  
  api.exit(result);
  return result;
}

// Example: weights, values, and capacity
const weights = [2, 3, 4, 5];
const values = [3, 4, 5, 6];
const capacity = 10;

// Expected optimal value: 10 (items with weights 2,3,5 and values 3,4,6)
knapsack(weights, values, capacity);`,
  },
};
