import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { TreeNode } from "@/lib/tracer";

const EnhancedExecutionTree = ({ root, width = 1800, height = 1200, settings }) => {
  const svgRef = useRef(null);
  const [treeDimensions, setTreeDimensions] = useState({ width: 1800, height: 1200 });

  useEffect(() => {
    if (!root || !svgRef.current) return;

    // Received root

    // Safety check - ensure root has valid structure
    if (!root.children || !Array.isArray(root.children)) {
      return;
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Improved tree size calculation that actually counts nodes
    const calculateTreeSize = (node, depth = 0) => {
      if (!node.children || node.children.length === 0) {
        return { width: 1, height: 1 };
      }
      
      let totalWidth = 0;
      let maxHeight = depth + 1;
      
      for (const child of node.children) {
        const childSize = calculateTreeSize(child, depth + 1);
        totalWidth += childSize.width;
        maxHeight = Math.max(maxHeight, childSize.height);
      }
      
      return { width: Math.max(1, totalWidth), height: maxHeight };
    };

    // Count actual nodes for better sizing
    const countNodes = (node) => {
      if (!node.children || node.children.length === 0) return 1;
      return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
    };

    const totalNodes = countNodes(root);
    const treeSize = calculateTreeSize(root);
    
    // Increase spacing to accommodate larger trees
    const nodeSpacing = 250; // Increased from 180 to give more horizontal space
    const levelSpacing = 200; // Increased from 150 to give more vertical space
    
    // Calculate required dimensions with larger padding
    const minWidth = 3000; // Increased to ensure enough width
    const minHeight = 3000; // Increased to ensure enough height
    
    // Use actual node count and tree structure for sizing with more generous spacing
    const requiredWidth = Math.max(minWidth, Math.max(treeSize.width * nodeSpacing, totalNodes * 300) + 2000); // Increased padding
    const requiredHeight = Math.max(minHeight, treeSize.height * levelSpacing + 2000); // Increased padding
    
    // sizing computed
    
    setTreeDimensions({ width: requiredWidth, height: requiredHeight });

    const margin = { top: 600, right: 600, bottom: 600, left: 600 }; // Increased margins for better centering
    const innerWidth = requiredWidth - margin.left - margin.right;
    const innerHeight = requiredHeight - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create tree layout with proper vertical orientation
    const tree = d3.tree()
      .size([innerHeight, innerWidth]) // [height, width] for vertical layout
      .separation((a, b) => {
        // Improved separation logic for better spacing
        // Increase separation values to prevent node overlap
        // Use much larger separation for nodes at different depths
        const depthDiff = Math.abs(a.depth - b.depth);
        const siblingSeparation = 8.0; // Increased from 6.0 for better spacing with larger nodes
        const depthSeparation = depthDiff > 0 ? 7.0 : 6.5; // Increased to prevent node overlap with larger nodes
        return siblingSeparation * depthSeparation;
      });
    
    // Create hierarchy with safety check
    const hierarchy = d3.hierarchy(root, (d) => {
      if (d && d.children && Array.isArray(d.children)) {
        // processing node
        return d.children;
      }
      return [];
    });
    
    const treeData = tree(hierarchy);
    // descendants computed
    
    // Center the tree within the available space
    const descendants = treeData.descendants();
    if (descendants.length > 0) {
      const xExtent = d3.extent(descendants, d => d.x);
      const yExtent = d3.extent(descendants, d => d.y);
      
      // Calculate centering offsets with moderate padding
      const xOffset = (innerWidth - (xExtent[1] - xExtent[0])) / 2 - xExtent[0];
      const yOffset = (innerHeight - (yExtent[1] - yExtent[0])) / 2 - yExtent[0];
      
      // Apply centering offsets to all nodes
      descendants.forEach(d => {
        d.x += xOffset;
        d.y += yOffset;
      });
      
      // Ensure minimum spacing from edges
      const minMargin = 400; // Increased from 200 to ensure tree doesn't get cut off
      const finalXExtent = d3.extent(descendants, d => d.x);
      const finalYExtent = d3.extent(descendants, d => d.y);
      
      // Adjust if tree is too close to edges
      if (finalXExtent[0] < minMargin) {
        const adjustX = minMargin - finalXExtent[0];
        descendants.forEach(d => d.x += adjustX);
      }
      if (finalYExtent[0] < minMargin) {
        const adjustY = minMargin - finalYExtent[0];
        descendants.forEach(d => d.y += adjustY);
      }
    }
    
    // tree data prepared

    // Safety check - ensure we have valid descendants
    if (!descendants || descendants.length === 0) {
      return;
    }

    // Safety check - ensure we have valid links
    const links = treeData.links();
    if (!links || links.length === 0) {
      return;
    }

    // Add links with depth-based styling and improved connection to nodes
    g.selectAll(".link")
      .data(links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.linkVertical() // Use vertical link generator
        .x((d) => d.x)  // x position for horizontal placement
        .y((d) => d.y)  // y position for vertical placement
        .source(d => ({ // Adjust source position to start from the bottom of the node
          x: d.source.x,
          y: d.source.y + 15 // Add offset to start from the bottom of the circle
        }))
        .target(d => ({ // Adjust target position to connect to the top of the node
          x: d.target.x,
          y: d.target.y - 15 // Subtract offset to connect to the top of the circle
        }))
      )
      .style("fill", "none")
      .style("stroke", (d) => {
        // Color links based on depth for better visualization
        const sourceDepth = d.source.depth || 0;
        const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444'];
        return colors[sourceDepth % colors.length] || '#6b7280';
      })
      .style("stroke-width", (d) => {
        // Thicker lines for better visibility
        const sourceDepth = d.source.depth || 0;
        return Math.max(2, 4 - sourceDepth); // Increased thickness for better visibility
      })
      .style("opacity", 0)
      .transition()
      .duration(settings?.animationSpeed === 'slow' ? 800 : settings?.animationSpeed === 'fast' ? 200 : 400)
      .style("opacity", 0.8) // Increased opacity
      .style("stroke-dasharray", "none"); // Removed dash pattern for cleaner lines

    // Add nodes - ensure all nodes from descendants are rendered
    // rendering nodes
    
    // Force minimum vertical spacing between nodes to prevent overlap
    const minVerticalSpacing = 450; // Increased from 350 to accommodate larger nodes
    
    // First, sort nodes by depth to ensure consistent positioning
    descendants.sort((a, b) => a.depth - b.depth);
    
    // Set explicit vertical positions based on depth
    descendants.forEach(node => {
      // Position nodes at fixed vertical intervals based on depth
      node.y = node.depth * minVerticalSpacing + 250; // Increased vertical offset from 200 to 250
      
      // Log the adjusted position
      // adjusted node position
    });
    
    // Additional spacing adjustments for nodes at the same depth
    for (let i = 0; i < descendants.length; i++) {
      for (let j = i + 1; j < descendants.length; j++) {
        // If nodes are at the same depth and too close horizontally, adjust their positions
        if (descendants[i].depth === descendants[j].depth && 
            Math.abs(descendants[i].x - descendants[j].x) < 350) { // Increased from 250 to 350
          descendants[j].x = descendants[i].x + 400; // Increased from 300 to 400 for better horizontal separation
        }
      }
    }
    
    // After adjusting node positions, update the links to match the new positions
    g.selectAll(".link").remove(); // Remove existing links
    
    // Re-add links with updated positions using custom path instead of d3.linkVertical
    g.selectAll(".link")
      .data(treeData.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d => {
        // Create a custom path for better connection
        const sourceX = d.source.x;
        const sourceY = d.source.y + 80; // Bottom of source node, adjusted from 60 to 80
        const targetX = d.target.x;
        const targetY = d.target.y - 80; // Top of target node, adjusted from -60 to -80
        
        // Calculate control points for a smooth curve
        const midY = sourceY + (targetY - sourceY) * 0.5;
        
        // Add slight horizontal offset to control points for more natural curves
        const sourceControlX = sourceX;
        const sourceControlY = sourceY + (targetY - sourceY) * 0.3;
        const targetControlX = targetX;
        const targetControlY = targetY - (targetY - sourceY) * 0.3;
        
        // Create a path with a smooth curve using multiple control points
        return `M${sourceX},${sourceY} C${sourceControlX},${sourceControlY} ${targetControlX},${targetControlY} ${targetX},${targetY}`;
      })
      .style("fill", "none")
      .style("stroke", d => {
        const sourceDepth = d.source.depth || 0;
        const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444'];
        return colors[sourceDepth % colors.length] || '#6b7280';
      })
      .style("stroke-width", d => Math.max(4, 6 - (d.source.depth || 0))) // Increased from 4px to 6px
      .style("opacity", 1.0) // Increased from 0.9 to 1.0
    
    const nodeSelection = g
      .selectAll(".node")
      .data(descendants)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x},${d.y})`); // Proper vertical layout: x for horizontal, y for vertical

    // Style nodes with transition
    nodeSelection
      .style("opacity", 0)
      .transition()
      .duration(settings?.animationSpeed === 'slow' ? 800 : settings?.animationSpeed === 'fast' ? 200 : 400)
      .style("opacity", 1);

    // Add circles for nodes with increased visibility
    nodeSelection
      .append("circle")
      .attr("r", (d) => 80 + (d.depth * 8)) // Significantly increased size for better visibility
      .style("fill", (d) => {
        // Color based on depth for better visualization
        const depth = d.depth || 0;
        const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444'];
        return colors[depth % colors.length] || '#6b7280';
      })
      .style("stroke", "#fff")
      .style("stroke-width", "8px") // Increased stroke width for better visibility
      .style("opacity", 1.0) // Full opacity for better visibility
      .each(function(d) { // Add connection points for debugging
        // Add a small dot at the top of each node to visualize connection point
        d3.select(this.parentNode)
          .append("circle")
          .attr("r", 12) // Increased from 9 to 12
          .attr("cy", -80) // Position at the top of the node, adjusted from -60 to -80
          .style("fill", "#fff")
          .style("stroke", "#000")
          .style("stroke-width", "3px") // Increased from 2px to 3px
          .style("opacity", 0.7);
        
        // Add a small dot at the bottom of each node to visualize connection point
        d3.select(this.parentNode)
          .append("circle")
          .attr("r", 12) // Increased from 9 to 12
          .attr("cy", 80) // Position at the bottom of the node, adjusted from 60 to 80
          .style("fill", "#fff")
          .style("stroke", "#000")
          .style("stroke-width", "3px") // Increased from 2px to 3px
          .style("opacity", 0.7);
      });

    // Add labels with step and depth information
    nodeSelection
      .append("text")
      .attr("dy", ".35em")
      .attr("x", (d) => {
        // Smart positioning to avoid overlap
        if (d.children && d.children.length > 0) {
          // Parent nodes: position above
          return 0;
        } else {
          // Leaf nodes: position below
          return 0;
        }
      })
      .attr("y", (d) => {
        // Smart positioning to avoid overlap
        if (d.children && d.children.length > 0) {
          // Parent nodes: position above
          return -120; // Further adjusted to prevent overlap
        } else {
          // Leaf nodes: position below
          return 120; // Further adjusted to prevent overlap
        }
      })
      .style("text-anchor", "middle") // Center align all text
      .style("font-family", "monospace")
      .style("font-size", "28px") // Increased for better visibility with larger nodes
      .style("font-weight", "bold")
      .style("stroke-width", "1px") // Added stroke width for better text visibility
      .text((d) => {
        // Shorter, more readable labels
        const stepInfo = `S${d.data.step || 0}`;
        const depthInfo = `D${d.depth}`;
        const name = d.data.name || 'func';
        
        // Only show variables if they're short and important
        const vars = d.data.vars ? Object.entries(d.data.vars)
          .filter(([k, v]) => {
            // Only show simple, short variables
            const value = JSON.stringify(v);
            return value.length < 20 && !k.includes('result');
          })
          .slice(0, 2) // Limit to 2 variables
          .map(([k, v]) => `${k}:${JSON.stringify(v)}`)
          .join(", ") : "";
        
        if (vars) {
          return `${name} [${stepInfo}|${depthInfo}]\n${vars}`;
        } else {
          return `${name} [${stepInfo}|${depthInfo}]`;
        }
      });

    // Add secondary labels for additional info (positioned to avoid overlap)
    nodeSelection
      .append("text")
      .attr("class", "secondary-text")
      .attr("dy", ".35em")
      .attr("x", 0)
      .attr("y", (d) => {
        // Position secondary info below main label
        if (d.children && d.children.length > 0) {
          return -80; // Further adjusted to prevent overlap with main label
        } else {
          return 160; // Further adjusted to prevent overlap with main label
        }
      })
      .style("text-anchor", "middle")
      .style("font-family", "monospace")
      .style("font-size", "24px") // Increased for better visibility with larger nodes
      .style("font-weight", "normal")
      .style("stroke-width", "0.7px") // Added stroke width for better text visibility
      .text((d) => {
        // Show result if available
        if (d.data.result !== null && d.data.result !== undefined) {
          const result = String(d.data.result);
          return result.length > 15 ? result.substring(0, 15) + '...' : result;
        }
        return '';
      });

    // Add tooltips with detailed information
    nodeSelection
      .append("title")
      .text((d) => {
        const stepInfo = `Step: ${d.data.step || 0}`;
        const depthInfo = `Depth: ${d.depth}`;
        const statusInfo = `Status: ${d.data.status}`;
        const resultInfo = d.data.result !== null ? `Result: ${d.data.result}` : 'No result yet';
        const vars = d.data.vars ? 
          Object.entries(d.data.vars)
            .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
            .join("\n") : 
          "No variables";
        return `${d.data.name}\n${stepInfo}\n${depthInfo}\n${statusInfo}\n${resultInfo}\n\nVariables:\n${vars}`;
      });

  }, [root, width, height, settings]);

  const exportAsPNG = () => {
    if (!svgRef.current) return;
    
    const svgElement = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    if (!ctx) return;
    
    canvas.width = treeDimensions.width;
    canvas.height = treeDimensions.height;
    
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement("a");
          link.download = "execution-tree.png";
          link.href = URL.createObjectURL(blob);
          link.click();
          URL.revokeObjectURL(link.href);
        }
      });
    };
    
    img.src = url;
  };

  const exportAsSVG = () => {
    if (!svgRef.current) return;
    
    const svgElement = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.download = "execution-tree.svg";
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Expose export functions to parent component
  useEffect(() => {
    window.exportTreeAsPNG = exportAsPNG;
    window.exportTreeAsSVG = exportAsSVG;
    
    return () => {
      delete window.exportTreeAsPNG;
      delete window.exportTreeAsSVG;
    };
  }, []);

  if (!root) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Run code to see the execution tree
      </div>
    );
  }

  return (
    <div className="w-full">
      <style jsx>{`
        .tree-wrapper {
          width: 100%;
          min-height: 400px;
          overflow: auto;
          border-radius: 0.5rem;
          background: white;
          border: 1px solid #e5e7eb;
          overflow-x: auto;
          overflow-y: auto;
        }
        
        .dark .tree-wrapper {
          background: #111827;
          border-color: #374151;
        }
        
        .execution-tree text {
          fill: var(--text-color, #1f2937);
          stroke: var(--text-stroke, #ffffff);
          stroke-width: var(--text-stroke-width, 1px);
          paint-order: stroke;
        }
        
        .execution-tree .secondary-text {
          fill: var(--secondary-text-color, #6b7280);
          stroke: var(--text-stroke, #ffffff);
          stroke-width: var(--text-stroke-width, 0.8px);
        }
        
        /* Light mode - better contrast */
        .execution-tree text {
          --text-color: #1f2937;
          --text-stroke: #ffffff;
          --text-stroke-width: 1.2px;
        }
        
        .execution-tree .secondary-text {
          --secondary-text-color: #4b5563;
          --text-stroke: #ffffff;
          --text-stroke-width: 1px;
        }
        
        /* Dark mode */
        .dark .execution-tree text {
          --text-color: #f9fafb;
          --text-stroke: #1f2937;
          --text-stroke-width: 1.5px;
        }
        
        .dark .execution-tree .secondary-text {
          --secondary-text-color: #d1d5db;
          --text-stroke: #1f2937;
          --text-stroke-width: 1.2px;
        }
        
        /* System preference dark mode */
        @media (prefers-color-scheme: dark) {
          .execution-tree text {
            --text-color: #f9fafb;
            --text-stroke: #1f2937;
            --text-stroke-width: 1.5px;
          }
          
          .execution-tree .secondary-text {
            --secondary-text-color: #d1d5db;
            --text-stroke: #1f2937;
            --text-stroke-width: 1.2px;
          }
        }
        
        /* Ensure proper scrolling for both directions */
        .tree-wrapper::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        
        .tree-wrapper::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 6px;
        }
        
        .tree-wrapper::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 6px;
        }
        
        .tree-wrapper::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        .dark .tree-wrapper::-webkit-scrollbar-track {
          background: #1e293b;
        }
        
        .dark .tree-wrapper::-webkit-scrollbar-thumb {
          background: #475569;
        }
        
        .dark .tree-wrapper::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
      
      <div className="tree-wrapper" style={{ 
        minHeight: '750px', 
        overflow: 'auto', 
        position: 'relative',
        width: '100%',
        height: '100%'
      }}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          className="execution-tree"
          style={{ 
            display: 'block'
          }}
          viewBox={`0 0 ${treeDimensions.width} ${treeDimensions.height}`}
          preserveAspectRatio="xMidYMid meet"
        />
      </div>
      
      {/* Legend */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-sm text-gray-700 dark:text-gray-300">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 dark:text-gray-100">Legend:</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Depth 0 (Root)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span>Depth 1</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-500"></div>
            <span>Depth 2</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>Depth 3+</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">S=Step, D=Depth</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedExecutionTree;