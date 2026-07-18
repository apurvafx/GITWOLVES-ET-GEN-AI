import React, { useRef, useEffect, useState, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

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
  theme: 'light' | 'dark';
  onNodeClick?: (nodeId: string) => void;
}

export const ForceGraph: React.FC<ForceGraphProps> = ({
  nodes,
  edges,
  focusedNodeId,
  theme,
  onNodeClick,
}) => {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 500 });

  // Handle responsive resizing
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width || 400,
          height: entry.contentRect.height || 500,
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Format data for react-force-graph-2d (d3 links require source/target keys)
  const data = useMemo(() => {
    return {
      nodes: nodes.map((n) => ({ id: n.id, name: n.name, type: n.type })),
      links: edges.map((e) => ({
        source: e.source_id,
        target: e.target_id,
        rel_type: e.rel_type,
      })),
    };
  }, [nodes, edges]);

  // Center camera on focused node
  useEffect(() => {
    if (focusedNodeId && fgRef.current) {
      const node = data.nodes.find((n) => n.id === focusedNodeId) as any;
      if (node) {
        // Zoom & center animation
        fgRef.current.centerAt(node.x, node.y, 800);
        fgRef.current.zoom(2.0, 800);
      }
    }
  }, [focusedNodeId, data]);

  // Custom node drawer for clean professional topological circles and labels
  const drawNode = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name || node.id;
    const fontSize = 10 / globalScale;
    ctx.font = `bold ${fontSize}px system-ui`;

    // Assign colors based on node category
    let color = '#38bdf8'; // Blue Default
    if (node.type === 'procedure') color = '#34d399'; // Emerald
    else if (node.type === 'regulation') color = '#c084fc'; // Purple
    else if (node.type === 'incident') color = '#f87171'; // Red
    else if (node.type === 'document') color = '#fbbf24'; // Amber

    const r = 6; // node radius

    // Highlight focus selection halo
    if (node.id === focusedNodeId) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, r + 4, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'rgba(251, 191, 36, 0.15)'; // Gold shadow
      ctx.fill();
      ctx.strokeStyle = '#fbbf24'; // Gold border
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Draw central node dot
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = theme === 'dark' ? '#06080e' : '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw high-contrast text labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.strokeStyle = theme === 'dark' ? '#06080e' : '#ffffff';
    ctx.lineWidth = 3 / globalScale;
    ctx.strokeText(label, node.x, node.y + r + 8);

    ctx.fillStyle = theme === 'dark' ? '#e2e8f0' : '#0f172a';
    ctx.fillText(label, node.x, node.y + r + 8);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-50 dark:bg-slate-950/20 border border-day-border dark:border-night-border rounded-2xl overflow-hidden"
    >
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        width={dimensions.width}
        height={dimensions.height}
        nodeCanvasObject={drawNode}
        nodePointerAreaPaint={(node: any, color, ctx) => {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 10, 0, 2 * Math.PI, false);
          ctx.fillStyle = color;
          ctx.fill();
        }}
        onNodeClick={(node: any) => {
          if (onNodeClick) onNodeClick(node.id);
        }}
        linkColor={() => (theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(15, 23, 42, 0.6)')}
        linkWidth={1.5}
        d3VelocityDecay={0.4}
        cooldownTicks={100}
      />
    </div>
  );
};
