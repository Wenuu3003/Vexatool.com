import type { UnlockErrorKind, UnlockFailureInfo } from "./types";

const UNSUPPORTED_PATTERNS = [
  "unsupported encryption",
  "unsupported security handler",
  "unsupported feature",
  "unknown encryption",
  "algorithm not implemented",
  "not implemented",
  "cipher",
  "security handler",
];

const CORRUPT_PATTERNS = [
  "invalid pdf",
  "invalid or corrupted",
  "corrupt",
  "bad xref",
  "xref",
  "trailer",
  "unexpected eof",
  "formaterror",
];

const PASSWORD_NEED_CODE = 1;
const PASSWORD_INCORRECT_CODE = 2;

export class UnlockPdfError extends Error {
  kind: UnlockErrorKind;
  details: UnlockFailureInfo;
  rawError?: unknown;

  constructor(kind: UnlockErrorKind, message: string, details: Partial<UnlockFailureInfo> = {}, rawError?: unknown) {
    super(message);
    this.name = "UnlockPdfError";
    this.kind = kind;
    this.details = {
      kind,
      message,
      ...details,
    };
    this.rawError = rawError;
  }
}

export const isUnlockPdfError = (error: unknown): error is UnlockPdfError => {
  return error instanceof UnlockPdfError;
};

interface ClassifyContext {
  passwordProvided: boolean;
  encryptionMarkersDetected: boolean;
}

export const classifyPdfProcessingError = (
  error: unknown,
  context: ClassifyContext
): UnlockPdfError => {
  const err = error as { name?: string; message?: string; code?: number | string };
  const name = err?.name ?? "UnknownError";
  const rawMessage = err?.message ?? "Unknown error";
  const message = rawMessage.toLowerCase();
  const code = err?.code;

  if (name === "PasswordException") {
    if (code === PASSWORD_INCORRECT_CODE) {
      return new UnlockPdfError(
        "incorrect-password",
        "Password validation failed.",
        { name, code, rawMessage },
        error
      );
    }

    if (code === PASSWORD_NEED_CODE) {
      return new UnlockPdfError(
        "password-required",
        "PDF requires a password.",
        { name, code, rawMessage },
        error
      );
    }
  }

  if (name === "InvalidPDFException" || name === "FormatError" || CORRUPT_PATTERNS.some((p) => message.includes(p))) {
    return new UnlockPdfError(
      "corrupted-pdf",
      "PDF appears to be corrupted or malformed.",
      { name, code, rawMessage },
      error
    );
  }

  if (UNSUPPORTED_PATTERNS.some((p) => message.includes(p))) {
    return new UnlockPdfError(
      "unsupported-encryption",
      "PDF uses unsupported encryption in the current browser engine.",
      { name, code, rawMessage },
      error
    );
  }

  if (context.encryptionMarkersDetected && context.passwordProvided && message.includes("password") && name !== "PasswordException") {
    return new UnlockPdfError(
      "library-limitation",
      "Encrypted PDF failed before password validation due to parser limitations.",
      { name, code, rawMessage },
      error
    );
  }

  return new UnlockPdfError(
    "parse-failed",
    "Could not parse this PDF with the current engine.",
    { name, code, rawMessage },
    error
  );
};
