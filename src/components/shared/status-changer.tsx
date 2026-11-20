"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusPill } from "@/components/shared/status-text";
import type { StatusAction } from "@/lib/status-actions";

/**
 * "Change status" on a view screen. Lists only the steps this user may take, says what
 * each one means, and asks before saving. Renders nothing when there is nothing to offer.
 */
export function StatusChanger({
  current,
  actions,
  onChange,
}: {
  current: string;
  actions: StatusAction[];
  /** Saves the new status; resolves true when it worked */
  onChange: (to: string) => Promise<boolean>;
}) {
  const [pending, setPending] = useState<StatusAction | null>(null);
  const [saving, setSaving] = useState(false);

  if (actions.length === 0) return null;

  const confirm = async () => {
    if (!pending) return;
    setSaving(true);
    const ok = await onChange(pending.to);
    setSaving(false);
    if (ok) setPending(null);
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            Change status
            <ChevronDown className="size-4 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel className="flex items-center gap-2 text-xs font-normal text-[#4B5567]">
            Now <StatusPill status={current} className="text-xs" />
          </DropdownMenuLabel>
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.to}
              disabled={!!action.blockedReason}
              onSelect={() => setPending(action)}
              className="flex-col items-start gap-0.5 py-2"
            >
              <span className="flex items-center gap-2 font-medium text-[#14213D]">
                <ArrowRight className="size-4" aria-hidden />
                {action.label}
              </span>
              <span className="pl-6 text-xs text-[#4B5567]">{action.blockedReason ?? action.description}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={!!pending} onOpenChange={(open) => !open && !saving && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pending?.label}?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="flex flex-col gap-3">
                <p>{pending?.description}</p>
                <p className="flex flex-wrap items-center gap-2 text-sm text-[#14213D]">
                  <StatusPill status={current} className="text-xs" />
                  <ArrowRight className="size-4 text-[#4B5567]" aria-hidden />
                  <StatusPill status={pending?.to} className="text-xs" />
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <Button onClick={confirm} disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {pending?.label}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
