import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes, resolving conflicts safely.
 * WHY THIS OVER STUDENT IMPLEMENTATION:
 * Students often use string concatenation (`${classA} ${classB}`), which breaks
 * when Tailwind utility conflicts occur (e.g., `p-4` vs `p-2`). 
 * `cn` uses `tailwind-merge` to resolve specificity correctly, essential for building
 * robust, reusable design systems.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
