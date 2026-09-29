export type TenantContext = {
  tenantId: string;
  organizationId?: string;
  branchId?: string;
  userId?: string;
  roles: string[];
  permissions: string[];
};

export type ErrorBody = {
  error: {
    code: string;
    message: string;
    correlationId?: string;
    details?: unknown;
  };
};

export const HTTP_ERROR = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION: 422,
  RATE_LIMIT: 429,
  INTERNAL: 500,
  DEPENDENCY: 503,
} as const;
