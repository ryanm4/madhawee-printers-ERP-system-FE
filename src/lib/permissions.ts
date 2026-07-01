import { USER_ROLES } from "@/config/enum";
import { getUser } from "@/lib/auth";

export function normalizeUserRole(role?: string): USER_ROLES {
  if (!role) return USER_ROLES.SUPER_ADMIN;
  const normalized = role.toUpperCase().trim();
  if (Object.values(USER_ROLES).includes(normalized as USER_ROLES)) {
    return normalized as USER_ROLES;
  }
  return USER_ROLES.SUPER_ADMIN;
}

export function isAdminRole(role?: string): boolean {
  const normalized = normalizeUserRole(role);
  return normalized === USER_ROLES.SUPER_ADMIN || normalized === USER_ROLES.DIRECTOR_GM;
}

export function isRestrictedUser(role?: string): boolean {
  return !isAdminRole(role);
}

/** Default landing page after login for each role */
export function getDefaultRoute(role?: string): string {
  const normalized = normalizeUserRole(role);
  
  switch (normalized) {
    case USER_ROLES.SUPER_ADMIN:
    case USER_ROLES.DIRECTOR_GM:
      return "/dashboard";
    case USER_ROLES.MARKETING_EXECUTIVE_MANAGER:
    case USER_ROLES.ADMIN_OFFICER:
      return "/quotation-management";
    case USER_ROLES.PRODUCTION_MANAGER:
    case USER_ROLES.PRODUCTION_EXECUTIVE:
      return "/job-ticket";
    case USER_ROLES.PROCUREMENT_MANAGER:
      return "/purchase-order";
    case USER_ROLES.STORE_KEEPER:
      return "/inventory";
    case USER_ROLES.DISPATCH_DELIVERY_OFFICER:
      return "/dispatch-invoice";
    case USER_ROLES.FINANCE_MANAGER_ACCOUNTANT:
      return "/dashboard";
    default:
      return "/dashboard";
  }
}

// Route patterns for each module
const ROUTE_PATTERNS = {
  dashboard: /^\/dashboard\/?$/,
  quotations: /^\/quotation-management(\/.*)?$/,
  customers: /^\/customers(\/.*)?$/,
  purchaseOrders: /^\/purchase-order(\/.*)?$/,
  jobTickets: /^\/job-ticket(\/.*)?$/,
  dispatch: /^\/dispatch-invoice(\/.*)?$/,
  grn: /^\/grn(\/.*)?$/,
  inventory: /^\/inventory(\/.*)?$/,
  issueNotes: /^\/issue-notes(\/.*)?$/,
  suppliers: /^\/suppliers(\/.*)?$/,
  reports: /^\/reports(\/.*)?$/,
  users: /^\/users(\/.*)?$/,
};

// Role-based route permissions
const ROLE_PERMISSIONS: Record<USER_ROLES, RegExp[]> = {
  [USER_ROLES.SUPER_ADMIN]: [
    ROUTE_PATTERNS.dashboard,
    ROUTE_PATTERNS.quotations,
    ROUTE_PATTERNS.customers,
    ROUTE_PATTERNS.purchaseOrders,
    ROUTE_PATTERNS.jobTickets,
    ROUTE_PATTERNS.dispatch,
    ROUTE_PATTERNS.grn,
    ROUTE_PATTERNS.inventory,
    ROUTE_PATTERNS.issueNotes,
    ROUTE_PATTERNS.suppliers,
    ROUTE_PATTERNS.reports,
    ROUTE_PATTERNS.users,
  ],
  [USER_ROLES.DIRECTOR_GM]: [
    ROUTE_PATTERNS.dashboard,
    ROUTE_PATTERNS.quotations,
    ROUTE_PATTERNS.customers,
    ROUTE_PATTERNS.purchaseOrders,
    ROUTE_PATTERNS.jobTickets,
    ROUTE_PATTERNS.dispatch,
    ROUTE_PATTERNS.inventory,
    ROUTE_PATTERNS.reports,
    ROUTE_PATTERNS.users,
  ],
  [USER_ROLES.MARKETING_EXECUTIVE_MANAGER]: [
    ROUTE_PATTERNS.quotations,
    ROUTE_PATTERNS.purchaseOrders,
    ROUTE_PATTERNS.jobTickets,
    ROUTE_PATTERNS.reports,
  ],
  [USER_ROLES.ADMIN_OFFICER]: [
    ROUTE_PATTERNS.customers,
    ROUTE_PATTERNS.quotations,
    ROUTE_PATTERNS.purchaseOrders,
    ROUTE_PATTERNS.jobTickets,
    ROUTE_PATTERNS.reports,
  ],
  [USER_ROLES.PRODUCTION_MANAGER]: [
    ROUTE_PATTERNS.jobTickets,
    ROUTE_PATTERNS.dispatch,
    ROUTE_PATTERNS.reports,
  ],
  [USER_ROLES.PRODUCTION_EXECUTIVE]: [
    ROUTE_PATTERNS.jobTickets,
  ],
  [USER_ROLES.PROCUREMENT_MANAGER]: [
    ROUTE_PATTERNS.suppliers,
    ROUTE_PATTERNS.purchaseOrders,
    ROUTE_PATTERNS.grn,
    ROUTE_PATTERNS.inventory,
    ROUTE_PATTERNS.reports,
  ],
  [USER_ROLES.STORE_KEEPER]: [
    ROUTE_PATTERNS.inventory,
    ROUTE_PATTERNS.issueNotes,
    ROUTE_PATTERNS.reports,
  ],
  [USER_ROLES.DISPATCH_DELIVERY_OFFICER]: [
    ROUTE_PATTERNS.dispatch,
    ROUTE_PATTERNS.jobTickets,
  ],
  [USER_ROLES.FINANCE_MANAGER_ACCOUNTANT]: [
    ROUTE_PATTERNS.dashboard,
    ROUTE_PATTERNS.reports,
    ROUTE_PATTERNS.purchaseOrders,
    ROUTE_PATTERNS.jobTickets,
  ],
};

export function isRouteAllowedForUser(pathname: string, role?: string): boolean {
  const normalized = normalizeUserRole(role);
  const allowedPatterns = ROLE_PERMISSIONS[normalized];
  
  if (!allowedPatterns) return false;
  
  return allowedPatterns.some((pattern) => pattern.test(pathname));
}

export interface ClientPermissions {
  isAdmin: boolean;
  canModify: boolean;
  canDelete: boolean;
  canExportList: boolean;
  canApprove: boolean;
  canViewAll: boolean;
}

export function getClientPermissions(): ClientPermissions {
  const user = getUser();
  const normalized = normalizeUserRole(user?.user_role);
  const isAdmin = isAdminRole(user?.user_role);

  const permissions: ClientPermissions = {
    isAdmin,
    canModify: false,
    canDelete: false,
    canExportList: false,
    canApprove: false,
    canViewAll: false,
  };

  switch (normalized) {
    case USER_ROLES.SUPER_ADMIN:
      permissions.canModify = true;
      permissions.canDelete = true;
      permissions.canExportList = true;
      permissions.canApprove = true;
      permissions.canViewAll = true;
      break;
    case USER_ROLES.DIRECTOR_GM:
      permissions.canModify = true;
      permissions.canDelete = false;
      permissions.canExportList = true;
      permissions.canApprove = true;
      permissions.canViewAll = true;
      break;
    case USER_ROLES.MARKETING_EXECUTIVE_MANAGER:
      permissions.canModify = true;
      permissions.canDelete = false;
      permissions.canExportList = true;
      permissions.canApprove = false;
      permissions.canViewAll = false;
      break;
    case USER_ROLES.ADMIN_OFFICER:
      permissions.canModify = true;
      permissions.canDelete = false;
      permissions.canExportList = true;
      permissions.canApprove = false;
      permissions.canViewAll = false;
      break;
    case USER_ROLES.PRODUCTION_MANAGER:
      permissions.canModify = true;
      permissions.canDelete = false;
      permissions.canExportList = true;
      permissions.canApprove = false;
      permissions.canViewAll = true;
      break;
    case USER_ROLES.PRODUCTION_EXECUTIVE:
      permissions.canModify = true;
      permissions.canDelete = false;
      permissions.canExportList = false;
      permissions.canApprove = false;
      permissions.canViewAll = false;
      break;
    case USER_ROLES.PROCUREMENT_MANAGER:
      permissions.canModify = true;
      permissions.canDelete = false;
      permissions.canExportList = true;
      permissions.canApprove = false;
      permissions.canViewAll = false;
      break;
    case USER_ROLES.STORE_KEEPER:
      permissions.canModify = true;
      permissions.canDelete = false;
      permissions.canExportList = true;
      permissions.canApprove = false;
      permissions.canViewAll = false;
      break;
    case USER_ROLES.DISPATCH_DELIVERY_OFFICER:
      permissions.canModify = true;
      permissions.canDelete = false;
      permissions.canExportList = false;
      permissions.canApprove = false;
      permissions.canViewAll = false;
      break;
    case USER_ROLES.FINANCE_MANAGER_ACCOUNTANT:
      permissions.canModify = false;
      permissions.canDelete = false;
      permissions.canExportList = true;
      permissions.canApprove = false;
      permissions.canViewAll = true;
      break;
  }

  return permissions;
}
