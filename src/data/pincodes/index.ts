// Comprehensive India PIN Code Database - All States Index
import { ExtendedPinCodeData } from './types';
import { ANDHRA_PRADESH_PINCODES } from './andhraPradesh';
import { TELANGANA_PINCODES } from './telangana';
import { TAMIL_NADU_PINCODES } from './tamilNadu';

// Export all state-wise data
export { ExtendedPinCodeData } from './types';

// Combined database with all states
export const EXTENDED_PIN_DATABASE: ExtendedPinCodeData[] = [
  ...ANDHRA_PRADESH_PINCODES,
  ...TELANGANA_PINCODES,
  ...TAMIL_NADU_PINCODES,
];

// Export individual state datasets for targeted queries
export {
  ANDHRA_PRADESH_PINCODES,
  TELANGANA_PINCODES,
  TAMIL_NADU_PINCODES,
};
