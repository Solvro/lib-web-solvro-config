export interface PromItem<T> {
  label: string;
  value: T;
  hint?: string;
}

export type FrameworkOption = "react";

export interface PromptResult {
  uncommittedConfirmed: boolean;
  frameworks: FrameworkOption[];
  updateVscodeSettings: unknown;
}
