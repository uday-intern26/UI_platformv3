export type OnboardingStatus =
  | "draft"
  | "in_progress"
  | "pending_validation"
  | "validated"
  | "activated"
  | "rejected";

export type ChecklistItem = {
  key: string;
  label: string;
  completed: boolean;
  completedAt?: string;
};

export type OnboardingApplication = {
  applicationId: string;
  tenantId?: string;
  status: OnboardingStatus;
  business?: {
    legalName: string;
    tradeName?: string;
    gstin?: string;
    country: string;
    region?: string;
    contactEmail: string;
    contactPhone?: string;
  };
  planId?: string;
  branches: Array<{
    branchId: string;
    name: string;
    city?: string;
    code?: string;
  }>;
  adminInvitation?: {
    email: string;
    invitedAt: string;
    status: "pending" | "accepted";
  };
  kiosks: Array<{
    kioskId: string;
    label: string;
    branchId?: string;
  }>;
  catalogueImportId?: string;
  integrations: string[];
  checklist: ChecklistItem[];
  activatedAt?: string;
  createdAt: string;
  updatedAt: string;
  correlationId: string;
};

export function defaultChecklist(): ChecklistItem[] {
  return [
    { key: "business_profile", label: "Business profile", completed: false },
    { key: "plan_selected", label: "Subscription plan selected", completed: false },
    { key: "branch_created", label: "Initial branch setup", completed: false },
    { key: "admin_invited", label: "Administrator invitation", completed: false },
    { key: "kiosk_provisioned", label: "Kiosk provisioning", completed: false },
    { key: "catalogue_import", label: "Catalogue import", completed: false },
    { key: "integrations", label: "Integration setup", completed: false },
    { key: "validated", label: "Validation complete", completed: false },
    { key: "activated", label: "Tenant activated", completed: false },
  ];
}
