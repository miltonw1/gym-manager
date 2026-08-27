import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractApiError(error: unknown): string | string[] {
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as { response?: { data?: { message?: unknown } } }).response;
    const message = response?.data?.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.map(String);
  }
  return "Algo salió mal. Intente de nuevo.";
}
