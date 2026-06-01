import { USER_ROLES } from "@/config/enum";
import { getUser } from "@/lib/auth";

export function normalizeUserRole(role?: string): USER_ROLES {
  const normalized = (role ?? "").toUpperCase().trim();
  return normalized === USER_ROLES.ADMIN ? USER_ROLES.ADMIN : USER_ROLES.USER;
}

export function isAdminRole(role?: string): boolean {
  return normalizeUserRole(role) === USER_ROLES.ADMIN;
}

export function isRestrictedUser(role?: string): boolean {
  return !isAdminRole(role);
}

/** Default landing page after login for each role */
export function getDefaultRoute(role?: string): string {
  return isAdminRole(role) ? "/dashboard" : "/quotation-management";
}

const RESTRICTED_USER_ROUTE_PATTERNS: RegExp[] = [
  /^\/quotation-management\/?$/,
  /^\/quotation-management\/create\/?$/,
  /^\/customers\/?$/,
  /^\/customers\/create\/?$/,
  /^\/customers\/\d+\/?$/,
  /^\/purchase-order\/?$/,
  /^\/purchase-order\/create\/?$/,
  /^\/purchase-order\/\d+\/view\/?$/,
];

export function isRouteAllowedForUser(pathname: string, role?: string): boolean {
  if (isAdminRole(role)) return true;
  return RESTRICTED_USER_ROUTE_PATTERNS.some((pattern) =>
    pattern.test(pathname)
  );
}

export interface ClientPermissions {
  isAdmin: boolean;
  canModify: boolean;
  canExportList: boolean;
}

export function getClientPermissions(): ClientPermissions {
  const user = getUser();
  const isAdmin = isAdminRole(user?.user_role);

  return {
    isAdmin,
    canModify: isAdmin,
    canExportList: isAdmin,
  };
}
