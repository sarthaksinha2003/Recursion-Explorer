import React from 'react';

const CallStack = ({ stack }) => {
  if (!stack || stack.length === 0) {
    return (
      <div className="max-h-[400px] overflow-auto">
        <div className="text-sm text-muted-foreground p-4 text-center border rounded-md bg-gray-50">
          <div className="mb-2">📚</div>
          <div>Call stack is empty</div>
          <div className="text-xs mt-1">Functions will appear here as they execute</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-[400px] overflow-auto">
      <div className="space-y-2">
        {/* Show frames from bottom to top (reverse order for visual stack) */}
        {stack.slice().reverse().map((frame, visualIndex) => {
          const actualIndex = stack.length - 1 - visualIndex;
          const isTop = actualIndex === stack.length - 1;
          const isBottom = actualIndex === 0;
          
          return (
            <div
              key={frame.id || `frame-${visualIndex}`}
              className={`rounded-lg border px-4 py-3 text-sm transition-all duration-300 ${
                isTop 
                  ? "bg-blue-50 border-blue-300 shadow-md ring-1 ring-blue-200" 
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
            >
              {/* Stack level indicator */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium ${isTop ? 'text-blue-600' : 'text-gray-500'}`}>
                  {isBottom ? "🏠 Bottom Frame" : isTop ? "⬆️ Current Frame" : `📍 Level ${actualIndex}`}
                </span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                  Depth: {frame.depth}
                </span>
              </div>
              
              {/* Function call information */}
              <div className="flex items-start gap-3">
                {/* Status icon */}
                <div className="flex-shrink-0 mt-1">
                  {frame.status === 'completed' ? (
                    <span className="text-green-600 text-lg" title="Function completed">
                      ✅
                    </span>
                  ) : frame.status === 'pruned' ? (
                    <span className="text-orange-600 text-lg" title="Execution pruned">
                      ✂️
                    </span>
                  ) : (
                    <span className="text-blue-600 text-lg" title="Function executing">
                      ⚡
                    </span>
                  )}
                </div>
                
                {/* Function signature and details */}
                <div className="flex-1 min-w-0">
                  {/* Function name and parameters */}
                  <div className="font-mono text-base font-semibold break-words mb-1">
                    <span className="text-purple-700">{frame.name}</span>
                    <span className="text-gray-600">(</span>
                    {Object.entries(frame.vars || {}).map(([key, value], i, arr) => (
                      <span key={key}>
                        <span className="text-blue-600 font-medium">{key}</span>
                        <span className="text-gray-500">: </span>
                        <span className="text-green-600 font-medium">
                          {typeof value === 'object' 
                            ? JSON.stringify(value) 
                            : String(value)
                          }
                        </span>
                        {i < arr.length - 1 && <span className="text-gray-500">, </span>}
                      </span>
                    ))}
                    <span className="text-gray-600">)</span>
                  </div>
                  
                  {/* Return value (only show for completed functions) */}
                  {frame.status === 'completed' && frame.result !== null && frame.result !== undefined && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-medium text-sm">↩️ Returns:</span>
                        <span className="font-mono text-green-700 font-bold">
                          {typeof frame.result === 'object' 
                            ? JSON.stringify(frame.result) 
                            : String(frame.result)
                          }
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Status indicator for active functions */}
                  {frame.status === 'active' && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-blue-600 font-medium text-sm">Executing...</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Pruned status */}
                  {frame.status === 'pruned' && (
                    <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-orange-600 font-medium text-sm">⚠️ Execution pruned</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Stack visualization helper */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-xs text-gray-600 text-center">
          <div className="font-medium mb-1">📚 Call Stack Visualization</div>
          <div className="flex items-center justify-center gap-4 text-xs">
            <span>⬆️ Top (Current)</span>
            <span>•</span>
            <span>🏠 Bottom (First Call)</span>
          </div>
          <div className="mt-1 text-gray-500">
            Functions are pushed on call, popped on return
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallStack;