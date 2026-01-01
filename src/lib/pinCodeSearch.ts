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
  'peta': ['padu'],
  'wada': ['vada', 'wadi'],
  'gaon': ['goan', 'gaav'],
  'pet': ['peth'],
  'ganj': ['gunj'],
};

// Build indexes for faster search
let villageIndex: Map<string, ExtendedPinCodeData[]>;
let localityIndex: Map<string, ExtendedPinCodeData[]>;
let districtIndex: Map<string, ExtendedPinCodeData[]>;
let talukIndex: Map<string, ExtendedPinCodeData[]>;
let pincodeIndex: Map<string, ExtendedPinCodeData>;

function buildIndexes() {
  if (villageIndex) return; // Already built
  
  villageIndex = new Map();
  localityIndex = new Map();
  districtIndex = new Map();
  talukIndex = new Map();
  pincodeIndex = new Map();
  
  for (const entry of EXTENDED_PIN_DATABASE) {
    // Index by pincode
    pincodeIndex.set(entry.pincode, entry);
    
    // Index by area/village (normalized)
    const areaKey = normalizeString(entry.area);
    if (!villageIndex.has(areaKey)) {
      villageIndex.set(areaKey, []);
    }
    villageIndex.get(areaKey)!.push(entry);
    
    // Index by post office name
    const poKey = normalizeString(entry.postOffice.replace(/ (SO|BO|HO|GPO)$/, ''));
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
    
    // Index by taluk
    if (entry.taluk) {
      const talukKey = normalizeString(entry.taluk);
      if (!talukIndex.has(talukKey)) {
        talukIndex.set(talukKey, []);
      }
      talukIndex.get(talukKey)!.push(entry);
    }
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

// Main search function with multi-level matching
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
  
  const normalizedQuery = normalizeString(query);
  const results: SearchResult[] = [];
  const seenPincodes = new Set<string>();
  
  // If query is a pincode (6 digits)
  if (/^\d{6}$/.test(query)) {
    const exactMatch = pincodeIndex.get(query);
    if (exactMatch) {
      results.push({
        data: exactMatch,
        score: 100,
        matchType: 'exact',
        matchedField: 'pincode'
      });
      seenPincodes.add(query);
    }
    
    // Find nearby pincodes
    if (includeNearby) {
      const prefix = query.substring(0, 3);
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
      if (!seenPincodes.has(data.pincode)) {
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
      if (!seenPincodes.has(data.pincode)) {
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
  
  // Priority 3: Exact taluk/mandal match
  if (talukIndex.has(normalizedQuery)) {
    for (const data of talukIndex.get(normalizedQuery)!) {
      if (!seenPincodes.has(data.pincode)) {
        results.push({
          data,
          score: 90,
          matchType: 'exact',
          matchedField: 'taluk'
        });
        seenPincodes.add(data.pincode);
      }
    }
  }
  
  // Priority 4: Exact district match
  if (districtIndex.has(normalizedQuery)) {
    for (const data of districtIndex.get(normalizedQuery)!) {
      if (!seenPincodes.has(data.pincode)) {
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
        if (!seenPincodes.has(data.pincode)) {
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
  
  for (const [key, dataList] of talukIndex.entries()) {
    if (key.startsWith(normalizedQuery) && key !== normalizedQuery) {
      for (const data of dataList) {
        if (!seenPincodes.has(data.pincode)) {
          results.push({
            data,
            score: 75,
            matchType: 'startsWith',
            matchedField: 'taluk'
          });
          seenPincodes.add(data.pincode);
        }
      }
    }
  }
  
  // Priority 6: Includes matching
  for (const [key, dataList] of villageIndex.entries()) {
    if (key.includes(normalizedQuery) && !key.startsWith(normalizedQuery)) {
      for (const data of dataList) {
        if (!seenPincodes.has(data.pincode)) {
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
  
  // Priority 7: Phonetic matching
  if (results.length < limit) {
    const phoneticVariations = generatePhoneticVariations(query);
    
    for (const variation of phoneticVariations) {
      if (variation === normalizedQuery) continue;
      
      // Check village index
      if (villageIndex.has(variation)) {
        for (const data of villageIndex.get(variation)!) {
          if (!seenPincodes.has(data.pincode)) {
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
      
      // Check taluk index
      if (talukIndex.has(variation)) {
        for (const data of talukIndex.get(variation)!) {
          if (!seenPincodes.has(data.pincode)) {
            results.push({
              data,
              score: 60,
              matchType: 'phonetic',
              matchedField: 'taluk'
            });
            seenPincodes.add(data.pincode);
          }
        }
      }
    }
  }
  
  // Priority 8: Fuzzy matching (Levenshtein distance)
  if (results.length < limit && normalizedQuery.length >= 3) {
    for (const [key, dataList] of villageIndex.entries()) {
      if (seenPincodes.size >= limit) break;
      
      const distance = levenshteinDistance(normalizedQuery, key);
      if (distance <= fuzzyThreshold && distance > 0) {
        for (const data of dataList) {
          if (!seenPincodes.has(data.pincode)) {
            results.push({
              data,
              score: Math.max(40, 60 - distance * 10),
              matchType: 'fuzzy',
              matchedField: 'village'
            });
            seenPincodes.add(data.pincode);
          }
        }
      }
    }
    
    for (const [key, dataList] of talukIndex.entries()) {
      if (seenPincodes.size >= limit) break;
      
      const distance = levenshteinDistance(normalizedQuery, key);
      if (distance <= fuzzyThreshold && distance > 0) {
        for (const data of dataList) {
          if (!seenPincodes.has(data.pincode)) {
            results.push({
              data,
              score: Math.max(35, 55 - distance * 10),
              matchType: 'fuzzy',
              matchedField: 'taluk'
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
        message = "Showing exact match and nearby areas";
      }
    } else if (results.length === 0 || (results.length > 0 && results[0].score < 80)) {
      message = "Showing similar matches. Try a more specific search.";
    }
  }
  
  // If no results found, provide fallback message
  if (results.length === 0) {
    // Try to find by first few characters in any field
    const fallbackResults: SearchResult[] = [];
    
    for (const entry of EXTENDED_PIN_DATABASE) {
      const searchFields = [
        entry.area,
        entry.postOffice,
        entry.district,
        entry.taluk || '',
        entry.state
      ].map(f => normalizeString(f));
      
      for (const field of searchFields) {
        if (field.includes(normalizedQuery.substring(0, 3))) {
          if (!seenPincodes.has(entry.pincode)) {
            fallbackResults.push({
              data: entry,
              score: 20,
              matchType: 'includes',
              matchedField: 'partial'
            });
            seenPincodes.add(entry.pincode);
            break;
          }
        }
      }
      
      if (fallbackResults.length >= 10) break;
    }
    
    if (fallbackResults.length > 0) {
      return {
        results: fallbackResults,
        message: "No exact match found. Showing partial matches."
      };
    }
    
    return {
      results: [],
      message: "No results found. Please check the spelling or try a different search term."
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

// Get all entries for a taluk
export function getByTaluk(taluk: string): ExtendedPinCodeData[] {
  buildIndexes();
  return talukIndex.get(normalizeString(taluk)) || [];
}

// Get unique states
export function getUniqueStates(): string[] {
  return [...new Set(EXTENDED_PIN_DATABASE.map(d => d.state))].sort();
}

// Get districts for a state
export function getDistrictsForState(state: string): string[] {
  const stateData = EXTENDED_PIN_DATABASE.filter(d => 
    normalizeString(d.state) === normalizeString(state)
  );
  return [...new Set(stateData.map(d => d.district))].sort();
}

// Get taluks for a district
export function getTaluksForDistrict(state: string, district: string): string[] {
  const districtData = EXTENDED_PIN_DATABASE.filter(d => 
    normalizeString(d.state) === normalizeString(state) &&
    normalizeString(d.district) === normalizeString(district) &&
    d.taluk
  );
  return [...new Set(districtData.map(d => d.taluk!))].sort();
}
