// Advanced PIN Code Search with Fuzzy Matching and Multi-level Search
import { EXTENDED_PIN_DATABASE, ExtendedPinCodeData } from "@/data/indianPinCodesExtended";

export interface SearchResult {
  data: ExtendedPinCodeData;
  score: number;
  matchType: 'exact' | 'startsWith' | 'includes' | 'fuzzy' | 'phonetic';
  matchedField: string;
}

// Phonetic mapping for common Indian name variations
const PHONETIC_MAP: Record<string, string[]> = {
  'aa': ['a', 'e'],
  'ch': ['c', 'chh'],
  'kh': ['k', 'c'],
  'ph': ['f'],
  'th': ['t'],
  'dh': ['d'],
  'bh': ['b'],
  'sh': ['s'],
  'v': ['w', 'b'],
  'j': ['g', 'z'],
  'ee': ['i', 'y'],
  'oo': ['u'],
  'ai': ['ay', 'ei'],
  'au': ['ou', 'aw'],
  'ur': ['or', 'ar'],
  'er': ['ar', 'ir'],
  'bad': ['wad', 'vad'],
  'abad': ['avad'],
  'nagar': ['nagara', 'nager'],
  'palli': ['pally', 'palle'],
  'puram': ['pura'],
  'guda': ['kuda', 'goda'],
  'peta': ['padu', 'pet'],
  'wada': ['vada', 'wadi'],
  'gaon': ['goan', 'gaav'],
  'pet': ['peth'],
  'ganj': ['gunj'],
};

// Build indexes for faster search
let villageIndex: Map<string, ExtendedPinCodeData[]>;
let localityIndex: Map<string, ExtendedPinCodeData[]>;
let districtIndex: Map<string, ExtendedPinCodeData[]>;
let mandalIndex: Map<string, ExtendedPinCodeData[]>;
let pincodeIndex: Map<string, ExtendedPinCodeData>;
let stateIndex: Map<string, ExtendedPinCodeData[]>;

function buildIndexes() {
  if (villageIndex) return; // Already built
  
  villageIndex = new Map();
  localityIndex = new Map();
  districtIndex = new Map();
  mandalIndex = new Map();
  pincodeIndex = new Map();
  stateIndex = new Map();
  
  for (const entry of EXTENDED_PIN_DATABASE) {
    // Index by pincode
    pincodeIndex.set(entry.pincode, entry);
    
    // Index by village (normalized)
    const villageKey = normalizeString(entry.village);
    if (!villageIndex.has(villageKey)) {
      villageIndex.set(villageKey, []);
    }
    villageIndex.get(villageKey)!.push(entry);
    
    // Index by post office name
    const poKey = normalizeString(entry.post_office.replace(/ (SO|BO|HO|GPO)$/, ''));
    if (!localityIndex.has(poKey)) {
      localityIndex.set(poKey, []);
    }
    localityIndex.get(poKey)!.push(entry);
    
    // Index by district
    const distKey = normalizeString(entry.district);
    if (!districtIndex.has(distKey)) {
      districtIndex.set(distKey, []);
    }
    districtIndex.get(distKey)!.push(entry);
    
    // Index by mandal
    if (entry.mandal) {
      const mandalKey = normalizeString(entry.mandal);
      if (!mandalIndex.has(mandalKey)) {
        mandalIndex.set(mandalKey, []);
      }
      mandalIndex.get(mandalKey)!.push(entry);
    }
    
    // Index by state
    const stateKey = normalizeString(entry.state);
    if (!stateIndex.has(stateKey)) {
      stateIndex.set(stateKey, []);
    }
    stateIndex.get(stateKey)!.push(entry);
  }
}

function normalizeString(str: string): string {
  return str.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

// Calculate Levenshtein distance for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

// Generate phonetic variations
function generatePhoneticVariations(query: string): string[] {
  const normalized = normalizeString(query);
  const variations = new Set<string>([normalized]);
  
  // Apply phonetic transformations
  for (const [pattern, replacements] of Object.entries(PHONETIC_MAP)) {
    if (normalized.includes(pattern)) {
      for (const replacement of replacements) {
        variations.add(normalized.replace(new RegExp(pattern, 'g'), replacement));
      }
    }
    // Reverse mapping
    for (const replacement of replacements) {
      if (normalized.includes(replacement)) {
        variations.add(normalized.replace(new RegExp(replacement, 'g'), pattern));
      }
    }
  }
  
  // Common prefix/suffix handling
  if (normalized.startsWith('chinna') || normalized.startsWith('china')) {
    variations.add(normalized.replace(/^chinna?/, 'pedda'));
    variations.add(normalized.replace(/^chinna?/, 'peda'));
  }
  if (normalized.startsWith('pedda') || normalized.startsWith('peda')) {
    variations.add(normalized.replace(/^pedda?/, 'chinna'));
  }
  
  return Array.from(variations);
}

// Parse multi-part query like "Sullurpeta, Tirupati district, Andhra Pradesh"
function parseMultiPartQuery(query: string): { location: string; district: string | null; state: string | null } {
  // Split by comma
  const parts = query.split(',').map(p => p.trim().toLowerCase());
  
  let location = '';
  let district: string | null = null;
  let state: string | null = null;
  
  for (const part of parts) {
    // Check if part contains "district"
    if (part.includes('district')) {
      district = normalizeString(part.replace(/district/gi, '').trim());
    }
    // Check for state names
    else if (
      part.includes('andhra') || part.includes('telangana') || part.includes('tamil') ||
      part.includes('karnataka') || part.includes('kerala') || part.includes('maharashtra') ||
      part.includes('delhi') || part.includes('gujarat') || part.includes('rajasthan') ||
      part.includes('punjab') || part.includes('haryana') || part.includes('bihar') ||
      part.includes('west bengal') || part.includes('odisha') || part.includes('assam') ||
      part.includes('madhya pradesh') || part.includes('uttar pradesh') ||
      part.includes('ap') || part.includes('ts') || part.includes('tn') ||
      part.includes('ka') || part.includes('kl') || part.includes('mh')
    ) {
      state = normalizeString(part);
    }
    // Otherwise it's a location
    else if (!location) {
      location = part;
    }
  }
  
  // If only one part and no comma, use the entire query as location
  if (!location && parts.length === 1) {
    location = parts[0];
  }
  
  return { location, district, state };
}

// Main search function with multi-level matching - NO WRONG FALLBACKS
export function advancedSearchPinCodes(
  query: string,
  options: {
    limit?: number;
    includeNearby?: boolean;
    fuzzyThreshold?: number;
  } = {}
): { results: SearchResult[]; message?: string; nearbyResults?: SearchResult[] } {
  const { limit = 50, includeNearby = true, fuzzyThreshold = 3 } = options;
  
  buildIndexes();
  
  // Parse multi-part query
  const { location, district: queryDistrict, state: queryState } = parseMultiPartQuery(query);
  const normalizedQuery = normalizeString(location || query);
  
  const results: SearchResult[] = [];
  const seenPincodes = new Set<string>();
  
  // Helper to check if entry matches district/state filters
  const matchesFilters = (entry: ExtendedPinCodeData): boolean => {
    if (queryDistrict && !normalizeString(entry.district).includes(queryDistrict)) {
      return false;
    }
    if (queryState && !normalizeString(entry.state).includes(queryState)) {
      return false;
    }
    return true;
  };
  
  // If query is a pincode (6 digits)
  if (/^\d{6}$/.test(query.trim())) {
    const exactMatch = pincodeIndex.get(query.trim());
    if (exactMatch) {
      results.push({
        data: exactMatch,
        score: 100,
        matchType: 'exact',
        matchedField: 'pincode'
      });
      seenPincodes.add(query.trim());
    }
    
    // Find nearby pincodes (same prefix)
    if (includeNearby) {
      const prefix = query.trim().substring(0, 3);
      for (const [pincode, data] of pincodeIndex.entries()) {
        if (pincode.startsWith(prefix) && !seenPincodes.has(pincode)) {
          results.push({
            data,
            score: 50,
            matchType: 'startsWith',
            matchedField: 'pincode'
          });
          seenPincodes.add(pincode);
        }
      }
    }
    
    return {
      results: results.slice(0, limit),
      message: results.length > 1 ? "Showing exact match and nearby areas" : undefined
    };
  }
  
  // Priority 1: Exact village/area match
  if (villageIndex.has(normalizedQuery)) {
    for (const data of villageIndex.get(normalizedQuery)!) {
      if (!seenPincodes.has(data.pincode) && matchesFilters(data)) {
        results.push({
          data,
          score: 100,
          matchType: 'exact',
          matchedField: 'village'
        });
        seenPincodes.add(data.pincode);
      }
    }
  }
  
  // Priority 2: Exact locality/post office match
  if (localityIndex.has(normalizedQuery)) {
    for (const data of localityIndex.get(normalizedQuery)!) {
      if (!seenPincodes.has(data.pincode) && matchesFilters(data)) {
        results.push({
          data,
          score: 95,
          matchType: 'exact',
          matchedField: 'locality'
        });
        seenPincodes.add(data.pincode);
      }
    }
  }
  
  // Priority 3: Exact mandal match
  if (mandalIndex.has(normalizedQuery)) {
    for (const data of mandalIndex.get(normalizedQuery)!) {
      if (!seenPincodes.has(data.pincode) && matchesFilters(data)) {
        results.push({
          data,
          score: 90,
          matchType: 'exact',
          matchedField: 'mandal'
        });
        seenPincodes.add(data.pincode);
      }
    }
  }
  
  // Priority 4: Exact district match
  if (districtIndex.has(normalizedQuery)) {
    for (const data of districtIndex.get(normalizedQuery)!) {
      if (!seenPincodes.has(data.pincode) && matchesFilters(data)) {
        results.push({
          data,
          score: 85,
          matchType: 'exact',
          matchedField: 'district'
        });
        seenPincodes.add(data.pincode);
      }
    }
  }
  
  // Priority 5: StartsWith matching
  for (const [key, dataList] of villageIndex.entries()) {
    if (key.startsWith(normalizedQuery) && key !== normalizedQuery) {
      for (const data of dataList) {
        if (!seenPincodes.has(data.pincode) && matchesFilters(data)) {
          results.push({
            data,
            score: 80,
            matchType: 'startsWith',
            matchedField: 'village'
          });
          seenPincodes.add(data.pincode);
        }
      }
    }
  }
  
  for (const [key, dataList] of mandalIndex.entries()) {
    if (key.startsWith(normalizedQuery) && key !== normalizedQuery) {
      for (const data of dataList) {
        if (!seenPincodes.has(data.pincode) && matchesFilters(data)) {
          results.push({
            data,
            score: 75,
            matchType: 'startsWith',
            matchedField: 'mandal'
          });
          seenPincodes.add(data.pincode);
        }
      }
    }
  }
  
// Priority 6: Includes matching - query must be contained in the key
for (const [key, dataList] of villageIndex.entries()) {
  if (key.includes(normalizedQuery) && !key.startsWith(normalizedQuery)) {
    for (const data of dataList) {
      if (!seenPincodes.has(data.pincode) && matchesFilters(data)) {
        results.push({
          data,
          score: 70,
          matchType: 'includes',
          matchedField: 'village'
        });
        seenPincodes.add(data.pincode);
      }
    }
  }
}

// Also check post office names for includes
for (const [key, dataList] of localityIndex.entries()) {
  if (key.includes(normalizedQuery) && !key.startsWith(normalizedQuery)) {
    for (const data of dataList) {
      if (!seenPincodes.has(data.pincode) && matchesFilters(data)) {
        results.push({
          data,
          score: 65,
          matchType: 'includes',
          matchedField: 'locality'
        });
        seenPincodes.add(data.pincode);
      }
    }
  }
}
  
  // Priority 7: Phonetic matching
  if (results.length < limit) {
    const phoneticVariations = generatePhoneticVariations(location || query);
    
    for (const variation of phoneticVariations) {
      if (variation === normalizedQuery) continue;
      
      // Check village index
      if (villageIndex.has(variation)) {
        for (const data of villageIndex.get(variation)!) {
          if (!seenPincodes.has(data.pincode) && matchesFilters(data)) {
            results.push({
              data,
              score: 65,
              matchType: 'phonetic',
              matchedField: 'village'
            });
            seenPincodes.add(data.pincode);
          }
        }
      }
      
      // Check mandal index
      if (mandalIndex.has(variation)) {
        for (const data of mandalIndex.get(variation)!) {
          if (!seenPincodes.has(data.pincode) && matchesFilters(data)) {
            results.push({
              data,
              score: 60,
              matchType: 'phonetic',
              matchedField: 'mandal'
            });
            seenPincodes.add(data.pincode);
          }
        }
      }
    }
  }
  
// Priority 8: Fuzzy matching (Levenshtein distance) - STRICT MODE
// Only use fuzzy matching if we have fewer than 5 results AND query length is sufficient
// Fuzzy match must also have the query as a substring OR share significant prefix
if (results.length < 5 && normalizedQuery.length >= 4) {
  // Calculate a dynamic threshold: stricter for short queries
  const dynamicThreshold = Math.min(fuzzyThreshold, Math.floor(normalizedQuery.length / 3));
  
  for (const [key, dataList] of villageIndex.entries()) {
    if (seenPincodes.size >= limit) break;
    
    // Only consider fuzzy matches if:
    // 1. The key starts with at least first 2 chars of query, OR
    // 2. The query starts with at least first 2 chars of key
    const sharePrefix = key.startsWith(normalizedQuery.substring(0, 2)) || 
                        normalizedQuery.startsWith(key.substring(0, 2));
    
    if (!sharePrefix) continue;
    
    const distance = levenshteinDistance(normalizedQuery, key);
    if (distance <= dynamicThreshold && distance > 0) {
      for (const data of dataList) {
        if (!seenPincodes.has(data.pincode) && matchesFilters(data)) {
          results.push({
            data,
            score: Math.max(40, 60 - distance * 15),
            matchType: 'fuzzy',
            matchedField: 'village'
          });
          seenPincodes.add(data.pincode);
        }
      }
    }
  }
  
  for (const [key, dataList] of mandalIndex.entries()) {
    if (seenPincodes.size >= limit) break;
    
    const sharePrefix = key.startsWith(normalizedQuery.substring(0, 2)) || 
                        normalizedQuery.startsWith(key.substring(0, 2));
    
    if (!sharePrefix) continue;
    
    const distance = levenshteinDistance(normalizedQuery, key);
    if (distance <= dynamicThreshold && distance > 0) {
      for (const data of dataList) {
        if (!seenPincodes.has(data.pincode) && matchesFilters(data)) {
          results.push({
            data,
            score: Math.max(35, 55 - distance * 15),
            matchType: 'fuzzy',
            matchedField: 'mandal'
          });
          seenPincodes.add(data.pincode);
        }
      }
    }
  }
}
  
  // Sort by score
  results.sort((a, b) => b.score - a.score);
  
  // Get nearby results if exact matches found
  let nearbyResults: SearchResult[] | undefined;
  let message: string | undefined;
  
  if (results.length > 0 && includeNearby) {
    const topResult = results[0];
    
    if (topResult.matchType === 'exact' && topResult.matchedField === 'village') {
      // Find nearby villages in same taluk/district
      const sameDistrict = EXTENDED_PIN_DATABASE.filter(
        d => d.district === topResult.data.district && 
             d.pincode !== topResult.data.pincode &&
             !seenPincodes.has(d.pincode)
      ).slice(0, 10);
      
      if (sameDistrict.length > 0) {
        nearbyResults = sameDistrict.map(d => ({
          data: d,
          score: 40,
          matchType: 'includes' as const,
          matchedField: 'nearby'
        }));
        message = `Found "${topResult.data.village}" - Showing nearby areas in ${topResult.data.district}`;
      }
    } else if (results[0].score < 80) {
      message = "Showing similar matches. Try a more specific search.";
    }
  }
  
  // IMPORTANT: If no results found, DO NOT fall back to random cities
  // Instead return empty with helpful message
  if (results.length === 0) {
    // Only search within the specific district/state if provided
    if (queryDistrict || queryState) {
      const filteredResults: SearchResult[] = [];
      
      for (const entry of EXTENDED_PIN_DATABASE) {
        if (matchesFilters(entry) && !seenPincodes.has(entry.pincode)) {
          // Check if any field contains part of the query
          const searchFields = [
            normalizeString(entry.village),
            normalizeString(entry.post_office),
            normalizeString(entry.mandal || ''),
          ];
          
          for (const field of searchFields) {
            if (field.includes(normalizedQuery.substring(0, 3)) || normalizedQuery.includes(field.substring(0, 3))) {
              filteredResults.push({
                data: entry,
                score: 30,
                matchType: 'includes',
                matchedField: 'partial'
              });
              seenPincodes.add(entry.pincode);
              break;
            }
          }
        }
        
        if (filteredResults.length >= 10) break;
      }
      
      if (filteredResults.length > 0) {
        return {
          results: filteredResults,
          message: `No exact match for "${location || query}". Showing other areas in the same region.`
        };
      }
    }
    
    return {
      results: [],
      message: `No results found for "${query}". Please check the spelling or try a different search term. The location may not be in our database yet.`
    };
  }
  
  return {
    results: results.slice(0, limit),
    message,
    nearbyResults
  };
}

// Quick lookup by pincode
export function lookupByPincode(pincode: string): ExtendedPinCodeData | null {
  buildIndexes();
  return pincodeIndex.get(pincode) || null;
}

// Get all entries for a district
export function getByDistrict(district: string): ExtendedPinCodeData[] {
  buildIndexes();
  return districtIndex.get(normalizeString(district)) || [];
}

// Get all entries for a mandal
export function getByMandal(mandal: string): ExtendedPinCodeData[] {
  buildIndexes();
  return mandalIndex.get(normalizeString(mandal)) || [];
}

// Get unique states from EXTENDED database
export function getUniqueStates(): string[] {
  return [...new Set(EXTENDED_PIN_DATABASE.map(d => d.state))].sort();
}

// Get districts for a state from EXTENDED database
export function getDistrictsForState(state: string): string[] {
  const stateData = EXTENDED_PIN_DATABASE.filter(d => 
    normalizeString(d.state) === normalizeString(state)
  );
  return [...new Set(stateData.map(d => d.district))].sort();
}

// Get mandals for a district from EXTENDED database
export function getMandalsForDistrict(state: string, district: string): string[] {
  const districtData = EXTENDED_PIN_DATABASE.filter(d => 
    normalizeString(d.state) === normalizeString(state) &&
    normalizeString(d.district) === normalizeString(district) &&
    d.mandal
  );
  return [...new Set(districtData.map(d => d.mandal!))].sort();
}

// Get all villages for a district from EXTENDED database
export function getVillagesForDistrict(state: string, district: string): string[] {
  const districtData = EXTENDED_PIN_DATABASE.filter(d => 
    normalizeString(d.state) === normalizeString(state) &&
    normalizeString(d.district) === normalizeString(district)
  );
  return [...new Set(districtData.map(d => d.village))].sort();
}

// Get villages for a specific mandal
export function getVillagesForMandal(state: string, district: string, mandal: string): string[] {
  const mandalData = EXTENDED_PIN_DATABASE.filter(d => 
    normalizeString(d.state) === normalizeString(state) &&
    normalizeString(d.district) === normalizeString(district) &&
    d.mandal && normalizeString(d.mandal) === normalizeString(mandal)
  );
  return [...new Set(mandalData.map(d => d.village))].sort();
}

// Clean and normalize user input - handles commas, multiple spaces, etc.
export function cleanUserInput(input: string): string {
  return input
    .toLowerCase()
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Search villages with autocomplete - works globally or within state/district filters
export function searchVillagesAutocomplete(
  input: string,
  state?: string,
  district?: string,
  mandal?: string,
  limit: number = 20
): ExtendedPinCodeData[] {
  if (input.length < 2) return [];
  
  const cleanedInput = cleanUserInput(input);
  const normalizedInput = normalizeString(cleanedInput);
  
  return EXTENDED_PIN_DATABASE.filter(d => {
    // If state is provided, must match state
    if (state && normalizeString(d.state) !== normalizeString(state)) return false;
    
    // If district is provided, must match district
    if (district && normalizeString(d.district) !== normalizeString(district)) return false;
    
    // If mandal is selected, must match mandal
    if (mandal && d.mandal && normalizeString(d.mandal) !== normalizeString(mandal)) return false;
    
    // Match against village, post_office, mandal, or district
    const normalizedVillage = normalizeString(d.village);
    const normalizedPO = normalizeString(d.post_office);
    const normalizedMandal = d.mandal ? normalizeString(d.mandal) : '';
    const normalizedDistrict = normalizeString(d.district);
    
    return normalizedVillage === normalizedInput || 
           normalizedVillage.startsWith(normalizedInput) ||
           normalizedVillage.includes(normalizedInput) ||
           normalizedPO.startsWith(normalizedInput) ||
           normalizedPO.includes(normalizedInput) ||
           normalizedMandal.startsWith(normalizedInput) ||
           normalizedDistrict.startsWith(normalizedInput);
  })
  .sort((a, b) => {
    // Prioritize exact village matches, then startsWith, then includes
    const aExact = normalizeString(a.village) === normalizedInput;
    const bExact = normalizeString(b.village) === normalizedInput;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    
    const aStarts = normalizeString(a.village).startsWith(normalizedInput);
    const bStarts = normalizeString(b.village).startsWith(normalizedInput);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    
    return a.village.localeCompare(b.village);
  })
  .slice(0, limit);
}

// Get closest village suggestions when no exact match found (fuzzy matching)
export function getClosestVillageSuggestions(
  input: string,
  limit: number = 5
): ExtendedPinCodeData[] {
  if (input.length < 2) return [];
  
  buildIndexes();
  
  const cleanedInput = cleanUserInput(input);
  const normalizedInput = normalizeString(cleanedInput);
  
  const suggestions: { data: ExtendedPinCodeData; distance: number }[] = [];
  const seenPincodes = new Set<string>();
  
  // First try phonetic variations
  const phoneticVariations = generatePhoneticVariations(cleanedInput);
  
  for (const variation of phoneticVariations) {
    if (villageIndex.has(variation)) {
      for (const data of villageIndex.get(variation)!) {
        if (!seenPincodes.has(data.pincode)) {
          suggestions.push({ data, distance: 0 });
          seenPincodes.add(data.pincode);
        }
      }
    }
  }
  
// Then try fuzzy matching with Levenshtein distance - with prefix check
if (suggestions.length < limit) {
  for (const [key, dataList] of villageIndex.entries()) {
    if (seenPincodes.size >= limit * 2) break;
    
    // Must share at least 2 character prefix for fuzzy matching
    const sharePrefix = key.startsWith(normalizedInput.substring(0, 2)) || 
                        normalizedInput.startsWith(key.substring(0, 2)) ||
                        key.includes(normalizedInput.substring(0, 3));
    
    if (!sharePrefix) continue;
    
    const distance = levenshteinDistance(normalizedInput, key);
    // Stricter threshold for suggestions
    const threshold = Math.min(2, Math.floor(normalizedInput.length / 3));
    
    if (distance <= threshold && distance > 0) {
      for (const data of dataList) {
        if (!seenPincodes.has(data.pincode)) {
          suggestions.push({ data, distance });
          seenPincodes.add(data.pincode);
        }
      }
    }
  }
}
  
  // Sort by distance (closest first)
  suggestions.sort((a, b) => a.distance - b.distance);
  
  return suggestions.slice(0, limit).map(s => s.data);
}

// Format display string short: Village – Mandal – District – Pincode
export function formatPinCodeDisplayShort(data: ExtendedPinCodeData): string {
  const parts = [data.village];
  if (data.mandal) parts.push(data.mandal);
  parts.push(data.district);
  return `${parts.join(' – ')} – ${data.pincode}`;
}

// Format display string: Village, Mandal, District, State – Pincode
export function formatPinCodeDisplay(data: ExtendedPinCodeData): string {
  const parts = [data.village];
  if (data.mandal) parts.push(data.mandal);
  parts.push(data.district, data.state);
  return `${parts.join(', ')} – ${data.pincode}`;
}
