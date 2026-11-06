export interface Definition { key: string; label: string; default: string; kind: string; options: string[]; min: number; max: number }
export function validateTheme(input: unknown, registry: Definition[], complete?: boolean): Record<string,string>;
export function contrast(a: string,b: string): number;
export function contrastIssues(values: Record<string,string>): string[];
