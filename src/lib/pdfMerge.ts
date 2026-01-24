/**
 * PDF Merge utility functions - extracted for testability
 */

export interface MergeValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates files for PDF merge operation
 */
export const validateMergeFiles = (files: File[]): MergeValidationResult => {
  if (files.length < 2) {
    return { 
      valid: false, 
      error: 'Please select at least 2 PDF files to merge' 
    };
  }

  if (files.length > 20) {
    return { 
      valid: false, 
      error: 'Maximum 20 files allowed per merge operation' 
    };
  }

  // Check all files are PDFs
  for (const file of files) {
    if (!isPDFFile(file)) {
      return { 
        valid: false, 
        error: `File "${file.name}" is not a valid PDF` 
      };
    }
  }

  return { valid: true };
};

/**
 * Checks if a file is a valid PDF
 */
export const isPDFFile = (file: File): boolean => {
  // Check by MIME type
  if (file.type === 'application/pdf') {
    return true;
  }
  
  // Fallback: check by extension
  const extension = file.name.toLowerCase().split('.').pop();
  return extension === 'pdf';
};

/**
 * Generates merged filename with timestamp
 */
export const generateMergedFilename = (prefix: string = 'merged'): string => {
  const timestamp = new Date().toISOString().slice(0, 10);
  return `${prefix}_${timestamp}.pdf`;
};

/**
 * Calculates total file size
 */
export const calculateTotalSize = (files: File[]): number => {
  return files.reduce((total, file) => total + file.size, 0);
};

/**
 * Formats file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Reorders files array by moving item from one index to another
 */
export const reorderFiles = (
  files: File[], 
  fromIndex: number, 
  toIndex: number
): File[] => {
  if (fromIndex < 0 || fromIndex >= files.length) return files;
  if (toIndex < 0 || toIndex >= files.length) return files;
  if (fromIndex === toIndex) return files;

  const result = [...files];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
};

/**
 * Removes file at specified index
 */
export const removeFile = (files: File[], index: number): File[] => {
  if (index < 0 || index >= files.length) return files;
  return files.filter((_, i) => i !== index);
};

/**
 * Estimates merge time based on total file size
 */
export const estimateMergeTime = (totalBytes: number): string => {
  // Rough estimation: ~10MB per second
  const rawSeconds = totalBytes / (10 * 1024 * 1024);
  
  if (rawSeconds < 1) return 'Less than 1 second';
  
  const seconds = Math.ceil(rawSeconds);
  if (seconds === 1) return '~1 second';
  if (seconds < 60) return `~${seconds} seconds`;
  
  const minutes = Math.ceil(seconds / 60);
  return `~${minutes} minute${minutes > 1 ? 's' : ''}`;
};
