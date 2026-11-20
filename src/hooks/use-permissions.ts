"use client";

import { useMemo } from "react";
import { getClientPermissions, type ClientPermissions } from "@/lib/permissions";

export function usePermissions(): ClientPermissions {
  return useMemo(() => getClientPermissions(), []);
}
