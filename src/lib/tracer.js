// Enhanced tracer.js - Records execution steps for proper call stack visualization
// REPLACE YOUR ENTIRE tracer.js FILE WITH THIS CONTENT

export class TreeNode {
  constructor(name, vars = null) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.name = name;
    this.vars = vars || {};
    this.children = [];
    this.parent = null;
    this.status = 'active';
    this.result = null;
    this.step = 0;
    this.depth = 0;
  }

  addChild(node) {
    this.children.push(node);
    node.parent = this;
    return node;
  }

  markCompleted(result = null) {
    this.status = 'completed';
    this.result = result;
  }

  markPruned() {
    this.status = 'pruned';
    this.children.forEach(child => child.markPruned());
  }

  updateVars(vars) {
    this.vars = { ...this.vars, ...vars };
  }
}

// New: Execution step types for call stack simulation
export const StepType = {
  ENTER: 'enter',
  EXIT: 'exit',
  SET_VARS: 'set_vars',
  PRUNE: 'prune'
};

export class ExecutionStep {
  constructor(type, nodeId, data = {}) {
    this.type = type;
    this.nodeId = nodeId;
    this.data = data;
    this.stepNumber = 0;
    this.stackSnapshot = [];
  }
}

export function buildSnapshots(code) {
  let callStack = [];
  let root = null;
  let stepCounter = 0;
  let executionSteps = []; // New: Store all execution steps
  let nodeRegistry = new Map(); // Keep track of all nodes by ID

  // Helper to create stack snapshot for current step
  const createStackSnapshot = () => {
    return callStack.map(node => ({
      id: node.id,
      name: node.name,
      depth: node.depth,
      vars: { ...node.vars },
      status: node.status,
      result: node.result
    }));
  };

  // Helper to record an execution step
  const recordStep = (type, nodeId, data = {}) => {
    stepCounter++;
    const step = new ExecutionStep(type, nodeId, data);
    step.stepNumber = stepCounter;
    step.stackSnapshot = createStackSnapshot();
    executionSteps.push(step);
    
    console.log(`Step ${stepCounter}: ${type} for node ${nodeId}`, {
      stackDepth: callStack.length,
      data
    });
    
    return step;
  };

  // Create API for code instrumentation
  const api = {
    enter: (name, vars = null) => {
      const node = new TreeNode(name, vars);
      node.depth = callStack.length;
      nodeRegistry.set(node.id, node);
      
      if (!root) {
        root = node;
      } else if (callStack.length > 0) {
        // Add as child of the current function call
        const parent = callStack[callStack.length - 1];
        parent.addChild(node);
      }
      
      callStack.push(node);
      
      // Record the ENTER step AFTER pushing to stack
      recordStep(StepType.ENTER, node.id, { name, vars, depth: node.depth });
    },
    
    exit: (result = null) => {
      if (callStack.length > 0) {
        const node = callStack[callStack.length - 1];
        node.markCompleted(result);
        
        // Record the EXIT step BEFORE popping from stack
        recordStep(StepType.EXIT, node.id, { result });
        
        callStack.pop();
      }
    },
    
    set: (vars) => {
      if (callStack.length > 0) {
        const currentNode = callStack[callStack.length - 1];
        currentNode.updateVars(vars);
        
        recordStep(StepType.SET_VARS, currentNode.id, { vars });
      }
    },
    
    prune: () => {
      if (callStack.length > 0) {
        const currentNode = callStack[callStack.length - 1];
        currentNode.markPruned();
        
        recordStep(StepType.PRUNE, currentNode.id);
      }
    }
  };

  try {
    // Create sandbox environment for code execution
    const sandbox = { api };

    // Execute the code in the sandbox
    const fn = new Function(...Object.keys(sandbox), code);
    fn.apply(null, Object.values(sandbox));

    // Create enhanced root with execution steps
    const enhancedRoot = {
      ...root,
      executionSteps,
      nodeRegistry: Object.fromEntries(nodeRegistry),
      totalSteps: stepCounter
    };

    console.log('Enhanced execution complete:', {
      totalSteps: stepCounter,
      stepsRecorded: executionSteps.length,
      rootChildren: root?.children?.length || 0
    });
    
    return enhancedRoot;
  } catch (error) {
    console.error('Code execution failed:', error);
    throw error;
  }
}

export function runCode(code, input) {
  try {
    // Build snapshots by tracing the code execution
    const root = buildSnapshots(code);
    
    // Return the enhanced root node for visualization
    return root;
  } catch (error) {
    console.error('Code execution failed:', error);
    throw error;
  }
}

// New: Helper functions for the Playground component

/**
 * Get call stack state at a specific step number
 */
export function getStackAtStep(root, stepNumber) {
  if (!root || !root.executionSteps) {
    return [];
  }

  // Find the execution step at or before the requested step
  const targetStep = root.executionSteps.find(step => step.stepNumber === stepNumber + 1) ||
                    root.executionSteps[Math.min(stepNumber, root.executionSteps.length - 1)];

  if (!targetStep) {
    return [];
  }

  // For EXIT steps, we need to show the state BEFORE the pop
  if (targetStep.type === StepType.EXIT) {
    // Find the previous step to get pre-exit stack state
    const prevStepIndex = root.executionSteps.findIndex(s => s.stepNumber === targetStep.stepNumber) - 1;
    if (prevStepIndex >= 0) {
      const prevStep = root.executionSteps[prevStepIndex];
      // Show the previous stack but mark the exiting function as completed
      return prevStep.stackSnapshot.map((frame, index, array) => {
        if (index === array.length - 1 && frame.id === targetStep.nodeId) {
          return {
            ...frame,
            status: 'completed',
            result: targetStep.data.result
          };
        }
        return frame;
      });
    }
  }

  return targetStep.stackSnapshot || [];
}

/**
 * Get variables at a specific step number
 */
export function getVariablesAtStep(root, stepNumber) {
  const stack = getStackAtStep(root, stepNumber);
  
  if (stack.length === 0) {
    return null;
  }

  // Get variables from the top frame (current function)
  const topFrame = stack[stack.length - 1];
  
  // Merge with parent scope variables (bottom-up, don't override child vars)
  const allVars = {};
  
  // Add parent variables first (so child variables can override them)
  for (let i = 0; i < stack.length - 1; i++) {
    const frame = stack[i];
    Object.entries(frame.vars || {}).forEach(([key, value]) => {
      if (!(key in allVars)) {
        allVars[key] = value;
      }
    });
  }
  
  // Add current frame variables last (highest priority)
  Object.entries(topFrame.vars || {}).forEach(([key, value]) => {
    allVars[key] = value;
  });

  return Object.keys(allVars).length > 0 ? allVars : null;
}

/**
 * Get total number of execution steps
 */
export function getTotalSteps(root) {
  return root?.totalSteps || root?.executionSteps?.length || 0;
}