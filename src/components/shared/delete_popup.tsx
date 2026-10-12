import { useEffect, useRef, useState } from "react";
import { Loader2, Trash2, TriangleAlert, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

/** How long the button has to be held before the delete goes through */
const HOLD_MS = 1500;

interface DeleteAlertPopProps {
  isOpen: boolean;
  onClose: () => void;
  handleSubmit: () => void;
}

/**
 * Delete only happens after the button is held down until the red fill reaches the end.
 * Letting go early runs the fill back and nothing is deleted. Works with the mouse, touch,
 * and by holding Space or Enter.
 */
function HoldToDeleteButton({ onConfirm }: { onConfirm: () => void }) {
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = () => {
    if (done || timer.current) return;
    setHolding(true);
    timer.current = setTimeout(() => {
      timer.current = null;
      setHolding(false);
      setDone(true);
      onConfirm();
    }, HOLD_MS);
  };

  const cancel = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    setHolding(false);
  };

  useEffect(() => cancel, []);

  const label = done ? "Deleting…" : holding ? "Keep holding…" : "Delete";
  const Icon = done ? Loader2 : Trash2;
  const iconClass = cn("size-4", done && "animate-spin");

  return (
    <button
      type="button"
      disabled={done}
      aria-label={done ? "Deleting" : "Press and hold to delete"}
      onPointerDown={(e) => {
        // Only the main button or a touch starts the hold
        if (e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        start();
      }}
      onPointerUp={cancel}
      onPointerCancel={cancel}
      onLostPointerCapture={cancel}
      onKeyDown={(e) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat) {
          e.preventDefault();
          start();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") cancel();
      }}
      onBlur={cancel}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        "relative inline-flex h-9 min-w-[160px] shrink-0 select-none items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md px-4 text-sm font-semibold",
        "border border-red-600 bg-white text-red-700 touch-none",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-300",
        "disabled:cursor-default"
      )}
    >
      {/* Red fill that grows while held and runs back when released */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 bg-red-600"
        style={{
          width: holding || done ? "100%" : "0%",
          transitionProperty: "width",
          transitionTimingFunction: holding ? "linear" : "ease-out",
          transitionDuration: holding ? `${HOLD_MS}ms` : done ? "0ms" : "250ms",
        }}
      />
      {/* Label drawn twice: red on white, and white clipped to the fill, so it stays readable */}
      <span className="relative flex items-center justify-center gap-2 whitespace-nowrap">
        <Icon className={iconClass} aria-hidden />
        {label}
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 whitespace-nowrap bg-red-600 text-white"
        style={{
          clipPath: holding || done ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
          transitionProperty: "clip-path",
          transitionTimingFunction: holding ? "linear" : "ease-out",
          transitionDuration: holding ? `${HOLD_MS}ms` : done ? "0ms" : "250ms",
        }}
      >
        <Icon className={iconClass} />
        {label}
      </span>
    </button>
  );
}

export function AlertDeleteDialog({
  isOpen,
  onClose,
  handleSubmit,
}: DeleteAlertPopProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <div className="flex items-start gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 ring-1 ring-red-100">
            <TriangleAlert className="size-5" aria-hidden />
          </span>
          <AlertDialogHeader className="text-left">
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              data and remove your data from our servers.
            </AlertDialogDescription>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-red-700">
              <Trash2 className="size-3.5 shrink-0" aria-hidden />
              Press and hold Delete until it fills to confirm.
            </p>
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter className="sm:items-center">
          <AlertDialogCancel>
            <X className="size-4" aria-hidden />
            Cancel
          </AlertDialogCancel>
          {/* Remounted each time the dialog opens, so it always starts empty */}
          {isOpen && <HoldToDeleteButton onConfirm={handleSubmit} />}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
