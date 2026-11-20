import axios from "axios";

/**
 * Extracts a human-readable error message from various error types,
 * specifically looking for Axios error responses.
 */
export function getErrorMessage(error: unknown, defaultMessage: string = "An unexpected error occurred"): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || defaultMessage;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === "string") {
    return error;
  }
  
  return defaultMessage;
}
