"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDefaultRoute, isAdminRole } from "@/lib/permissions";
import { getUser } from "@/lib/auth";
import { FullPageLoader } from "@/components/shared/loader";

/** Redirects non-admin users away from edit/admin-only pages */
export function RestrictedRouteGuard() {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (!isAdminRole(user?.user_role)) {
      router.replace(getDefaultRoute(user?.user_role));
    }
  }, [router]);

  return <FullPageLoader />;
}
