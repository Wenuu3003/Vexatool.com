/**
 * QR Code utility functions - extracted for testability
 */

export interface QRCodeOptions {
  size: number;
  darkColor: string;
  lightColor: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

export const defaultQROptions: QRCodeOptions = {
  size: 256,
  darkColor: '#000000',
  lightColor: '#ffffff',
  errorCorrectionLevel: 'M',
};

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates QR code content
 */
export const validateQRContent = (content: string): ValidationResult => {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'Content cannot be empty' };
  }
  
  if (content.length > 2000) {
    return { valid: false, error: 'Content too long (max 2000 characters)' };
  }
  
  // Check for data URLs (too large for QR codes)
  if (content.startsWith('data:')) {
    return { valid: false, error: 'Data URLs are too large for QR codes' };
  }
  
  return { valid: true };
};

/**
 * Validates URL format
 */
export const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
};

/**
 * Parses batch URLs from text input
 */
export const parseBatchUrls = (input: string): string[] => {
  return input
    .split('\n')
    .map(url => url.trim())
    .filter(url => url.length > 0);
};

/**
 * Validates batch QR generation input
 */
export const validateBatchInput = (urls: string[]): ValidationResult => {
  if (urls.length === 0) {
    return { valid: false, error: 'No URLs provided' };
  }
  
  if (urls.length > 50) {
    return { valid: false, error: 'Maximum 50 URLs allowed per batch' };
  }
  
  return { valid: true };
};

/**
 * Generates a safe filename from URL
 */
export const generateFilenameFromUrl = (url: string, index: number): string => {
  const sanitized = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  return `qrcode_${index + 1}_${sanitized}.png`;
};

/**
 * Validates logo file
 */
export const validateLogoFile = (file: File): ValidationResult => {
  const maxSize = 2 * 1024 * 1024; // 2MB
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Logo must be smaller than 2MB' };
  }
  
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid image type. Use JPG, PNG, GIF, or WebP' };
  }
  
  return { valid: true };
};

/**
 * Validates image file for QR generation
 */
export const validateImageFile = (file: File): ValidationResult => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Image must be smaller than 5MB' };
  }
  
  return { valid: true };
};

/**
 * Calculates logo position and size
 */
export const calculateLogoPosition = (
  qrSize: number,
  logoSizePercent: number
): { x: number; y: number; size: number; padding: number } => {
  const logoSize = (qrSize * logoSizePercent) / 100;
  const x = (qrSize - logoSize) / 2;
  const y = (qrSize - logoSize) / 2;
  const padding = 4;
  
  return { x, y, size: logoSize, padding };
};
