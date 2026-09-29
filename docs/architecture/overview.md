# Architecture overview

AIJewel is a multi-tenant, API-first, event-driven set of loosely coupled microservices.

- Sync: versioned REST (`/v1/...`) with OpenAPI 3.1 contracts
- Async: versioned domain events (AsyncAPI)
- Layers: API → Application → Domain → Infrastructure
- Adapters: local (file/memory/DynamoDB Local) and future AWS (Lambda, DynamoDB, S3, EventBridge, …)

Exclusions: AI Sales Agent & CRM, Marketing Automation.
