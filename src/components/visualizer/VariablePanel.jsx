// VariablePanel.jsx
import React from "react";

export const VariablePanel = ({ vars }) => {
  return (
    <div className="max-h-[400px] overflow-auto">
      <div className="rounded-md border p-3 text-sm">
        {vars && Object.keys(vars).length > 0 ? (
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 border-b pb-2">
              Current Variables
            </div>
            {Object.entries(vars).map(([key, value]) => (
              <div key={key} className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">
                    {key}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {typeof value}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded px-2 py-1">
                  <span className="font-mono text-sm text-gray-800 dark:text-gray-200">
                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">No variables at this step</p>
            <p className="text-xs text-muted-foreground mt-1">Run code to see variables</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VariablePanel;
