export type ProtectionStatus =
  | "checking"
  | "password-protected"
  | "restriction-only"
  | "not-protected"
  | "error";

export type ProcessStep = "idle" | "decrypting" | "rendering" | "building" | "done";

export type UnlockErrorKind =
  | "not-a-pdf"
  | "password-required"
  | "incorrect-password"
  | "unsupported-encryption"
  | "library-limitation"
  | "corrupted-pdf"
  | "parse-failed"
  | "render-failed"
  | "export-failed"
  | "unknown";

export type PdfLogger = (event: string, payload?: Record<string, unknown>) => void;

export interface UnlockProgress {
  step: ProcessStep;
  progress: number;
  detail?: string;
}

export interface FileValidationResult {
  valid: boolean;
  message?: string;
  extensionMatches: boolean;
  mimeType: string;
  size: number;
  header: string;
  hasPdfHeader: boolean;
}

export interface UnlockFailureInfo {
  kind: UnlockErrorKind;
  message: string;
  name?: string;
  code?: number | string;
  rawMessage?: string;
}

export interface PdfInspectionResult {
  protectionStatus: ProtectionStatus;
  pageCount: number;
  hasRestrictions: boolean;
  encryptionMarkersDetected: boolean;
  fileHeader: string;
  failure?: UnlockFailureInfo;
}

export interface UnlockOptions {
  password?: string;
  renderScale?: number;
  previewScale?: number;
  previewLimit?: number;
  jpegQuality?: number;
  disableWorker?: boolean;
  logger?: PdfLogger;
  onProgress?: (progress: UnlockProgress) => void;
}

export interface UnlockOutput {
  blob: Blob;
  pageCount: number;
  previewBlobs: Blob[];
  protectionStatus: ProtectionStatus;
  passwordUsed?: string;
}
