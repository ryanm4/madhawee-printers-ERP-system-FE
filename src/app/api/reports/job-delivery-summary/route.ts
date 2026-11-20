// Forwards the Job Delivery Summary report to the backend's /reports/job-delivery-summary
import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function POST(request: NextRequest) {
    return proxyToBackend(request, "reports", ["job-delivery-summary"]);
}
