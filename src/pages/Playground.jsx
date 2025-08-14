// Playground.jsx - Complete updated version
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Editor from "@monaco-editor/react";
import { useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import Seo from "@/components/seo/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Controls from "@/components/visualizer/Controls";
import ExecutionTree from "@/components/visualizer/ExecutionTree";
import EnhancedExecutionTree from "@/components/visualizer/EnhancedExecutionTree";
import CallStack from "@/components/visualizer/CallStack";
import VariablePanel from "@/components/visualizer/VariablePanel";
import Settings from "@/components/visualizer/Settings";
import { runCode, getStackAtStep, getVariablesAtStep, getTotalSteps } from "@/lib/tracer";
import { examples } from "@/lib/examples";
import { getSavedAlgorithms, saveAlgorithm, generateShareableLink, parseSharedLink, saveCurrentSession } from "@/lib/storage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, Save } from "lucide-react";

const DEFAULT_CODE = `// Welcome! Write instrumented JS using the "api" helpers: enter, set, prune, exit.
// Example: Factorial with tracing
function fact(n){
  api.enter('fact', { n });
  if(n <= 1){
    api.exit(1);
    return 1;
  }
  const res = n * fact(n-1);
  api.set({ res });
  api.exit(res);
  return res;
}

// Run the function to generate snapshots
const result = fact(5);
api.set({ result });`;

const DEFAULT_JAVA = `// Java sample (not executable in this playground)
class Main {
  static int fact(int n){
    if(n <= 1) return 1;
    return n * fact(n - 1);
  }
  public static void main(String[] args){
    int result = fact(5);
    System.out.println(result);
  }
}`;

// Debug root used when runCode fails
const DEBUG_ROOT = {
  id: 'root-debug',
  name: 'main',
  vars: { debug: true },
  status: 'active',
  executionSteps: [
    {
      stepNumber: 1,
      type: 'enter',
      nodeId: 'debug-1',
      stackSnapshot: [{ id: 'debug-1', name: 'debug', depth: 0, vars: { debug: true }, status: 'active' }]
    }
  ],
  totalSteps: 1,
  nodeRegistry: {
    'debug-1': { id: 'debug-1', name: 'debug', vars: { debug: true }, status: 'active' }
  },
  children: []
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Playground = () => {
  const [search] = useSearchParams();
  const exampleId = search.get("example");
  const customId = search.get("custom");
  const isShared = search.get("shared") === "true";
  
  const example = useMemo(() => exampleId ? examples[exampleId] : null, [exampleId]);
  const customAlgorithm = useMemo(() => {
    if (!customId) return null;
    const savedAlgorithms = getSavedAlgorithms();
    return savedAlgorithms.find(algo => algo.id === customId);
  }, [customId]);
  
  // Handle shared links
  const sharedData = useMemo(() => {
    if (!isShared) return null;
    return parseSharedLink();
  }, [isShared]);

  const getInitialCode = () => {
    if (sharedData) return sharedData.code;
    if (customAlgorithm) return customAlgorithm.code;
    if (example) return example.code;
    return DEFAULT_CODE;
  };

  const getInitialLanguage = () => {
    if (sharedData) return sharedData.language;
    if (customAlgorithm) return customAlgorithm.language;
    return "javascript";
  };

  const [code, setCode] = useState(getInitialCode());
  const [root, setRoot] = useState(null);
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [language, setLanguage] = useState(getInitialLanguage());
  const [viewMode, setViewMode] = useState("stack");
  const [autoPlay, setAutoPlay] = useState(true);
  const { isAuthenticated, token } = useAuth();
  const [settings, setSettings] = useState({
    showVariables: true,
    showCallStack: true,
    treeLayout: "vertical",
    animationSpeed: "normal",
    theme: "light"
  });

  useEffect(() => {
    if (example) setCode(example.code);
  }, [example]);
  
  useEffect(() => {
    if (customAlgorithm) {
      setCode(customAlgorithm.code);
      setLanguage(customAlgorithm.language);
    }
  }, [customAlgorithm]);

  useEffect(() => {
    if (sharedData) {
      setCode(sharedData.code);
      setLanguage(sharedData.language);
    }
  }, [sharedData]);
  
  const hasRoot = root !== null;

  // -------------------------
  // NEW STEP-BASED HELPERS
  // -------------------------

  const getCurrentStack = () => {
    if (!root) return [];
    
    const stack = getStackAtStep(root, step);
    
    // Convert to format expected by CallStack component
    return stack.map(frame => ({
      id: frame.id,
      name: frame.name,
      depth: frame.depth,
      vars: frame.vars || {},
      status: frame.status,
      result: frame.result
    }));
  };

  const getCurrentVariables = () => {
    if (!root) return null;
    return getVariablesAtStep(root, step);
  };

  const getCurrentStepInfo = () => {
    const totalSteps = getTotalSteps(root);
    
    if (!root || totalSteps === 0) {
      return { currentNode: null, totalSteps: 0 };
    }
    
    const currentStepData = root.executionSteps?.[Math.min(step, root.executionSteps.length - 1)];
    const currentNode = currentStepData ? root.nodeRegistry?.[currentStepData.nodeId] : null;
    
    return { currentNode, totalSteps };
  };

  // Animation effect for stack mode
  useEffect(() => {
    if (!isPlaying || !hasRoot || viewMode !== "stack") return;
    
    const { totalSteps } = getCurrentStepInfo();
    if (step >= totalSteps - 1) {
      setIsPlaying(false);
      return;
    }
    
    const timer = setTimeout(() => {
      setStep(prev => Math.min(prev + 1, totalSteps - 1));
    }, 1000 / speed);
    
    return () => clearTimeout(timer);
  }, [isPlaying, step, speed, hasRoot, viewMode, root]);

  useEffect(() => {
    try {
      getCurrentStack();
    } catch (e) {
      // ignore
    }
  }, [step, root]);

  // -------------------------
  // EVENT HANDLERS
  // -------------------------

  const onRun = async () => {
    try {
      setRoot(null);
      setStep(0);
      setIsPlaying(false);

      let newRoot;
      try {
        newRoot = runCode(code);
        if (newRoot && typeof newRoot.then === 'function') {
          newRoot = await newRoot;
        }
        } catch (err) {
          newRoot = null;
        }

      // Enhanced validation - check for executionSteps
      const isValidRoot = newRoot && 
                         typeof newRoot === 'object' && 
                         (Array.isArray(newRoot.children) || Array.isArray(newRoot.executionSteps));

      const finalRoot = isValidRoot ? newRoot : DEBUG_ROOT;

      // Expose for console debugging
      window.__LAST_ROOT = finalRoot;

      // Enhanced root created

      setRoot(finalRoot);
      setStep(0);
      setIsPlaying(false);
      
      // Auto-play if enabled and we have steps to show
      const totalSteps = getTotalSteps(finalRoot);
      if (autoPlay && totalSteps > 0) {
        setIsPlaying(true);
      }

      toast.success(`Code executed — ${totalSteps} execution steps recorded`);
    } catch (err) {
      toast.error('Execution failed');
    }
  };

  const onReset = () => {
    setRoot(null);
    setStep(0);
    setIsPlaying(false);
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to save algorithms");
      return;
    }

    const name = prompt("Enter a name for this algorithm:");
    if (!name) return;

    try {
      const response = await fetch(`${API_BASE_URL}/algorithms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: name,
          description: '',
          code,
          language,
          category: 'Custom',
          isPublic: false,
          tags: [],
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save algorithm');
      }

      toast.success('Algorithm saved to your dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save algorithm');
    }
  };

  const handleShare = async () => {
    try {
      const shareableLink = generateShareableLink(code, language);
      await navigator.clipboard.writeText(shareableLink);
      toast.success("Shareable link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to generate shareable link");
    }
  };

  const handleSaveSession = () => {
    try {
      saveCurrentSession({
        code,
        language,
        root,
        step,
        timestamp: new Date().toISOString()
      });
      toast.success("Session saved to local storage!");
    } catch (error) {
      toast.error("Failed to save session");
    }
  };

  return (
    <>
      <Seo
        title="Algorithm Playground - Recursion Explorer"
        description="Write and run recursive algorithms with real-time visualization. Step through execution and understand recursion step by step."
        canonical="/playground"
      />
      
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Home className="w-4 h-4" />
                  Home
                </Button>
              </Link>
              <h1 className="text-xl font-semibold">Algorithm Playground</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Save button moved to bottom of settings */}
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-4 gap-6 mb-6">
            {/* Code Editor */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Code Editor
                  <div className="flex items-center gap-2">
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="javascript">JS</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md overflow-hidden">
                  <Editor
                    height="500px"
                    defaultLanguage={language}
                    value={code}
                    onChange={setCode}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: "on",
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={onRun} className="flex-1">
                    Run Code
                  </Button>
                  <Button variant="outline" onClick={onReset} disabled={!hasRoot}>
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <div>
              <div className="w-full">
                <Settings
                  speed={speed}
                  setSpeed={setSpeed}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  autoPlay={autoPlay}
                  setAutoPlay={setAutoPlay}
                />
                <div className="mt-4">
                  <Button variant="outline" size="sm" onClick={handleSave} className="w-full h-10">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Controls - Only shown in stack mode */}
          {hasRoot && viewMode === "stack" && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <Controls
                  isPlaying={isPlaying}
                  onTogglePlay={() => setIsPlaying(!isPlaying)}
                  onStep={() => {
                    const { totalSteps } = getCurrentStepInfo();
                    if (totalSteps > 0) {
                      setStep(prev => Math.min(prev + 1, totalSteps - 1));
                    }
                  }}
                  onReset={onReset}
                  speed={speed}
                  onSpeedChange={setSpeed}
                />
                
                {/* Progress Indicator */}
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                  <span>Step {step + 1} of {getCurrentStepInfo().totalSteps}</span>
                  <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${getCurrentStepInfo().totalSteps > 0 ? ((step + 1) / getCurrentStepInfo().totalSteps) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Visualization */}
          {hasRoot && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Execution Tree/Stack */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {viewMode === "tree" ? "Execution Tree" : "Call Stack"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-hidden">
                    {viewMode === "tree" ? (
                      <div className="h-[800px] w-full" style={{ overflow: 'auto' }}>
                        <EnhancedExecutionTree
                          root={root}
                          currentStep={step}
                          speed={speed}
                          settings={settings}
                          width={1200}
                          height={800}
                        />
                      </div>
                    ) : (
                      <CallStack
                        stack={getCurrentStack()}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Variable Panel - Only shown in stack mode */}
              {viewMode === "stack" && (
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Variables</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <VariablePanel
                        vars={getCurrentVariables()}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Help */}
          {!hasRoot && (
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p>
                    Write JavaScript code using the <code>api</code> helpers to trace execution:
                  </p>
                  <ul>
                    <li><code>api.enter(name, args)</code> - Mark function entry</li>
                    <li><code>api.set(variables)</code> - Update variable values</li>
                    <li><code>api.exit(result)</code> - Mark function exit with result</li>
                  </ul>
                  <p>
                    Click "Run Code" to execute and visualize your algorithm step by step!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default Playground;