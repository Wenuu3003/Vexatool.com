import { describe, it, expect } from 'vitest';
import {
  validateMergeFiles,
  isPDFFile,
  generateMergedFilename,
  calculateTotalSize,
  formatFileSize,
  reorderFiles,
  removeFile,
  estimateMergeTime,
} from './pdfMerge';

// Helper to create mock File
const createMockFile = (name: string, size: number, type: string): File => {
  const file = new File([''], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('PDF Merge Utilities', () => {
  describe('validateMergeFiles', () => {
    it('should reject less than 2 files', () => {
      const files = [createMockFile('test.pdf', 1000, 'application/pdf')];
      const result = validateMergeFiles(files);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 2');
    });

    it('should reject empty array', () => {
      const result = validateMergeFiles([]);
      expect(result.valid).toBe(false);
    });

    it('should accept 2 valid PDF files', () => {
      const files = [
        createMockFile('test1.pdf', 1000, 'application/pdf'),
        createMockFile('test2.pdf', 2000, 'application/pdf'),
      ];
      expect(validateMergeFiles(files)).toEqual({ valid: true });
    });

    it('should reject more than 20 files', () => {
      const files = Array(21).fill(null).map((_, i) => 
        createMockFile(`test${i}.pdf`, 1000, 'application/pdf')
      );
      const result = validateMergeFiles(files);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Maximum 20');
    });

    it('should accept exactly 20 files', () => {
      const files = Array(20).fill(null).map((_, i) => 
        createMockFile(`test${i}.pdf`, 1000, 'application/pdf')
      );
      expect(validateMergeFiles(files)).toEqual({ valid: true });
    });

    it('should reject non-PDF files', () => {
      const files = [
        createMockFile('test1.pdf', 1000, 'application/pdf'),
        createMockFile('test2.docx', 2000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
      ];
      const result = validateMergeFiles(files);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not a valid PDF');
    });
  });

  describe('isPDFFile', () => {
    it('should identify PDF by MIME type', () => {
      const file = createMockFile('document.pdf', 1000, 'application/pdf');
      expect(isPDFFile(file)).toBe(true);
    });

    it('should identify PDF by extension fallback', () => {
      const file = createMockFile('document.pdf', 1000, '');
      expect(isPDFFile(file)).toBe(true);
    });

    it('should reject non-PDF files', () => {
      expect(isPDFFile(createMockFile('doc.docx', 1000, 'application/msword'))).toBe(false);
      expect(isPDFFile(createMockFile('image.png', 1000, 'image/png'))).toBe(false);
      expect(isPDFFile(createMockFile('data.txt', 1000, 'text/plain'))).toBe(false);
    });

    it('should handle uppercase extensions', () => {
      const file = createMockFile('DOCUMENT.PDF', 1000, '');
      expect(isPDFFile(file)).toBe(true);
    });
  });

  describe('generateMergedFilename', () => {
    it('should generate filename with date', () => {
      const filename = generateMergedFilename();
      expect(filename).toMatch(/^merged_\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it('should use custom prefix', () => {
      const filename = generateMergedFilename('combined');
      expect(filename).toMatch(/^combined_\d{4}-\d{2}-\d{2}\.pdf$/);
    });
  });

  describe('calculateTotalSize', () => {
    it('should sum file sizes', () => {
      const files = [
        createMockFile('a.pdf', 1000, 'application/pdf'),
        createMockFile('b.pdf', 2000, 'application/pdf'),
        createMockFile('c.pdf', 3000, 'application/pdf'),
      ];
      expect(calculateTotalSize(files)).toBe(6000);
    });

    it('should return 0 for empty array', () => {
      expect(calculateTotalSize([])).toBe(0);
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(500)).toBe('500 Bytes');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(5242880)).toBe('5 MB');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should handle zero', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });
  });

  describe('reorderFiles', () => {
    it('should move file forward', () => {
      const files = [
        createMockFile('a.pdf', 1000, 'application/pdf'),
        createMockFile('b.pdf', 2000, 'application/pdf'),
        createMockFile('c.pdf', 3000, 'application/pdf'),
      ];
      const result = reorderFiles(files, 0, 2);
      expect(result[0].name).toBe('b.pdf');
      expect(result[1].name).toBe('c.pdf');
      expect(result[2].name).toBe('a.pdf');
    });

    it('should move file backward', () => {
      const files = [
        createMockFile('a.pdf', 1000, 'application/pdf'),
        createMockFile('b.pdf', 2000, 'application/pdf'),
        createMockFile('c.pdf', 3000, 'application/pdf'),
      ];
      const result = reorderFiles(files, 2, 0);
      expect(result[0].name).toBe('c.pdf');
      expect(result[1].name).toBe('a.pdf');
      expect(result[2].name).toBe('b.pdf');
    });

    it('should handle same index', () => {
      const files = [
        createMockFile('a.pdf', 1000, 'application/pdf'),
        createMockFile('b.pdf', 2000, 'application/pdf'),
      ];
      const result = reorderFiles(files, 1, 1);
      expect(result).toEqual(files);
    });

    it('should handle invalid indices', () => {
      const files = [createMockFile('a.pdf', 1000, 'application/pdf')];
      expect(reorderFiles(files, -1, 0)).toEqual(files);
      expect(reorderFiles(files, 0, 5)).toEqual(files);
    });
  });

  describe('removeFile', () => {
    it('should remove file at index', () => {
      const files = [
        createMockFile('a.pdf', 1000, 'application/pdf'),
        createMockFile('b.pdf', 2000, 'application/pdf'),
        createMockFile('c.pdf', 3000, 'application/pdf'),
      ];
      const result = removeFile(files, 1);
      expect(result.length).toBe(2);
      expect(result[0].name).toBe('a.pdf');
      expect(result[1].name).toBe('c.pdf');
    });

    it('should handle invalid index', () => {
      const files = [createMockFile('a.pdf', 1000, 'application/pdf')];
      expect(removeFile(files, -1)).toEqual(files);
      expect(removeFile(files, 5)).toEqual(files);
    });
  });

  describe('estimateMergeTime', () => {
    it('should estimate less than 1 second for small files', () => {
      expect(estimateMergeTime(100000)).toBe('Less than 1 second');
    });

    it('should estimate seconds for medium files', () => {
      expect(estimateMergeTime(30 * 1024 * 1024)).toBe('~3 seconds');
    });

    it('should estimate minutes for large files', () => {
      expect(estimateMergeTime(600 * 1024 * 1024)).toBe('~1 minute');
      expect(estimateMergeTime(1200 * 1024 * 1024)).toBe('~2 minutes');
    });
  });
});
