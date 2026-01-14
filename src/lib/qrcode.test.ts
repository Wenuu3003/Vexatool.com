import { describe, it, expect } from 'vitest';
import {
  validateQRContent,
  isValidUrl,
  parseBatchUrls,
  validateBatchInput,
  generateFilenameFromUrl,
  validateLogoFile,
  validateImageFile,
  calculateLogoPosition,
} from './qrcode';

describe('QR Code Utilities', () => {
  describe('validateQRContent', () => {
    it('should reject empty content', () => {
      expect(validateQRContent('')).toEqual({ valid: false, error: 'Content cannot be empty' });
      expect(validateQRContent('   ')).toEqual({ valid: false, error: 'Content cannot be empty' });
    });

    it('should accept valid short content', () => {
      expect(validateQRContent('https://example.com')).toEqual({ valid: true });
      expect(validateQRContent('Hello World')).toEqual({ valid: true });
    });

    it('should reject content over 2000 characters', () => {
      const longContent = 'a'.repeat(2001);
      const result = validateQRContent(longContent);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('too long');
    });

    it('should accept content at exactly 2000 characters', () => {
      const exactContent = 'a'.repeat(2000);
      expect(validateQRContent(exactContent)).toEqual({ valid: true });
    });

    it('should reject data URLs', () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgo...';
      const result = validateQRContent(dataUrl);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Data URLs');
    });
  });

  describe('isValidUrl', () => {
    it('should accept valid URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('https://sub.domain.com/path?query=1')).toBe(true);
      expect(isValidUrl('ftp://files.example.com')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not a url')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('//missing-protocol.com')).toBe(false);
    });
  });

  describe('parseBatchUrls', () => {
    it('should parse newline-separated URLs', () => {
      const input = 'https://example.com\nhttps://google.com\nhttps://github.com';
      const result = parseBatchUrls(input);
      expect(result).toEqual([
        'https://example.com',
        'https://google.com',
        'https://github.com',
      ]);
    });

    it('should trim whitespace', () => {
      const input = '  https://example.com  \n  https://google.com  ';
      const result = parseBatchUrls(input);
      expect(result).toEqual(['https://example.com', 'https://google.com']);
    });

    it('should filter empty lines', () => {
      const input = 'https://example.com\n\n\nhttps://google.com\n';
      const result = parseBatchUrls(input);
      expect(result).toEqual(['https://example.com', 'https://google.com']);
    });

    it('should return empty array for empty input', () => {
      expect(parseBatchUrls('')).toEqual([]);
      expect(parseBatchUrls('   \n\n   ')).toEqual([]);
    });
  });

  describe('validateBatchInput', () => {
    it('should reject empty array', () => {
      const result = validateBatchInput([]);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('No URLs');
    });

    it('should accept valid batch', () => {
      const urls = ['https://example.com', 'https://google.com'];
      expect(validateBatchInput(urls)).toEqual({ valid: true });
    });

    it('should reject more than 50 URLs', () => {
      const urls = Array(51).fill('https://example.com');
      const result = validateBatchInput(urls);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Maximum 50');
    });

    it('should accept exactly 50 URLs', () => {
      const urls = Array(50).fill('https://example.com');
      expect(validateBatchInput(urls)).toEqual({ valid: true });
    });
  });

  describe('generateFilenameFromUrl', () => {
    it('should generate safe filename', () => {
      const filename = generateFilenameFromUrl('https://example.com/path', 0);
      expect(filename).toBe('qrcode_1_https___example_com_path.png');
    });

    it('should truncate long URLs', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(100);
      const filename = generateFilenameFromUrl(longUrl, 5);
      expect(filename.length).toBeLessThanOrEqual(50);
      expect(filename).toContain('qrcode_6_');
    });

    it('should handle special characters', () => {
      const filename = generateFilenameFromUrl('https://example.com?foo=bar&baz=qux', 2);
      expect(filename).not.toContain('?');
      expect(filename).not.toContain('&');
      expect(filename).not.toContain('=');
    });
  });

  describe('validateLogoFile', () => {
    it('should reject files over 2MB', () => {
      const largeFile = new File([''], 'logo.png', { type: 'image/png' });
      Object.defineProperty(largeFile, 'size', { value: 3 * 1024 * 1024 });
      
      const result = validateLogoFile(largeFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('2MB');
    });

    it('should accept valid image files', () => {
      const validFile = new File([''], 'logo.png', { type: 'image/png' });
      Object.defineProperty(validFile, 'size', { value: 100 * 1024 }); // 100KB
      
      expect(validateLogoFile(validFile)).toEqual({ valid: true });
    });

    it('should reject invalid file types', () => {
      const invalidFile = new File([''], 'logo.pdf', { type: 'application/pdf' });
      Object.defineProperty(invalidFile, 'size', { value: 100 * 1024 });
      
      const result = validateLogoFile(invalidFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid image type');
    });
  });

  describe('validateImageFile', () => {
    it('should reject files over 5MB', () => {
      const largeFile = new File([''], 'image.png', { type: 'image/png' });
      Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 });
      
      const result = validateImageFile(largeFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('5MB');
    });

    it('should accept valid sized files', () => {
      const validFile = new File([''], 'image.png', { type: 'image/png' });
      Object.defineProperty(validFile, 'size', { value: 1 * 1024 * 1024 }); // 1MB
      
      expect(validateImageFile(validFile)).toEqual({ valid: true });
    });
  });

  describe('calculateLogoPosition', () => {
    it('should calculate centered position', () => {
      const result = calculateLogoPosition(256, 30);
      
      expect(result.size).toBeCloseTo(76.8); // 30% of 256
      expect(result.x).toBeCloseTo((256 - 76.8) / 2);
      expect(result.y).toBeCloseTo((256 - 76.8) / 2);
      expect(result.padding).toBe(4);
    });

    it('should handle different sizes', () => {
      const result100 = calculateLogoPosition(100, 20);
      expect(result100.size).toBe(20);
      expect(result100.x).toBe(40);
      expect(result100.y).toBe(40);

      const result512 = calculateLogoPosition(512, 25);
      expect(result512.size).toBe(128);
      expect(result512.x).toBe(192);
      expect(result512.y).toBe(192);
    });
  });
});
