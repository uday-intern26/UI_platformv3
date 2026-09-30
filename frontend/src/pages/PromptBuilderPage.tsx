import { useState } from 'react';
import type { WorkflowEdge, WorkflowNode } from '../api/applicationsClient';
import { BuilderCanvas } from '../components/builder/BuilderCanvas';
import '../components/builder/BuilderCanvas.css';
import './StudioPages.css';

const INITIAL_NODES: WorkflowNode[] = [
  { id: 'p1', type: 'user', label: 'Start', position: { x: 60, y: 160 }, config: {} },
  { id: 'p2', type: 'image_upload', label: 'Image Input', position: { x: 220, y: 160 }, config: {} },
  { id: 'p3', type: 'image_processing', label: 'Image Processing', position: { x: 400, y: 160 }, config: {} },
  { id: 'p4', type: 'background_removal', label: 'Background Removal', position: { x: 580, y: 160 }, config: {} },
  { id: 'p5', type: 'condition', label: 'Jewelry Found?', position: { x: 760, y: 160 }, config: { expression: 'jewelry.detected == true' } },
  { id: 'p6', type: 'model', label: 'Recommendation Model', position: { x: 960, y: 80 }, config: { modelId: 'gpt-4o' } },
  { id: 'p7', type: 'notification', label: 'Notify User', position: { x: 960, y: 260 }, config: { channel: 'ui' } },
  { id: 'p8', type: 'prompt', label: 'Jewelry Recommendation', position: { x: 1140, y: 80 }, config: { promptId: 'prompt-1' } },
  { id: 'p9', type: 'output', label: 'Output', position: { x: 1320, y: 160 }, config: {} },
];

const INITIAL_EDGES: WorkflowEdge[] = [
  { id: 'pe1', source: 'p1', target: 'p2' },
  { id: 'pe2', source: 'p2', target: 'p3' },
  { id: 'pe3', source: 'p3', target: 'p4' },
  { id: 'pe4', source: 'p4', target: 'p5' },
  { id: 'pe5', source: 'p5', target: 'p6', label: 'Yes' },
  { id: 'pe6', source: 'p5', target: 'p7', label: 'No' },
  { id: 'pe7', source: 'p6', target: 'p8' },
  { id: 'pe8', source: 'p8', target: 'p9' },
  { id: 'pe9', source: 'p7', target: 'p9' },
];

export function PromptBuilderPage() {
  const [nodes, setNodes] = useState<WorkflowNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<WorkflowEdge[]>(INITIAL_EDGES);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('p8');
  const [promptText, setPromptText] = useState(
    'Given the detected jewelry attributes {{attributes}} and user preferences {{preferences}}, recommend 3 complementary pieces with rationale.',
  );

  const handleNodeConfigChange = (nodeId: string, config: Record<string, unknown>) => {
    setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, config } : n)));
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Prompt Builder</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Design prompt chains and decision workflows for jewelry AI applications
          </p>
        </div>
        <div className="page-header-actions">
          <button type="button" className="btn btn-secondary">
            Test Run
          </button>
          <button type="button" className="btn btn-primary">
            Publish Prompt
          </button>
        </div>
      </div>

      <div className="builder-layout" style={{ gridTemplateColumns: '1fr 320px', marginBottom: '1rem' }}>
        <BuilderCanvas
          nodes={nodes}
          edges={edges}
          selectedNodeId={selectedNodeId}
          onNodesChange={setNodes}
          onEdgesChange={setEdges}
          onSelectNode={setSelectedNodeId}
          onNodeConfigChange={handleNodeConfigChange}
        />
        <aside className="card card-pad">
          <h3 className="card-title">Prompt Editor</h3>
          <div className="form-group">
            <label htmlFor="prompt-name">Prompt Name</label>
            <input id="prompt-name" className="form-input" defaultValue="Jewelry Recommendation" />
          </div>
          <div className="form-group">
            <label htmlFor="prompt-type">Type</label>
            <select id="prompt-type" className="form-input" defaultValue="System">
              <option>System</option>
              <option>User</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="prompt-body">Template</label>
            <textarea
              id="prompt-body"
              className="form-input"
              rows={8}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Variables</label>
            <div>
              <span className="chip">{'{{attributes}}'}</span>
              <span className="chip">{'{{preferences}}'}</span>
            </div>
          </div>
          <button type="button" className="btn btn-primary" style={{ width: '100%' }}>
            Save Draft
          </button>
        </aside>
      </div>
    </div>
  );
}
