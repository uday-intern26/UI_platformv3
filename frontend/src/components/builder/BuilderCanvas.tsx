import { useCallback, useState } from 'react';
import type { WorkflowEdge, WorkflowNode } from '../../api/applicationsClient';
import { NODE_TYPES, UNITY_WEBGL_FIELDS } from './builderConfig';
import './BuilderCanvas.css';

interface BuilderCanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  onNodesChange: (nodes: WorkflowNode[]) => void;
  onEdgesChange: (edges: WorkflowEdge[]) => void;
  onSelectNode: (id: string | null) => void;
  onNodeConfigChange: (nodeId: string, config: Record<string, unknown>) => void;
}

let nodeCounter = 0;

export function BuilderCanvas({
  nodes,
  edges,
  selectedNodeId,
  onNodesChange,
  onEdgesChange,
  onSelectNode,
  onNodeConfigChange,
}: BuilderCanvasProps) {
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);

  const addNode = (type: string) => {
    const def = NODE_TYPES.find((n) => n.type === type);
    if (!def) return;

    nodeCounter += 1;
    const newNode: WorkflowNode = {
      id: `node-${nodeCounter}`,
      type: def.type,
      label: def.label,
      position: { x: 80 + (nodes.length % 4) * 180, y: 80 + Math.floor(nodes.length / 4) * 100 },
      config: { ...def.defaultConfig },
    };
    onNodesChange([...nodes, newNode]);
    onSelectNode(newNode.id);
  };

  const handleNodeClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (connectFrom && connectFrom !== id) {
      const edgeId = `edge-${connectFrom}-${id}`;
      if (!edges.some((ed) => ed.id === edgeId)) {
        onEdgesChange([
          ...edges,
          { id: edgeId, source: connectFrom, target: id },
        ]);
      }
      setConnectFrom(null);
    } else {
      onSelectNode(id);
    }
  };

  const handleCanvasClick = () => {
    onSelectNode(null);
    setConnectFrom(null);
  };

  const handleMouseDown = (id: string, e: React.MouseEvent) => {
    const node = nodes.find((n) => n.id === id);
    if (!node) return;
    setDragging({
      id,
      offsetX: e.clientX - node.position.x,
      offsetY: e.clientY - node.position.y,
    });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;
      onNodesChange(
        nodes.map((n) =>
          n.id === dragging.id
            ? {
                ...n,
                position: {
                  x: e.clientX - dragging.offsetX,
                  y: e.clientY - dragging.offsetY,
                },
              }
            : n,
        ),
      );
    },
    [dragging, nodes, onNodesChange],
  );

  const handleMouseUp = () => setDragging(null);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const renderConfigField = (key: string, value: unknown) => (
    <div key={key} className="form-group">
      <label htmlFor={`cfg-${key}`}>{key.replace(/([A-Z])/g, ' $1').trim()}</label>
      <input
        id={`cfg-${key}`}
        className="form-input"
        value={String(value ?? '')}
        onChange={(e) => {
          if (!selectedNode) return;
          const raw = e.target.value;
          let parsed: unknown = raw;
          if (key === 'memoryLimit' || key === 'loadingTimeout') {
            parsed = Number(raw) || 0;
          }
          onNodeConfigChange(selectedNode.id, {
            ...selectedNode.config,
            [key]: parsed,
          });
        }}
      />
    </div>
  );

  return (
    <div
      className="builder-layout"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <aside className="builder-palette">
        <h4>Add Nodes</h4>
        {NODE_TYPES.map((nt) => (
          <button
            key={nt.type}
            type="button"
            className="palette-node"
            onClick={() => addNode(nt.type)}
          >
            {nt.label}
          </button>
        ))}
      </aside>

      <div className="builder-canvas" onClick={handleCanvasClick}>
        <div className="canvas-inner">
          <svg className="canvas-edges" width="100%" height="100%">
            {edges.map((edge) => {
              const source = nodes.find((n) => n.id === edge.source);
              const target = nodes.find((n) => n.id === edge.target);
              if (!source || !target) return null;
              const x1 = source.position.x + 70;
              const y1 = source.position.y + 30;
              const x2 = target.position.x + 70;
              const y2 = target.position.y + 30;
              return (
                <line
                  key={edge.id}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(201, 169, 98, 0.6)"
                  strokeWidth={2}
                />
              );
            })}
          </svg>

          {nodes.map((node) => (
            <div
              key={node.id}
              className={`canvas-node${selectedNodeId === node.id ? ' selected' : ''}`}
              style={{ left: node.position.x, top: node.position.y }}
              onClick={(e) => handleNodeClick(node.id, e)}
              onMouseDown={(e) => handleMouseDown(node.id, e)}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setConnectFrom(node.id);
              }}
            >
              <div className="canvas-node-label">{node.label}</div>
              <div className="canvas-node-type">{node.type}</div>
            </div>
          ))}
        </div>
      </div>

      <aside className="builder-config">
        <h4>Node Configuration</h4>
        {selectedNode ? (
          <>
            <div className="form-group">
              <label>Label</label>
              <input
                className="form-input"
                value={selectedNode.label}
                onChange={(e) => {
                  onNodesChange(
                    nodes.map((n) =>
                      n.id === selectedNode.id ? { ...n, label: e.target.value } : n,
                    ),
                  );
                }}
              />
            </div>
            {selectedNode.type === 'unity_webgl'
              ? UNITY_WEBGL_FIELDS.map((field) =>
                  renderConfigField(field, selectedNode.config[field]),
                )
              : Object.entries(selectedNode.config).map(([key, value]) =>
                  renderConfigField(key, value),
                )}
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '1rem' }}>
              Double-click a node to start connecting. Click another node to create an edge.
            </p>
          </>
        ) : (
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            Select a node to configure its properties
          </p>
        )}
      </aside>
    </div>
  );
}
