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
  theme?: 'light' | 'dark';
  onNodeClick?: (nodeId: string) => void;
  activePropagationNodes?: string[];
  lotoLockedNodes?: string[];
}

export const ForceGraph: React.FC<ForceGraphProps> = ({
  nodes,
  edges,
  focusedNodeId,
  onNodeClick,
  activePropagationNodes = [],
  lotoLockedNodes = [],
}) => {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 500 });
  const [hoveredNode, setHoveredNode] = useState<any | null>(null);

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

  // Format data for react-force-graph-2d
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
      if (node && typeof node.x === 'number' && !isNaN(node.x) && typeof node.y === 'number' && !isNaN(node.y)) {
        fgRef.current.centerAt(node.x, node.y, 800);
        fgRef.current.zoom(2.5, 800);
      }
    }
  }, [focusedNodeId, data]);

  // Rock-Solid Custom Node Drawer with Finite Safety Validation
  const drawNode = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    // 0. Absolute NaN / Finite Coordinate Safety Check to prevent canvas crash
    if (
      typeof node.x !== 'number' ||
      isNaN(node.x) ||
      !isFinite(node.x) ||
      typeof node.y !== 'number' ||
      isNaN(node.y) ||
      !isFinite(node.y)
    ) {
      return;
    }

    const label = node.name || node.id;
    const fontSize = Math.max(10 / globalScale, 3);
    ctx.font = `700 ${fontSize}px "Inter Tight", "Inter", sans-serif`;

    // Category Colors
    let colorCore = '#38bdf8'; // Assets (Cyan Blue)
    let colorGlow = 'rgba(56, 189, 248, 0.35)';

    if (node.type === 'procedure') {
      colorCore = '#34d399'; // Procedures (Emerald)
      colorGlow = 'rgba(52, 211, 153, 0.35)';
    } else if (node.type === 'regulation') {
      colorCore = '#c084fc'; // Regulations (Violet)
      colorGlow = 'rgba(192, 132, 252, 0.35)';
    } else if (node.type === 'incident') {
      colorCore = '#f87171'; // Incidents (Coral Red)
      colorGlow = 'rgba(248, 113, 113, 0.35)';
    } else if (node.type === 'document') {
      colorCore = '#fbbf24'; // Documents (Amber)
      colorGlow = 'rgba(251, 191, 36, 0.35)';
    }

    const r = 8;
    const isFocused = node.id === focusedNodeId;
    const isHovered = hoveredNode && hoveredNode.id === node.id;
    const isActivePropagation = activePropagationNodes.includes(node.id);

    // 1. Outer Glow Aura (Flashing red for active fault propagation nodes)
    ctx.beginPath();
    ctx.arc(node.x, node.y, r + (isFocused || isHovered ? 8 : 4), 0, 2 * Math.PI, false);
    if (isActivePropagation) {
      const pulseSpeed = Math.sin(Date.now() / 120) * 0.35 + 0.65;
      ctx.fillStyle = `rgba(239, 68, 68, ${0.45 * pulseSpeed})`;
    } else {
      ctx.fillStyle = isFocused ? 'rgba(196, 241, 36, 0.4)' : colorGlow;
    }
    ctx.fill();

    // 2. Focused / Propagation Ring
    if (isFocused || isHovered || isActivePropagation) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, r + 10, 0, 2 * Math.PI, false);
      if (isActivePropagation) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5 / globalScale;
      } else {
        ctx.strokeStyle = isFocused ? '#c4f124' : colorCore;
        ctx.lineWidth = 1.5 / globalScale;
      }
      ctx.stroke();
    }

    // 3. Central Node Circle (Changes to Red Core if active propagation)
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
    ctx.fillStyle = isActivePropagation ? '#ef4444' : colorCore;
    ctx.fill();
    ctx.stroke();

    // LOTO lock indicator (Step 7)
    if (lotoLockedNodes.includes(node.id)) {
      ctx.beginPath();
      ctx.arc(node.x + 8, node.y - 8, 4.5, 0, 2 * Math.PI, false);
      ctx.fillStyle = '#facc15'; // Bright Yellow LOTO lock color
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#000000';
      ctx.font = `900 ${Math.max(6 / globalScale, 3.5)}px monospace`;
      ctx.fillText('L', node.x + 8, node.y - 8);
      ctx.restore();
    }

    // 4. Clean Label Typography
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.strokeStyle = '#050508';
    ctx.lineWidth = 4 / globalScale;
    ctx.strokeText(label, node.x, node.y + r + 10);

    ctx.fillStyle = isFocused ? '#c4f124' : '#f3f4f6';
    ctx.fillText(label, node.x, node.y + r + 10);
  };

  // D3 Physics Forces
  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge')?.strength(-280);
      fgRef.current.d3Force('link')?.distance(75);
    }
  }, [data]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#080812] border border-stone-800 rounded-2xl overflow-hidden shadow-2xl"
    >
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        width={dimensions.width}
        height={dimensions.height}
        nodeCanvasObject={drawNode}
        nodePointerAreaPaint={(node: any, color, ctx) => {
          if (typeof node.x === 'number' && !isNaN(node.x) && typeof node.y === 'number' && !isNaN(node.y)) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 14, 0, 2 * Math.PI, false);
            ctx.fillStyle = color;
            ctx.fill();
          }
        }}
        onNodeClick={(node: any) => {
          if (onNodeClick && node) onNodeClick(node.id);
        }}
        onNodeHover={(node: any) => {
          setHoveredNode(node || null);
        }}
        // 70% Link Opacity & Clean Cyber Laser Lines
        linkColor={() => 'rgba(148, 163, 184, 0.70)'}
        linkWidth={2}
        // Animated Laser Data Packets
        linkDirectionalParticles={3}
        linkDirectionalParticleSpeed={0.006}
        linkDirectionalParticleWidth={3}
        linkDirectionalParticleColor={() => '#38bdf8'}
        // Directional Arrows
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={0.95}
        linkDirectionalArrowColor={() => 'rgba(56, 189, 248, 0.75)'}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.25}
        warmupTicks={60}
        cooldownTicks={180}
      />

      {/* Floating Hover Inspector Card */}
      {hoveredNode && (
        <div className="absolute top-4 right-4 p-4 rounded-2xl bg-[#0e101f]/90 backdrop-blur-xl border border-sky-500/40 text-left space-y-1 shadow-2xl pointer-events-none animate-in fade-in zoom-in-95 duration-150 font-sans">
          <p className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" /> {hoveredNode.name || hoveredNode.id}
          </p>
          <p className="text-[11px] text-stone-300 font-mono">
            Type: <span className="text-lime-400 font-bold uppercase">{hoveredNode.type || 'Asset'}</span>
          </p>
        </div>
      )}
    </div>
  );
};
