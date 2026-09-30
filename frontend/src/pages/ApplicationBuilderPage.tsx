import { useState } from 'react';
import type { WorkflowEdge, WorkflowNode } from '../api/applicationsClient';
import { saveWorkflow } from '../api/applicationsClient';
import { BuilderCanvas } from '../components/builder/BuilderCanvas';
import '../components/builder/BuilderCanvas.css';
import './StudioPages.css';

const STEPS = ['Basic Info', 'Data & Models', 'Workflow', 'Governance', 'Deploy'];

const INITIAL_NODES: WorkflowNode[] = [
  { id: 'n1', type: 'user', label: 'User', position: { x: 40, y: 80 }, config: {} },
  { id: 'n2', type: 'authentication', label: 'Authentication', position: { x: 200, y: 80 }, config: {} },
  { id: 'n3', type: 'image_upload', label: 'Image Upload', position: { x: 380, y: 80 }, config: { maxSizeMb: 10 } },
  { id: 'n4', type: 'image_processing', label: 'Image Processing', position: { x: 560, y: 80 }, config: {} },
  { id: 'n5', type: 'background_removal', label: 'Background Removal', position: { x: 740, y: 80 }, config: {} },
  { id: 'n6', type: 'unity_webgl', label: 'Unity WebGL', position: { x: 560, y: 220 }, config: { unityPackage: 'aijewel-tryon' } },
  { id: 'n7', type: '3d_conversion', label: '3D Conversion', position: { x: 740, y: 220 }, config: {} },
  { id: 'n8', type: 'model', label: 'Model Extraction', position: { x: 920, y: 150 }, config: {} },
  { id: 'n9', type: 's3', label: 'S3 Storage', position: { x: 920, y: 280 }, config: {} },
  { id: 'n10', type: 'output', label: 'Result', position: { x: 1100, y: 200 }, config: {} },
];

const INITIAL_EDGES: WorkflowEdge[] = [
  { id: 'e1', source: 'n1', target: 'n2' },
  { id: 'e2', source: 'n2', target: 'n3' },
  { id: 'e3', source: 'n3', target: 'n4' },
  { id: 'e4', source: 'n4', target: 'n5' },
  { id: 'e5', source: 'n5', target: 'n6' },
  { id: 'e6', source: 'n5', target: 'n7' },
  { id: 'e7', source: 'n6', target: 'n8' },
  { id: 'e8', source: 'n7', target: 'n8' },
  { id: 'e9', source: 'n8', target: 'n9' },
  { id: 'e10', source: 'n8', target: 'n10' },
  { id: 'e11', source: 'n9', target: 'n10' },
];

export function ApplicationBuilderPage() {
  const [step, setStep] = useState(2);
  const [nodes, setNodes] = useState<WorkflowNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<WorkflowEdge[]>(INITIAL_EDGES);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [metadata, setMetadata] = useState({
    name: 'Virtual Try-On Experience',
    description: 'Customer-facing jewelry try-on with Unity WebGL and 3D conversion',
    businessDomain: 'Retail',
    owner: 'Product Team',
    environment: 'production',
    version: '2.1.0',
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      await saveWorkflow('app-builder', { nodes, edges });
      setSaveMessage('Workflow saved successfully');
    } catch {
      setSaveMessage('Saved locally — API unavailable');
    } finally {
      setSaving(false);
    }
  };

  const handleNodeConfigChange = (nodeId: string, config: Record<string, unknown>) => {
    setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, config } : n)));
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Application Builder</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Visual canvas to compose AI and jewelry business workflows
          </p>
        </div>
        <div className="page-header-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setStep((s) => Math.max(0, s - 1))}>
            Back
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : step === 4 ? 'Deploy' : 'Save & Continue'}
          </button>
        </div>
      </div>

      <div className="stepper">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={`step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
            onClick={() => setStep(i)}
          >
            <span className="step-num">{i + 1}</span>
            {label}
          </button>
        ))}
      </div>

      {saveMessage && <p className="inline-warn" style={{ color: 'var(--color-success)' }}>{saveMessage}</p>}

      {(step === 0 || step === 1) && (
        <div className="builder-layout">
          <div className="card card-pad builder-form-card">
            <h3 className="card-title">{step === 0 ? 'Basic Info' : 'Data & Models'}</h3>
            <div className="form-grid">
              {(
                [
                  ['name', 'App Name'],
                  ['description', 'Description'],
                  ['businessDomain', 'Business Domain'],
                  ['owner', 'Owner'],
                  ['environment', 'Environment'],
                  ['version', 'Version'],
                ] as const
              ).map(([field, label]) => (
                <div key={field} className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor={`meta-${field}`}>{label}</label>
                  {field === 'businessDomain' || field === 'environment' ? (
                    <select
                      id={`meta-${field}`}
                      className="form-input"
                      value={metadata[field]}
                      onChange={(e) => setMetadata({ ...metadata, [field]: e.target.value })}
                    >
                      {field === 'businessDomain' ? (
                        <>
                          <option>Retail</option>
                          <option>Analytics</option>
                          <option>Utility</option>
                        </>
                      ) : (
                        <>
                          <option>production</option>
                          <option>staging</option>
                          <option>development</option>
                        </>
                      )}
                    </select>
                  ) : (
                    <input
                      id={`meta-${field}`}
                      className="form-input"
                      value={metadata[field]}
                      onChange={(e) => setMetadata({ ...metadata, [field]: e.target.value })}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="card card-pad">
            <h3 className="card-title">{step === 0 ? 'Application Preview' : 'Linked Assets'}</h3>
            {step === 0 ? (
              <ul className="activity-list">
                <li className="activity-item">
                  <i className="activity-dot" />
                  <div>
                    <div>{metadata.name}</div>
                    <div className="activity-meta">
                      {metadata.businessDomain} · {metadata.environment} · v{metadata.version}
                    </div>
                  </div>
                </li>
                <li className="activity-item">
                  <i className="activity-dot" />
                  <div>
                    <div>Owner: {metadata.owner}</div>
                    <div className="activity-meta">{metadata.description}</div>
                  </div>
                </li>
              </ul>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>gpt-4o</td>
                      <td>Model</td>
                      <td><span className="status-badge status-approved">Approved</span></td>
                    </tr>
                    <tr>
                      <td>Jewelry Recommendation</td>
                      <td>Prompt</td>
                      <td><span className="status-badge status-approved">Approved</span></td>
                    </tr>
                    <tr>
                      <td>Try-On Product Catalog</td>
                      <td>Dataset</td>
                      <td><span className="status-badge status-active">Active</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <BuilderCanvas
          nodes={nodes}
          edges={edges}
          selectedNodeId={selectedNodeId}
          onNodesChange={setNodes}
          onEdgesChange={setEdges}
          onSelectNode={setSelectedNodeId}
          onNodeConfigChange={handleNodeConfigChange}
        />
      )}

      {step === 3 && (
        <div className="card card-pad">
          <h3 className="card-title">Governance Checks</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Policy</th>
                <th>Requirement</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Production Model Policy</td>
                <td>Only approved models in production</td>
                <td><span className="status-badge status-passed">Passed</span></td>
              </tr>
              <tr>
                <td>Data Privacy Policy</td>
                <td>PII redaction on image uploads</td>
                <td><span className="status-badge status-passed">Passed</span></td>
              </tr>
              <tr>
                <td>Cost Guardrail</td>
                <td>Daily spend &lt; $200</td>
                <td><span className="status-badge status-pending">Review</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {step === 4 && (
        <div className="card card-pad">
          <h3 className="card-title">Deploy</h3>
          <p className="page-subtitle">Review configuration and publish to {metadata.environment}.</p>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Nodes</div>
              <div className="metric-value">{nodes.length}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Connections</div>
              <div className="metric-value">{edges.length}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Environment</div>
              <div className="metric-value" style={{ fontSize: '1.1rem' }}>{metadata.environment}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Version</div>
              <div className="metric-value" style={{ fontSize: '1.1rem' }}>{metadata.version}</div>
            </div>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => setSaveMessage('Deployment queued for production')}>
            Confirm Deploy
          </button>
        </div>
      )}
    </div>
  );
}
