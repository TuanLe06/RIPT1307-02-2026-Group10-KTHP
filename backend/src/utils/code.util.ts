function randomDigits(length: number): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

export function generateUniversityCode(): string {
  return `DH${randomDigits(6)}`;
}

export function generateMajorCode(): string {
  return `NH${randomDigits(6)}`;
}

export function validateCode(code: string, type: "university" | "major"): boolean {
  const prefix = type === "university" ? "DH" : "NH";
  return new RegExp(`^${prefix}\\d{6}$`).test(code);
}
