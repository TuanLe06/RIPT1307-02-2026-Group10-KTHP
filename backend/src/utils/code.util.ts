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

export function generateAdmissionCombinationCode(): string {
  return `TH${randomDigits(6)}`;
}

export function validateCode(code: string, type: "university" | "major" | "admission_combination"): boolean {
  const prefixes: Record<string, string> = { university: "DH", major: "NH", admission_combination: "TH" };
  const prefix = prefixes[type];
  return new RegExp(`^${prefix}\\d{6}$`).test(code);
}
