import type { Application } from '../api/applicationsClient';
import type { AiPolicy } from '../api/governanceClient';
import type { LlmMetric, LlmOpsSummary, ObservabilityTrace } from '../api/llmOpsClient';
import type { Model, ModelRegistryEntry, GatewayRoute } from '../api/modelsClient';
import type { Prompt, PromptRegistryEntry } from '../api/promptsClient';
import type { JewelryProduct, AiRecommendation } from '../api/tryonClient';

export const mockApplications: Application[] = [
  {
    id: 'app-1',
    name: 'Virtual Try-On Experience',
    description: 'Customer-facing jewelry try-on with Unity WebGL',
    businessDomain: 'Retail',
    owner: 'Product Team',
    environment: 'production',
    version: '2.1.0',
    status: 'published',
    updatedAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'app-2',
    name: 'AI Style Advisor',
    description: 'Personalized jewelry recommendations',
    businessDomain: 'Retail',
    owner: 'AI Team',
    environment: 'staging',
    version: '1.0.3',
    status: 'draft',
    updatedAt: '2026-09-05T14:30:00Z',
  },
];

export const mockModels: Model[] = [
  {
    id: 'model-1',
    name: 'gpt-4o',
    provider: 'OpenAI',
    version: '2024-08-06',
    status: 'active',
    capabilities: ['chat', 'vision', 'function-calling'],
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'model-2',
    name: 'claude-3-5-sonnet',
    provider: 'Anthropic',
    version: '20241022',
    status: 'active',
    capabilities: ['chat', 'vision'],
    createdAt: '2026-02-01T00:00:00Z',
  },
];

export const mockRegistry: ModelRegistryEntry[] = mockModels.map((m) => ({
  ...m,
  registeredAt: m.createdAt,
  owner: 'Platform Team',
  tags: ['production', 'verified'],
}));

export const mockGatewayRoutes: GatewayRoute[] = [
  {
    id: 'route-1',
    name: 'Primary Chat',
    modelId: 'model-1',
    priority: 1,
    status: 'enabled',
    requestsPerMinute: 1000,
  },
  {
    id: 'route-2',
    name: 'Fallback Chat',
    modelId: 'model-2',
    priority: 2,
    status: 'enabled',
    requestsPerMinute: 500,
  },
];

export const mockPrompts: Prompt[] = [
  {
    id: 'prompt-1',
    name: 'Jewelry Recommendation',
    description: 'Generate personalized jewelry suggestions',
    template: 'Given user preferences {{preferences}}, recommend jewelry...',
    version: '1.2.0',
    status: 'published',
    tags: ['recommendation', 'retail'],
    updatedAt: '2026-08-20T00:00:00Z',
  },
];

export const mockPromptRegistry: PromptRegistryEntry[] = mockPrompts.map((p) => ({
  ...p,
  registeredAt: '2026-06-01T00:00:00Z',
  owner: 'AI Team',
  usageCount: 1247,
}));

export const mockPolicies: AiPolicy[] = [
  {
    id: 'policy-1',
    name: 'Production Model Policy',
    description: 'Only approved models may run in production environments',
    category: 'general',
    status: 'active',
    rules: [
      {
        id: 'rule-1',
        condition: 'model.status != approved && env == production',
        action: 'deny',
        severity: 'critical',
      },
    ],
    updatedAt: '2026-07-01T00:00:00Z',
  },
  {
    id: 'policy-2',
    name: 'Data Privacy Policy',
    description: 'Prevent exposure of personally identifiable information in model outputs',
    category: 'security',
    status: 'active',
    rules: [
      {
        id: 'rule-2',
        condition: 'output.contains_pii',
        action: 'deny',
        severity: 'critical',
      },
    ],
    updatedAt: '2026-08-15T00:00:00Z',
  },
  {
    id: 'policy-3',
    name: 'Content Safety Guardrail',
    description: 'Filter inappropriate content in customer-facing applications',
    category: 'guardrail',
    status: 'active',
    rules: [
      {
        id: 'rule-3',
        condition: 'output.toxicity_score > 0.7',
        action: 'review',
        severity: 'high',
      },
    ],
    updatedAt: '2026-08-15T00:00:00Z',
  },
  {
    id: 'policy-4',
    name: 'Cost Control Policy',
    description: 'Alert when daily AI spend exceeds budget',
    category: 'compliance',
    status: 'disabled',
    rules: [
      {
        id: 'rule-4',
        condition: 'daily_cost > 200',
        action: 'review',
        severity: 'medium',
      },
    ],
    updatedAt: '2026-09-01T00:00:00Z',
  },
];

export const mockLlmSummary: LlmOpsSummary = {
  totalRequests: 48732,
  totalTokens: 12400000,
  totalCostUsd: 842,
  avgLatencyMs: 1200,
  errorRate: 0.008,
  activeModels: 4,
};

export const mockLlmMetrics: LlmMetric[] = Array.from({ length: 24 }, (_, i) => ({
  timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
  requests: 4000 + Math.floor(Math.random() * 2000),
  tokensIn: 800000 + Math.floor(Math.random() * 400000),
  tokensOut: 600000 + Math.floor(Math.random() * 300000),
  latencyP50: 280 + Math.floor(Math.random() * 80),
  latencyP99: 890 + Math.floor(Math.random() * 200),
  errorRate: 0.005 + Math.random() * 0.02,
  costUsd: 80 + Math.random() * 40,
}));

export const mockTraces: ObservabilityTrace[] = Array.from({ length: 20 }, (_, i) => ({
  id: `trace-${i}`,
  traceId: `tr-${String(i).padStart(8, '0')}`,
  spanName: ['chat.completion', 'embedding.create', 'tryon.recommend'][i % 3],
  durationMs: 120 + Math.floor(Math.random() * 800),
  status: i % 7 === 0 ? 'error' : 'ok',
  modelId: i % 2 === 0 ? 'model-1' : 'model-2',
  timestamp: new Date(Date.now() - i * 60000).toISOString(),
}));

export const mockProducts: JewelryProduct[] = [
  {
    id: 'prod-1',
    name: 'Diamond Drop Earrings',
    category: 'earrings',
    price: 1299,
    currency: 'USD',
    available: true,
    thumbnailUrl: '/placeholder-earring.svg',
    assetUrl: '/assets/earring-celestial.glb',
    sku: 'E-DIAMD-001',
  },
  {
    id: 'prod-2',
    name: 'Heritage Pearl Necklace',
    category: 'necklace',
    price: 4899,
    currency: 'USD',
    available: true,
    thumbnailUrl: '/placeholder-necklace.svg',
    assetUrl: '/assets/necklace-heritage.glb',
    sku: 'N-HERIT-001',
  },
  {
    id: 'prod-3',
    name: 'Solitaire Diamond Ring',
    category: 'ring',
    price: 12500,
    currency: 'USD',
    available: true,
    thumbnailUrl: '/placeholder-ring.svg',
    assetUrl: '/assets/ring-solitaire.glb',
    sku: 'R-SOLIT-001',
  },
  {
    id: 'prod-4',
    name: 'Art Deco Bracelet',
    category: 'bracelet',
    price: 3299,
    currency: 'USD',
    available: false,
    thumbnailUrl: '/placeholder-bracelet.svg',
    assetUrl: '/assets/bracelet-artdeco.glb',
    sku: 'B-ARTDC-001',
  },
  {
    id: 'prod-5',
    name: 'Golden Bangle Set',
    category: 'bangles',
    price: 1899,
    currency: 'USD',
    available: true,
    thumbnailUrl: '/placeholder-bangle.svg',
    assetUrl: '/assets/bangles-golden.glb',
    sku: 'BG-GOLD-001',
  },
];

export const mockRecommendations: AiRecommendation[] = [
  {
    productId: 'prod-2',
    score: 0.94,
    reason: 'Complements your face shape and skin tone',
    product: mockProducts[1],
  },
  {
    productId: 'prod-1',
    score: 0.87,
    reason: 'Matches your selected occasion style',
    product: mockProducts[0],
  },
];
