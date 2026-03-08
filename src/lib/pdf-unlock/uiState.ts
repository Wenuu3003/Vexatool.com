import type { ProcessStep } from "./types";

export interface UnlockUiState {
  isProcessing: boolean;
  step: ProcessStep;
  progress: number;
}

export const INITIAL_UNLOCK_UI_STATE: UnlockUiState = {
  isProcessing: false,
  step: "idle",
  progress: 0,
};

export const createUnlockUiState = (
  step: ProcessStep,
  progress: number,
  isProcessing: boolean
): UnlockUiState => ({
  step,
  progress,
  isProcessing,
});

export const getUnlockStepLabel = (step: ProcessStep, progress: number): string => {
  switch (step) {
    case "decrypting":
      return "Decrypting PDF...";
    case "rendering":
      return `Rendering pages... (${Math.round(progress)}%)`;
    case "building":
      return "Building unlocked PDF...";
    case "done":
      return "Complete!";
    default:
      return "";
  }
};
