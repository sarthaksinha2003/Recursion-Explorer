import { TreeNode } from "@/lib/tracer";
import { motion } from "framer-motion";

const statusClasses = {
  active: "border-accent",
  completed: "border-muted-foreground/30 opacity-80",
  pruned: "border-destructive/60 text-destructive",
};

function NodeView({ node, layout, animationSpeed }) {
  const speeds = {
    slow: 0.8,
    normal: 0.4,
    fast: 0.2
  };

  const variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <motion.li
      className={`ml-4 ${layout === 'horizontal' ? 'flex items-start' : ''}`}
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{ duration: speeds[animationSpeed] }}
    >
      <motion.div 
        className={`rounded-md border px-3 py-1 text-sm ${statusClasses[node.status]}`}
        layoutId={node.id}
      >
        <span className="font-medium">{node.name}</span>
        {node.vars && (
          <span className="ml-2 text-xs text-muted-foreground">{JSON.stringify(node.vars)}</span>
        )}
      </motion.div>
      {node.children.length > 0 && (
        <ul className={`
          ${layout === 'horizontal' ? 'ml-4 flex items-start space-x-4' : 'mt-2 space-y-2 border-l pl-4'}
        `}>
          {node.children.map((child) => (
            <NodeView key={child.id} node={child} layout={layout} animationSpeed={animationSpeed} />
          ))}
        </ul>
      )}
    </motion.li>
  );
}

export const ExecutionTree = ({ root, settings }) => {
  if (!root) return null;
  return (
    <div className={`max-h-[480px] overflow-auto pr-2 ${settings?.treeLayout === 'horizontal' ? 'pb-4' : ''}`}>
      <ul className={settings?.treeLayout === 'horizontal' ? 'flex items-start space-x-4' : 'space-y-2'}>
        {root.children.map((n) => (
          <NodeView 
            key={n.id} 
            node={n} 
            layout={settings?.treeLayout || 'vertical'} 
            animationSpeed={settings?.animationSpeed || 'normal'} 
          />
        ))}
      </ul>
    </div>
  );
};

export default ExecutionTree;