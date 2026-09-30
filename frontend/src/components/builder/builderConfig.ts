export interface NodeTypeDefinition {
  type: string;
  label: string;
  category: 'input' | 'processing' | 'ai' | 'integration' | 'logic' | 'output';
  defaultConfig: Record<string, unknown>;
}

export const NODE_TYPES: NodeTypeDefinition[] = [
  { type: 'user', label: 'User', category: 'input', defaultConfig: {} },
  { type: 'api', label: 'API', category: 'input', defaultConfig: { method: 'GET', endpoint: '' } },
  { type: 'authentication', label: 'Authentication', category: 'input', defaultConfig: { provider: 'oauth2' } },
  { type: 'image_upload', label: 'Image Upload', category: 'input', defaultConfig: { maxSizeMb: 10 } },
  { type: 'image_processing', label: 'Image Processing', category: 'processing', defaultConfig: { operations: [] } },
  {
    type: 'unity_webgl',
    label: 'Unity WebGL',
    category: 'integration',
    defaultConfig: {
      nodeName: 'Unity Try-On',
      unityPackage: 'aijewel-tryon',
      unityVersion: '2022.3 LTS',
      webglBuildVersion: '1.0.0',
      assetLocation: '/unity-tryon/Build',
      entryPoint: 'TryOnController',
      configuration: '{}',
      memoryLimit: 512,
      loadingTimeout: 60000,
      inputSchema: '{}',
      outputSchema: '{}',
      environment: 'production',
    },
  },
  { type: 'model', label: 'Model', category: 'ai', defaultConfig: { modelId: '' } },
  { type: 'prompt', label: 'Prompt', category: 'ai', defaultConfig: { promptId: '' } },
  { type: 'agent', label: 'Agent', category: 'ai', defaultConfig: { agentId: '' } },
  { type: 'workflow', label: 'Workflow', category: 'ai', defaultConfig: { workflowId: '' } },
  { type: 'rag', label: 'RAG', category: 'ai', defaultConfig: { knowledgeBaseId: '' } },
  { type: 'vector_search', label: 'Vector Search', category: 'ai', defaultConfig: { storeId: '' } },
  { type: 'database', label: 'Database', category: 'integration', defaultConfig: { connection: '' } },
  { type: 's3', label: 'S3', category: 'integration', defaultConfig: { bucket: '' } },
  { type: '3d_conversion', label: '3D Conversion', category: 'processing', defaultConfig: { format: 'glb' } },
  { type: 'background_removal', label: 'Background Removal', category: 'processing', defaultConfig: {} },
  { type: 'human_approval', label: 'Human Approval', category: 'logic', defaultConfig: { approvers: [] } },
  { type: 'condition', label: 'Condition', category: 'logic', defaultConfig: { expression: '' } },
  { type: 'notification', label: 'Notification', category: 'output', defaultConfig: { channel: 'email' } },
  { type: 'output', label: 'Output', category: 'output', defaultConfig: {} },
  // Business Operations nodes (Sections 55–84) — additive
  {
    type: 'customer',
    label: 'Customer',
    category: 'input',
    defaultConfig: { customerId: '', lifecycle: 'ONBOARDING' },
  },
  {
    type: 'inventory',
    label: 'Inventory',
    category: 'processing',
    defaultConfig: { mode: 'create', category: 'Ring' },
  },
  {
    type: 'kiosk',
    label: 'Kiosk',
    category: 'integration',
    defaultConfig: { kioskId: '', action: 'sync' },
  },
  {
    type: 'asset_3d',
    label: '3D Asset',
    category: 'processing',
    defaultConfig: { jewelryId: '', lifecycle: 'PUBLISHED' },
  },
  {
    type: 'billing',
    label: 'Billing',
    category: 'output',
    defaultConfig: { action: 'record_usage', usageType: 'tryon_session' },
  },
];

export const UNITY_WEBGL_FIELDS = [
  'nodeName',
  'unityPackage',
  'unityVersion',
  'webglBuildVersion',
  'assetLocation',
  'entryPoint',
  'configuration',
  'memoryLimit',
  'loadingTimeout',
  'inputSchema',
  'outputSchema',
  'environment',
] as const;
