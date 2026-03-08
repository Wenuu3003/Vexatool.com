import { describe, it, expect } from "vitest";
import { classifyPdfProcessingError } from "./classifier";

describe("pdf-unlock classifier", () => {
  it("classifies confirmed incorrect password only from PasswordException code=2", () => {
    const error = classifyPdfProcessingError(
      { name: "PasswordException", code: 2, message: "Incorrect Password" },
      { passwordProvided: true, encryptionMarkersDetected: true }
    );

    expect(error.kind).toBe("incorrect-password");
  });

  it("does not mislabel generic parser errors as incorrect password", () => {
    const error = classifyPdfProcessingError(
      { name: "UnknownErrorException", message: "Password dictionary parse failed" },
      { passwordProvided: true, encryptionMarkersDetected: true }
    );

    expect(error.kind).toBe("library-limitation");
  });

  it("classifies malformed PDFs as corrupted", () => {
    const error = classifyPdfProcessingError(
      { name: "InvalidPDFException", message: "Invalid PDF structure" },
      { passwordProvided: false, encryptionMarkersDetected: false }
    );

    expect(error.kind).toBe("corrupted-pdf");
  });
});
