import { toast } from "sonner";
import { CircleCheckIcon, OctagonXIcon, RefreshCwIcon, InfoIcon, TriangleAlertIcon } from "lucide-react";

export const appToast = {
  success: (message: string, description?: string) => {
    return toast.success(message, {
      description,
      icon: <CircleCheckIcon className="size-4 text-green-700" />,
      className: "group-[.toaster]:bg-green-50 group-[.toaster]:border-green-200 group-[.toaster]:text-green-700",
    });
  },
  error: (message: string, description?: string) => {
    return toast.error(message, {
      description,
      icon: <OctagonXIcon className="size-4 text-red-600" />,
      className: "group-[.toaster]:bg-red-50 group-[.toaster]:border-red-200 group-[.toaster]:text-red-600",
    });
  },
  updated: (message: string, description?: string) => {
    return toast(message, {
      description,
      icon: <RefreshCwIcon className="size-4 text-blue-700" />,
      className: "group-[.toaster]:bg-blue-50 group-[.toaster]:border-blue-200 group-[.toaster]:text-blue-700",
    });
  },
  info: (message: string, description?: string) => {
    return toast.info(message, {
      description,
      icon: <InfoIcon className="size-4 text-blue-700" />,
      className: "group-[.toaster]:bg-blue-50 group-[.toaster]:border-blue-200 group-[.toaster]:text-blue-700",
    });
  },
  warning: (message: string, description?: string) => {
    return toast.warning(message, {
      description,
      icon: <TriangleAlertIcon className="size-4 text-yellow-700" />,
      className: "group-[.toaster]:bg-yellow-50 group-[.toaster]:border-yellow-200 group-[.toaster]:text-yellow-700",
    });
  },
  message: (message: string, description?: string) => {
    return toast(message, {
      description,
    });
  }
};
