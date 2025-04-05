import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateKoppenSimilarity(
  codeA: string,
  codeB: string,
): number {
  if (codeA === codeB) return 100;

  const a = codeA.toUpperCase();
  const b = codeB.toUpperCase();

  const mainA = a[0];
  const mainB = b[0];
  const subA = a[1] || "";
  const subB = b[1] || "";
  const tempA = a[2] || "";
  const tempB = b[2] || "";

  let score = 0;

  // Broad group match (A, B, C, D, E)
  if (mainA === mainB) {
    score += 60;
  } else if (
    (mainA === "D" && mainB === "E") ||
    (mainA === "E" && mainB === "D")
  ) {
    score += 30; // both cold climates
  } else if (
    (mainA === "C" && mainB === "D") ||
    (mainA === "D" && mainB === "C")
  ) {
    score += 20; // temperate vs cold
  }

  // Subtype / precipitation match
  if (subA === subB) {
    score += 25;
  } else if (
    // both dry summer (s) or dry winter (w) → somewhat similar
    (["s", "w"].includes(subA) && subA === subB) ||
    (["s", "w"].includes(subA) && ["s", "w"].includes(subB))
  ) {
    score += 10;
  }

  // Temperature subtype (hot vs warm vs cold)
  if (tempA === tempB && tempA !== "") {
    score += 15;
  } else if (
    // Special case: BWh vs BWk (hot vs cold desert)
    (a.startsWith("BW") && b.startsWith("BW")) ||
    (a.startsWith("BS") && b.startsWith("BS"))
  ) {
    score += 10;
  } else if (tempA && tempB) {
    score += 5; // very loose match on temperature subtype
  }

  return Math.min(score, 100);
}
