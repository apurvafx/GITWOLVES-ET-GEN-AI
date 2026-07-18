import React, { useRef, useEffect, useState } from 'react';

export interface Node {
  id: string;
  name: string;
  type: string;
}

export interface Edge {
  source_id: string;
  target_id: string;
  rel_type: string;
}

interface ForceGraphProps {
  nodes: Node[];
  edges: Edge[];
  focusedNodeId: string | null;
  onNodeClick?: (nodeId: string) => void;
}

interface PhysicsNode {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx: number;
  fy: number;
}

export const ForceGraph: React.FC<ForceGraphProps> = ({
  nodes,
  edges,
  focusedNodeId,
  onNodeClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const physicsNodesRef = useRef<PhysicsNode[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<PhysicsNode | null>(null);
  const [draggingNode, setDraggingNode] = useState<PhysicsNode | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Initialize node physics positions randomly
  useEffect(() => {
    const width = 800;
    const height = 600;
    const existingMap = new Map(physicsNodesRef.current.map(n => [n.id, n]));

    physicsNodesRef.current = nodes.map((node) => {
      const existing = existingMap.get(node.id);
      if (existing) return { ...existing, name: node.name, type: node.type };
      return {
        id: node.id,
        name: node.name,
        type: node.type,
        x: width / 2 + (Math.random() - 0.5) * 200,
        y: height / 2 + (Math.random() - 0.5) * 200,
        vx: 0,
        vy: 0,
        fx: 0,
        fy: 0,
      };
    });
  }, [nodes]);

  // Center camera on focused node
  useEffect(() => {
    if (focusedNodeId && canvasRef.current) {
      const node = physicsNodesRef.current.find((n) => n.id === focusedNodeId);
      if (node) {
        const canvas = canvasRef.current;
        setPan({
          x: canvas.width / 2 - node.x * zoom,
          y: canvas.height / 2 - node.y * zoom,
        });
      }
    }
  }, [focusedNodeId, zoom]);

  // Main physics & rendering animation loop
  useEffect(() => {
    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Physics constants
    const repulsion = 300;
    const gravity = 0.03;
    const linkStrength = 0.05;
    const linkDistance = 100;
    const damping = 0.85;

    const animate = () => {
      const pNodes = physicsNodesRef.current;

      // 1. Reset forces
      pNodes.forEach((node) => {
        node.fx = 0;
        node.fy = 0;
      });

      // 2. Repulsion force between all nodes (prevent overlaps)
      for (let i = 0; i < pNodes.length; i++) {
        for (let j = i + 1; j < pNodes.length; j++) {
          const n1 = pNodes[i];
          const n2 = pNodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 300) {
            const force = repulsion / (dist * dist);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            n1.fx -= fx;
            n1.fy -= fy;
            n2.fx += fx;
            n2.fy += fy;
          }
        }
      }

      // 3. Link attraction force along edges
      edges.forEach((edge) => {
        const n1 = pNodes.find((n) => n.id === edge.source_id);
        const n2 = pNodes.find((n) => n.id === edge.target_id);
        if (n1 && n2) {
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (dist - linkDistance) * linkStrength;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          n1.fx += fx;
          n1.fy += fy;
          n2.fx -= fx;
          n2.fy -= fy;
        }
      });

      // 4. Center gravity force
      pNodes.forEach((node) => {
        node.fx += (width / 2 - node.x) * gravity;
        node.fy += (height / 2 - node.y) * gravity;
      });

      // 5. Update velocities & positions
      pNodes.forEach((node) => {
        if (node === draggingNode) return; // Skip updating dragged node physics
        node.vx = (node.vx + node.fx) * damping;
        node.vy = (node.vy + node.fy) * damping;
        node.x += node.vx;
        node.y += node.vy;
      });

      // 6. Draw graph
      ctx.clearRect(0, 0, width, height);

      // Save canvas state for transforms
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // Draw Edges (Relationships)
      edges.forEach((edge) => {
        const source = pNodes.find((n) => n.id === edge.source_id);
        const target = pNodes.find((n) => n.id === edge.target_id);
        if (source && target) {
          ctx.beginPath();
          ctx.moveTo(source.x, source.y);
          ctx.lineTo(target.x, target.y);
          ctx.strokeStyle = theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Draw small relation name text in center of link
          const midX = (source.x + target.x) / 2;
          const midY = (source.y + target.y) / 2;
          ctx.fillStyle = theme === 'dark' ? '#4b5563' : '#94a3b8';
          ctx.font = '8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(edge.rel_type, midX, midY - 4);
        }
      });

      // Draw Nodes (Assets / Procedures / etc.)
      pNodes.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 10, 0, 2 * Math.PI);

        // Assign colors based on node category
        let color = '#38bdf8'; // Blue Default
        if (node.type === 'procedure') color = '#34d399'; // Emerald
        else if (node.type === 'regulation') color = '#c084fc'; // Purple
        else if (node.type === 'incident') color = '#f87171'; // Red
        else if (node.type === 'document') color = '#fbbf24'; // Amber

        ctx.fillStyle = color;
        ctx.fill();

        // Highlight selection/focus
        if (node.id === focusedNodeId) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 18, 0, 2 * Math.PI);
          ctx.strokeStyle = '#fbbf24'; // Gold flashing halo
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Draw node name label
        ctx.fillStyle = theme === 'dark' ? '#e2e8f0' : '#0f172a';
        ctx.font = 'bold 9px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, node.y - 14);
      });

      ctx.restore();

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [edges, draggingNode, pan, zoom, focusedNodeId, theme]);

  // Coordinate conversion from canvas client space to transformed workspace
  const getTransformedCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left - pan.x) / zoom;
    const y = (clientY - rect.top - pan.y) / zoom;
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getTransformedCoordinates(e.clientX, e.clientY);

    // Check if clicked a node
    const node = physicsNodesRef.current.find((n) => {
      const dist = Math.sqrt((n.x - x) ** 2 + (n.y - y) ** 2);
      return dist <= 12;
    });

    if (node) {
      setDraggingNode(node);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      if (onNodeClick) onNodeClick(node.id);
    } else {
      // Pan layout state start
      setDraggingNode(null);
      dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getTransformedCoordinates(e.clientX, e.clientY);

    if (draggingNode) {
      // Move node directly
      draggingNode.x = x;
      draggingNode.y = y;
    } else if (e.buttons === 1) {
      // Dragging canvas background (Pan)
      setPan({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    } else {
      // Check node hover state
      const hover = physicsNodesRef.current.find((n) => {
        const dist = Math.sqrt((n.x - x) ** 2 + (n.y - y) ** 2);
        return dist <= 12;
      });
      setHoveredNode(hover || null);
    }
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    let newZoom = zoom;
    if (e.deltaY < 0) {
      newZoom = Math.min(newZoom * zoomFactor, 3);
    } else {
      newZoom = Math.max(newZoom / zoomFactor, 0.4);
    }
    setZoom(newZoom);
  };

  return (
    <div className="relative w-full h-full bg-slate-50 dark:bg-slate-950/20 border border-day-border dark:border-night-border rounded-2xl overflow-hidden flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={700}
        height={500}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Hover Information overlay */}
      {hoveredNode && (
        <div className="absolute bottom-4 left-4 p-4 rounded-xl bg-day-surface dark:bg-night-surface border border-day-border dark:border-night-border text-xs pointer-events-none shadow-md max-w-xs animate-fade-in">
          <p className="font-bold text-day-text dark:text-night-text uppercase tracking-wider text-[10px] text-blue-600 mb-1">
            Category: {hoveredNode.type}
          </p>
          <p className="text-sm font-semibold mb-1 text-day-text dark:text-night-text">{hoveredNode.name}</p>
          <p className="text-day-textMuted dark:text-night-textMuted leading-snug">
            {hoveredNode.id === focusedNodeId
              ? 'Highlighted by DocPilot citation.'
              : 'Left-click & drag node to adjust simulation.'}
          </p>
        </div>
      )}

      {/* Zoom / Pan controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setZoom(prev => Math.min(prev * 1.2, 3))}
          className="w-8 h-8 rounded-lg bg-day-surface dark:bg-night-surface border border-day-border dark:border-night-border text-sm font-bold flex items-center justify-center shadow hover:bg-slate-100 dark:hover:bg-slate-900"
        >
          +
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(prev / 1.2, 0.4))}
          className="w-8 h-8 rounded-lg bg-day-surface dark:bg-night-surface border border-day-border dark:border-night-border text-sm font-bold flex items-center justify-center shadow hover:bg-slate-100 dark:hover:bg-slate-900"
        >
          -
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="px-2 py-1 text-[10px] uppercase font-bold rounded-lg bg-day-surface dark:bg-night-surface border border-day-border dark:border-night-border shadow hover:bg-slate-100 dark:hover:bg-slate-900"
        >
          Reset
        </button>
      </div>
    </div>
  );
};
