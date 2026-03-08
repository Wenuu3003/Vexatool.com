import { describe, it, expect, vi, beforeEach } from "vitest";
import * as inspector from "./inspector";
import { openWithPasswordCandidates, buildPasswordCandidates } from "./service";
import { UnlockPdfError } from "./classifier";

describe("aadhaar unlock flow", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("accepts Aadhaar-style password after normalization/trimming", async () => {
    const fakePdf = { numPages: 1 } as unknown as import("pdfjs-dist").PDFDocumentProxy;

    vi.spyOn(inspector, "openPdfDocument").mockImplementation(async (_data, options) => {
      if (options.password === "SONTI1991") {
        return fakePdf;
      }
      throw new UnlockPdfError("incorrect-password", "wrong");
    });

    const data = new Uint8Array([1, 2, 3]);
    const result = await openWithPasswordCandidates(data, "  SONTI1991  ", { logger: undefined });

    expect(result.pdf).toBe(fakePdf);
    expect(result.passwordUsed).toBe("SONTI1991");
  });

  it("returns incorrect-password only when password validation is actually rejected", async () => {
    vi.spyOn(inspector, "openPdfDocument").mockRejectedValue(
      new UnlockPdfError("incorrect-password", "wrong")
    );

    const data = new Uint8Array([1, 2, 3]);
    await expect(openWithPasswordCandidates(data, "SONTI1991", { logger: undefined })).rejects.toMatchObject({
      kind: "incorrect-password",
    });
  });

  it("surfaces library limitation without misreporting incorrect password", async () => {
    vi.spyOn(inspector, "openPdfDocument").mockRejectedValue(
      new UnlockPdfError("library-limitation", "engine failed before password validation")
    );

    const data = new Uint8Array([1, 2, 3]);
    await expect(openWithPasswordCandidates(data, "SONTI1991", { logger: undefined })).rejects.toMatchObject({
      kind: "library-limitation",
    });
  });

  it("generates stable Aadhaar candidate password variations", () => {
    const candidates = buildPasswordCandidates("\u200BSONTI1991\u00A0");
    expect(candidates).toContain("SONTI1991");
  });
});
