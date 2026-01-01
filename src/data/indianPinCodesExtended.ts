// Re-export from modular pincodes directory
// This file maintains backward compatibility with existing imports

export type { ExtendedPinCodeData } from './pincodes/index';
export { EXTENDED_PIN_DATABASE } from './pincodes/index';

// Re-export individual state datasets
export {
  ANDHRA_PRADESH_PINCODES,
  TELANGANA_PINCODES,
  TAMIL_NADU_PINCODES,
} from './pincodes/index';

// PIN facts for display
export const PIN_FACTS = [
  "India has over 155,000 PIN codes covering villages, towns, and cities",
  "PIN stands for 'Postal Index Number' and was introduced in 1972",
  "The first digit represents the zone, and the second digit the sub-zone",
  "Each PIN code serves an average of 5-6 post offices",
  "PIN codes starting with 1 cover Delhi, Haryana, Punjab, HP, and J&K",
];
