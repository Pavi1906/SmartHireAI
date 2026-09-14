import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  SkillGraphNode, 
  SkillGraphEdge, 
  SkillCategory, 
  SkillItem 
} from '../../types/skills';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Layers, 
  Info,
  CheckCircle2,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../utils/cn';

interface SkillGraphCanvasProps {
  nodes: SkillGraphNode[];
  edges: SkillGraphEdge[];
  onSelectSkill: (skillName: string) => void;
  selectedSkillName?: string | null;
}

const CATEGORY_COLORS: Record<SkillCategory, { stroke: string; fill: string; text: string; glow: string }> = {
  'Frontend': { stroke: '#38bdf8', fill: 'rgba(56, 189, 248, 0.15)', text: '#7dd3fc', glow: 'rgba(56, 189, 248, 0.4)' },
  'Backend': { stroke: '#818cf8', fill: 'rgba(129, 140, 248, 0.15)', text: '#a5b4fc', glow: 'rgba(129, 140, 248, 0.4)' },
  'Database': { stroke: '#34d399', fill: 'rgba(52, 211, 153, 0.15)', text: '#6ee7b7', glow: 'rgba(52, 211, 153, 0.4)' },
  'Cloud & DevOps': { stroke: '#fb923c', fill: 'rgba(251, 146, 60, 0.15)', text: '#fdba74', glow: 'rgba(251, 146, 60, 0.4)' },
  'AI & Data Science': { stroke: '#c084fc', fill: 'rgba(192, 132, 252, 0.15)', text: '#d8b4fe', glow: 'rgba(192, 132, 252, 0.4)' },
  'Programming Languages': { stroke: '#f43f5e', fill: 'rgba(244, 63, 94, 0.15)', text: '#fda4af', glow: 'rgba(244, 63, 94, 0.4)' },
  'System Architecture': { stroke: '#eab308', fill: 'rgba(234, 179, 8, 0.15)', text: '#fde047', glow: 'rgba(234, 179, 8, 0.4)' },
  'Testing & QA': { stroke: '#2dd4bf', fill: 'rgba(45, 212, 191, 0.15)', text: '#5eead4', glow: 'rgba(45, 212, 191, 0.4)' },
  'Tools & Workflow': { stroke: '#94a3b8', fill: 'rgba(148, 163, 184, 0.15)', text: '#cbd5e1', glow: 'rgba(148, 163, 184, 0.4)' },
  'Soft Skills': { stroke: '#ec4899', fill: 'rgba(236, 72, 153, 0.15)', text: '#f472b6', glow: 'rgba(236, 72, 153, 0.4)' }
};

export function SkillGraphCanvas({ 
  nodes, 
  edges, 
  onSelectSkill, 
  selectedSkillName 
}: SkillGraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  // Transform state for pan and zoom
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 0.95 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Hover and filter state
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // ResizeObserver for responsive width & height
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height: Math.max(500, height) });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Center the graph on initial load or reset
  const handleResetView = () => {
    setTransform({ x: 0, y: 0, scale: 0.95 });
  };

  const handleZoomIn = () => {
    setTransform(prev => ({ ...prev, scale: Math.min(2.5, prev.scale + 0.2) }));
  };

  const handleZoomOut = () => {
    setTransform(prev => ({ ...prev, scale: Math.max(0.4, prev.scale - 0.2) }));
  };

  // Drag pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTransform(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - transform.x,
        y: e.touches[0].clientY - transform.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setTransform(prev => ({
      ...prev,
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    }));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Filtered nodes based on category filter
  const filteredNodes = useMemo(() => {
    if (selectedCategory === 'ALL') return nodes;
    return nodes.filter(n => n.category === selectedCategory);
  }, [nodes, selectedCategory]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  // Filtered edges
  const filteredEdges = useMemo(() => {
    return edges.filter(e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target));
  }, [edges, filteredNodeIds]);

  // Lookup node map for quick coordinate resolution
  const nodeMap = useMemo(() => {
    const map = new Map<string, SkillGraphNode>();
    nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [nodes]);

  // Connected node IDs for hovered/selected state
  const activeHighlightedNodeIds = useMemo(() => {
    const activeId = hoveredNodeId || nodes.find(n => n.name === selectedSkillName)?.id;
    if (!activeId) return null;

    const set = new Set<string>([activeId]);
    edges.forEach(e => {
      if (e.source === activeId) set.add(e.target);
      if (e.target === activeId) set.add(e.source);
    });
    return set;
  }, [hoveredNodeId, selectedSkillName, nodes, edges]);

  // Unique categories in nodes for filter pills
  const availableCategories = useMemo(() => {
    const cats = new Set<SkillCategory>();
    nodes.forEach(n => cats.add(n.category));
    return Array.from(cats);
  }, [nodes]);

  const hoveredNode = hoveredNodeId ? nodeMap.get(hoveredNodeId) : null;

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[580px] bg-card/60 rounded-xl border border-border overflow-hidden select-none"
    >
      {/* Top Toolbar / Category Filter Pills */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto bg-background/90 backdrop-blur-md p-1.5 rounded-lg border border-border/80 shadow-md">
          <span className="text-xs font-semibold text-muted-foreground px-2 flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" /> Domains:
          </span>
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={cn(
              "px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
              selectedCategory === 'ALL'
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            All ({nodes.length})
          </button>
          {availableCategories.map(cat => {
            const count = nodes.filter(n => n.category === cat).length;
            const color = CATEGORY_COLORS[cat] || { text: '#fff' };
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5",
                  selectedCategory === cat
                    ? "bg-secondary text-foreground border border-border shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color.stroke }} />
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Zoom and Pan Controls */}
        <div className="flex items-center gap-1 pointer-events-auto bg-background/90 backdrop-blur-md p-1 rounded-lg border border-border/80 shadow-md">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleZoomIn}
            className="h-8 w-8 p-0"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleZoomOut}
            className="h-8 w-8 p-0"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleResetView}
            className="h-8 w-8 p-0"
            title="Reset View"
            aria-label="Reset View"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Interactive SVG Canvas */}
      <svg
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <defs>
          <radialGradient id="graph-bg-radial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.05)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </radialGradient>
          
          <pattern id="graph-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
            <circle cx="0" cy="0" r="1" fill="rgba(255, 255, 255, 0.08)" />
          </pattern>
        </defs>

        {/* Grid Background */}
        <rect width="100%" height="100%" fill="url(#graph-grid)" />
        <rect width="100%" height="100%" fill="url(#graph-bg-radial)" />

        {/* Transformed Content Group */}
        <g transform={`translate(${dimensions.width / 2 + transform.x}, ${dimensions.height / 2 + transform.y}) scale(${transform.scale}) translate(-400, -300)`}>
          
          {/* Central System Hub Anchor */}
          <circle cx="400" cy="300" r="36" fill="rgba(59, 130, 246, 0.1)" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="400" cy="300" r="14" fill="#3b82f6" opacity="0.8" />
          <text x="400" y="304" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">PROFILE</text>

          {/* Render Edges */}
          {filteredEdges.map(edge => {
            const sourceNode = nodeMap.get(edge.source);
            const targetNode = nodeMap.get(edge.target);
            if (!sourceNode || !targetNode) return null;

            const isHighlighted = activeHighlightedNodeIds 
              ? activeHighlightedNodeIds.has(edge.source) && activeHighlightedNodeIds.has(edge.target)
              : false;

            const isDimmed = activeHighlightedNodeIds 
              ? !isHighlighted
              : false;

            return (
              <line
                key={edge.id}
                x1={sourceNode.x || 400}
                y1={sourceNode.y || 300}
                x2={targetNode.x || 400}
                y2={targetNode.y || 300}
                stroke={isHighlighted ? "#60a5fa" : "rgba(255, 255, 255, 0.12)"}
                strokeWidth={isHighlighted ? 2.5 : 1.2}
                strokeDasharray={edge.relationship === 'prerequisite' ? "4 3" : undefined}
                opacity={isDimmed ? 0.2 : 1}
                className="transition-all duration-300"
              />
            );
          })}

          {/* Hub connection lines to key root nodes */}
          {filteredNodes.slice(0, 6).map(node => (
            <line
              key={`hub-line-${node.id}`}
              x1="400"
              y1="300"
              x2={node.x || 400}
              y2={node.y || 300}
              stroke="rgba(59, 130, 246, 0.15)"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
          ))}

          {/* Render Nodes */}
          {filteredNodes.map(node => {
            const isSelected = selectedSkillName?.toLowerCase() === node.name.toLowerCase();
            const isHovered = hoveredNodeId === node.id;
            const isHighlighted = activeHighlightedNodeIds ? activeHighlightedNodeIds.has(node.id) : true;
            const isDimmed = activeHighlightedNodeIds ? !isHighlighted : false;
            
            const colorScheme = CATEGORY_COLORS[node.category] || {
              stroke: '#94a3b8',
              fill: 'rgba(148, 163, 184, 0.15)',
              text: '#cbd5e1',
              glow: 'rgba(148, 163, 184, 0.4)'
            };

            const isCriticalGap = node.status === 'critical_gap';
            const radius = isSelected ? (node.radius || 20) + 4 : (node.radius || 20);

            return (
              <g
                key={node.id}
                transform={`translate(${node.x || 400}, ${node.y || 300})`}
                className="cursor-pointer transition-transform duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSkill(node.name);
                }}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                opacity={isDimmed ? 0.25 : 1}
              >
                {/* Glow ring for hovered or selected */}
                {(isHovered || isSelected) && (
                  <circle
                    r={radius + 8}
                    fill="none"
                    stroke={colorScheme.stroke}
                    strokeWidth="3"
                    opacity="0.6"
                    className="animate-pulse"
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  r={radius}
                  fill={isCriticalGap ? 'rgba(239, 68, 68, 0.18)' : colorScheme.fill}
                  stroke={isCriticalGap ? '#ef4444' : colorScheme.stroke}
                  strokeWidth={isSelected ? 3 : isHovered ? 2.5 : 1.8}
                  strokeDasharray={isCriticalGap ? "4 3" : undefined}
                />

                {/* Score badge in center */}
                <text
                  textAnchor="middle"
                  dy=".3em"
                  fill={isCriticalGap ? '#f87171' : colorScheme.text}
                  fontSize={radius > 22 ? "12" : "10"}
                  fontWeight="bold"
                >
                  {isCriticalGap ? 'GAP' : `${node.score}%`}
                </text>

                {/* Skill Label Underneath */}
                <text
                  y={radius + 14}
                  textAnchor="middle"
                  fill="#f1f5f9"
                  fontSize="11"
                  fontWeight={isSelected || isHovered ? "600" : "500"}
                  className="pointer-events-none drop-shadow-md"
                >
                  {node.name}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Hover Tooltip Overlay */}
      {hoveredNode && (
        <div 
          className="absolute bottom-4 left-4 z-20 bg-background/95 backdrop-blur-md p-3.5 rounded-xl border border-border/80 shadow-xl max-w-xs animate-in fade-in zoom-in-95 pointer-events-none"
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="font-semibold text-foreground text-sm flex items-center gap-1.5">
              <span 
                className="h-2.5 w-2.5 rounded-full" 
                style={{ backgroundColor: CATEGORY_COLORS[hoveredNode.category]?.stroke || '#38bdf8' }} 
              />
              {hoveredNode.name}
            </span>
            <Badge 
              variant={
                hoveredNode.status === 'strong' ? 'default' : 
                hoveredNode.status === 'developing' ? 'secondary' : 'destructive'
              }
              className="text-[10px] px-1.5 py-0"
            >
              {hoveredNode.proficiency}
            </Badge>
          </div>

          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Category:</span>
              <span className="text-foreground font-medium">{hoveredNode.category}</span>
            </div>
            <div className="flex justify-between">
              <span>Proficiency Score:</span>
              <span className="text-foreground font-medium">{hoveredNode.score}%</span>
            </div>
            <p className="text-[11px] text-primary pt-1 font-medium">
              Click node to view evidence & learning roadmap &rarr;
            </p>
          </div>
        </div>
      )}

      {/* Bottom Right Legend */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-3 bg-background/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border/80 text-[11px] text-muted-foreground shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>Strong (80%+)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span>Developing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-400 border border-red-500 border-dashed" />
          <span>Critical Gap</span>
        </div>
      </div>
    </div>
  );
}
