// Indian PIN Code Data - Major cities and areas
export interface PinCodeData {
  pincode: string;
  state: string;
  district: string;
  area: string;
  postOffice: string;
}

export const STATES_DATA: Record<string, { districts: Record<string, string[]> }> = {
  "Andhra Pradesh": {
    districts: {
      "Visakhapatnam": ["Visakhapatnam", "Gajuwaka", "Anakapalli", "Bheemunipatnam"],
      "Vijayawada": ["Vijayawada", "Machilipatnam", "Gudivada", "Nuzvid"],
      "Guntur": ["Guntur", "Tenali", "Mangalagiri", "Narasaraopet"],
      "Tirupati": ["Tirupati", "Nellore", "Chittoor", "Kadapa"],
    }
  },
  "Telangana": {
    districts: {
      "Hyderabad": ["Secunderabad", "Kukatpally", "Gachibowli", "Madhapur", "Begumpet", "Ameerpet", "Jubilee Hills", "Banjara Hills", "HITEC City", "Miyapur"],
      "Rangareddy": ["LB Nagar", "Shamshabad", "Mehdipatnam", "Rajendranagar"],
      "Warangal": ["Warangal", "Kazipet", "Hanamkonda", "Jangaon"],
      "Nizamabad": ["Nizamabad", "Bodhan", "Armoor", "Kamareddy"],
    }
  },
  "Maharashtra": {
    districts: {
      "Mumbai": ["Andheri", "Borivali", "Goregaon", "Malad", "Bandra", "Powai", "Thane", "Navi Mumbai", "Colaba", "Dadar"],
      "Pune": ["Pune", "Pimpri", "Chinchwad", "Hadapsar", "Kothrud", "Hinjewadi"],
      "Nagpur": ["Nagpur", "Kamptee", "Hingna", "Koradi"],
      "Nashik": ["Nashik", "Trimbak", "Sinnar", "Malegaon"],
    }
  },
  "Karnataka": {
    districts: {
      "Bengaluru": ["Koramangala", "Whitefield", "Electronic City", "Indiranagar", "Jayanagar", "Marathahalli", "HSR Layout", "BTM Layout", "Malleshwaram", "Yelahanka"],
      "Mysuru": ["Mysuru", "Chamundi", "Vijayanagar", "Nazarbad"],
      "Hubli": ["Hubli", "Dharwad", "Belgaum", "Gadag"],
      "Mangaluru": ["Mangaluru", "Udupi", "Puttur", "Bantwal"],
    }
  },
  "Tamil Nadu": {
    districts: {
      "Chennai": ["Chennai", "T Nagar", "Anna Nagar", "Adyar", "Velachery", "Tambaram", "Chromepet", "Porur", "Guindy", "Mylapore"],
      "Coimbatore": ["Coimbatore", "Saravanampatti", "Gandhipuram", "Peelamedu"],
      "Madurai": ["Madurai", "Thirunagar", "Tallakulam", "Vilangudi"],
      "Tiruchirappalli": ["Tiruchirappalli", "Srirangam", "Thillainagar", "KK Nagar"],
    }
  },
  "Kerala": {
    districts: {
      "Thiruvananthapuram": ["Thiruvananthapuram", "Technopark", "Kazhakkoottam", "Kovalam"],
      "Kochi": ["Kochi", "Kakkanad", "Edappally", "Kalamassery", "Vyttila"],
      "Kozhikode": ["Kozhikode", "Mavoor", "Feroke", "Beypore"],
      "Thrissur": ["Thrissur", "Guruvayoor", "Chalakudy", "Kodungallur"],
    }
  },
  "Gujarat": {
    districts: {
      "Ahmedabad": ["Ahmedabad", "SG Highway", "Bopal", "Navrangpura", "Satellite", "Vastrapur"],
      "Surat": ["Surat", "Vesu", "Adajan", "Katargam"],
      "Vadodara": ["Vadodara", "Alkapuri", "Gotri", "Fatehgunj"],
      "Rajkot": ["Rajkot", "Mavdi", "Kalavad Road", "University Road"],
    }
  },
  "Rajasthan": {
    districts: {
      "Jaipur": ["Jaipur", "Malviya Nagar", "Vaishali Nagar", "Mansarovar", "C-Scheme", "Pratap Nagar"],
      "Jodhpur": ["Jodhpur", "Pal", "Sardarpura", "Mandore"],
      "Udaipur": ["Udaipur", "Hiran Magri", "Pratap Nagar", "Fatehsagar"],
      "Kota": ["Kota", "Talwandi", "Mahaveer Nagar", "DCM"],
    }
  },
  "West Bengal": {
    districts: {
      "Kolkata": ["Kolkata", "Salt Lake", "Park Street", "Howrah", "Dum Dum", "New Town", "Rajarhat", "Alipore"],
      "Howrah": ["Howrah", "Shibpur", "Belur", "Liluah"],
      "Darjeeling": ["Darjeeling", "Kurseong", "Siliguri", "Kalimpong"],
      "Asansol": ["Asansol", "Durgapur", "Burnpur", "Raniganj"],
    }
  },
  "Delhi": {
    districts: {
      "New Delhi": ["Connaught Place", "Saket", "Vasant Kunj", "Dwarka", "Janakpuri", "Rohini", "Pitampura", "Lajpat Nagar", "South Extension", "Karol Bagh"],
      "Central Delhi": ["Chandni Chowk", "Paharganj", "Kashmere Gate", "Civil Lines"],
      "South Delhi": ["Defence Colony", "Greater Kailash", "Nehru Place", "Hauz Khas"],
      "North Delhi": ["Model Town", "Shalimar Bagh", "Burari", "Narela"],
    }
  },
  "Uttar Pradesh": {
    districts: {
      "Lucknow": ["Lucknow", "Gomti Nagar", "Hazratganj", "Aliganj", "Indira Nagar"],
      "Noida": ["Noida", "Greater Noida", "Sector 62", "Sector 18"],
      "Varanasi": ["Varanasi", "Sigra", "Lanka", "Godowlia"],
      "Kanpur": ["Kanpur", "Kakadeo", "Swaroop Nagar", "Kidwai Nagar"],
    }
  },
  "Punjab": {
    districts: {
      "Chandigarh": ["Chandigarh", "Sector 17", "Sector 22", "Sector 35"],
      "Amritsar": ["Amritsar", "Ranjit Avenue", "Lawrence Road", "Mall Road"],
      "Ludhiana": ["Ludhiana", "Model Town", "Civil Lines", "Dugri"],
      "Jalandhar": ["Jalandhar", "Model Town", "Nakodar Road", "Maqsudan"],
    }
  },
  "Madhya Pradesh": {
    districts: {
      "Bhopal": ["Bhopal", "MP Nagar", "Arera Colony", "Kolar Road", "Hoshangabad Road"],
      "Indore": ["Indore", "Vijay Nagar", "Palasia", "Rau", "MR 10"],
      "Gwalior": ["Gwalior", "City Center", "Morar", "Lashkar"],
      "Jabalpur": ["Jabalpur", "Wright Town", "Napier Town", "Civil Lines"],
    }
  },
};

// Generate random valid PIN code based on state/district patterns
const PIN_CODE_RANGES: Record<string, { start: number; end: number }> = {
  "Delhi": { start: 110001, end: 110097 },
  "Uttar Pradesh": { start: 201001, end: 285223 },
  "Rajasthan": { start: 301001, end: 345034 },
  "Gujarat": { start: 360001, end: 396590 },
  "Maharashtra": { start: 400001, end: 445401 },
  "Madhya Pradesh": { start: 450001, end: 488448 },
  "Karnataka": { start: 560001, end: 591346 },
  "Andhra Pradesh": { start: 500001, end: 535594 },
  "Telangana": { start: 500001, end: 509412 },
  "Tamil Nadu": { start: 600001, end: 643253 },
  "Kerala": { start: 670001, end: 695615 },
  "West Bengal": { start: 700001, end: 743711 },
  "Punjab": { start: 140001, end: 160104 },
};

// Sample PIN codes database for reverse lookup
export const PIN_DATABASE: PinCodeData[] = [
  // Telangana - Hyderabad
  { pincode: "500001", state: "Telangana", district: "Hyderabad", area: "Secunderabad", postOffice: "Secunderabad GPO" },
  { pincode: "500018", state: "Telangana", district: "Hyderabad", area: "Kukatpally", postOffice: "Kukatpally SO" },
  { pincode: "500032", state: "Telangana", district: "Hyderabad", area: "Jubilee Hills", postOffice: "Jubilee Hills SO" },
  { pincode: "500033", state: "Telangana", district: "Hyderabad", area: "Banjara Hills", postOffice: "Banjara Hills SO" },
  { pincode: "500034", state: "Telangana", district: "Hyderabad", area: "Ameerpet", postOffice: "Ameerpet SO" },
  { pincode: "500081", state: "Telangana", district: "Hyderabad", area: "Gachibowli", postOffice: "Gachibowli SO" },
  { pincode: "500084", state: "Telangana", district: "Hyderabad", area: "Madhapur", postOffice: "Madhapur SO" },
  { pincode: "500049", state: "Telangana", district: "Hyderabad", area: "HITEC City", postOffice: "Hitec City SO" },
  { pincode: "500090", state: "Telangana", district: "Hyderabad", area: "Miyapur", postOffice: "Miyapur SO" },
  { pincode: "500016", state: "Telangana", district: "Hyderabad", area: "Begumpet", postOffice: "Begumpet SO" },
  
  // Maharashtra - Mumbai
  { pincode: "400001", state: "Maharashtra", district: "Mumbai", area: "Mumbai GPO", postOffice: "Mumbai GPO" },
  { pincode: "400053", state: "Maharashtra", district: "Mumbai", area: "Andheri East", postOffice: "Andheri East SO" },
  { pincode: "400058", state: "Maharashtra", district: "Mumbai", area: "Andheri West", postOffice: "Andheri West SO" },
  { pincode: "400092", state: "Maharashtra", district: "Mumbai", area: "Borivali East", postOffice: "Borivali East SO" },
  { pincode: "400066", state: "Maharashtra", district: "Mumbai", area: "Goregaon East", postOffice: "Goregaon East SO" },
  { pincode: "400050", state: "Maharashtra", district: "Mumbai", area: "Bandra West", postOffice: "Bandra West SO" },
  { pincode: "400076", state: "Maharashtra", district: "Mumbai", area: "Powai", postOffice: "Powai SO" },
  { pincode: "400005", state: "Maharashtra", district: "Mumbai", area: "Colaba", postOffice: "Colaba SO" },
  { pincode: "400014", state: "Maharashtra", district: "Mumbai", area: "Dadar", postOffice: "Dadar SO" },
  
  // Karnataka - Bengaluru
  { pincode: "560001", state: "Karnataka", district: "Bengaluru", area: "MG Road", postOffice: "MG Road SO" },
  { pincode: "560034", state: "Karnataka", district: "Bengaluru", area: "Koramangala", postOffice: "Koramangala SO" },
  { pincode: "560066", state: "Karnataka", district: "Bengaluru", area: "Whitefield", postOffice: "Whitefield SO" },
  { pincode: "560100", state: "Karnataka", district: "Bengaluru", area: "Electronic City", postOffice: "Electronic City SO" },
  { pincode: "560038", state: "Karnataka", district: "Bengaluru", area: "Indiranagar", postOffice: "Indiranagar SO" },
  { pincode: "560011", state: "Karnataka", district: "Bengaluru", area: "Jayanagar", postOffice: "Jayanagar SO" },
  { pincode: "560037", state: "Karnataka", district: "Bengaluru", area: "Marathahalli", postOffice: "Marathahalli SO" },
  { pincode: "560102", state: "Karnataka", district: "Bengaluru", area: "HSR Layout", postOffice: "HSR Layout SO" },
  { pincode: "560003", state: "Karnataka", district: "Bengaluru", area: "Malleshwaram", postOffice: "Malleshwaram SO" },
  { pincode: "560064", state: "Karnataka", district: "Bengaluru", area: "Yelahanka", postOffice: "Yelahanka SO" },
  
  // Tamil Nadu - Chennai
  { pincode: "600001", state: "Tamil Nadu", district: "Chennai", area: "Chennai GPO", postOffice: "Chennai GPO" },
  { pincode: "600017", state: "Tamil Nadu", district: "Chennai", area: "T Nagar", postOffice: "T Nagar SO" },
  { pincode: "600040", state: "Tamil Nadu", district: "Chennai", area: "Anna Nagar", postOffice: "Anna Nagar SO" },
  { pincode: "600020", state: "Tamil Nadu", district: "Chennai", area: "Adyar", postOffice: "Adyar SO" },
  { pincode: "600042", state: "Tamil Nadu", district: "Chennai", area: "Velachery", postOffice: "Velachery SO" },
  { pincode: "600045", state: "Tamil Nadu", district: "Chennai", area: "Tambaram", postOffice: "Tambaram SO" },
  { pincode: "600004", state: "Tamil Nadu", district: "Chennai", area: "Mylapore", postOffice: "Mylapore SO" },
  { pincode: "600032", state: "Tamil Nadu", district: "Chennai", area: "Guindy", postOffice: "Guindy SO" },
  
  // Delhi
  { pincode: "110001", state: "Delhi", district: "New Delhi", area: "Connaught Place", postOffice: "Connaught Place SO" },
  { pincode: "110017", state: "Delhi", district: "South Delhi", area: "Saket", postOffice: "Saket SO" },
  { pincode: "110070", state: "Delhi", district: "South Delhi", area: "Vasant Kunj", postOffice: "Vasant Kunj SO" },
  { pincode: "110045", state: "Delhi", district: "South Delhi", area: "Dwarka", postOffice: "Dwarka SO" },
  { pincode: "110058", state: "Delhi", district: "West Delhi", area: "Janakpuri", postOffice: "Janakpuri SO" },
  { pincode: "110085", state: "Delhi", district: "North Delhi", area: "Rohini", postOffice: "Rohini SO" },
  { pincode: "110088", state: "Delhi", district: "North Delhi", area: "Pitampura", postOffice: "Pitampura SO" },
  { pincode: "110024", state: "Delhi", district: "South Delhi", area: "Lajpat Nagar", postOffice: "Lajpat Nagar SO" },
  { pincode: "110048", state: "Delhi", district: "South Delhi", area: "Greater Kailash", postOffice: "Greater Kailash SO" },
  { pincode: "110016", state: "Delhi", district: "South Delhi", area: "Hauz Khas", postOffice: "Hauz Khas SO" },
  
  // Gujarat - Ahmedabad
  { pincode: "380001", state: "Gujarat", district: "Ahmedabad", area: "Ahmedabad GPO", postOffice: "Ahmedabad GPO" },
  { pincode: "380054", state: "Gujarat", district: "Ahmedabad", area: "SG Highway", postOffice: "SG Highway SO" },
  { pincode: "380058", state: "Gujarat", district: "Ahmedabad", area: "Bopal", postOffice: "Bopal SO" },
  { pincode: "380009", state: "Gujarat", district: "Ahmedabad", area: "Navrangpura", postOffice: "Navrangpura SO" },
  { pincode: "380015", state: "Gujarat", district: "Ahmedabad", area: "Satellite", postOffice: "Satellite SO" },
  
  // West Bengal - Kolkata
  { pincode: "700001", state: "West Bengal", district: "Kolkata", area: "Kolkata GPO", postOffice: "Kolkata GPO" },
  { pincode: "700091", state: "West Bengal", district: "Kolkata", area: "Salt Lake", postOffice: "Salt Lake SO" },
  { pincode: "700016", state: "West Bengal", district: "Kolkata", area: "Park Street", postOffice: "Park Street SO" },
  { pincode: "711101", state: "West Bengal", district: "Howrah", area: "Howrah", postOffice: "Howrah GPO" },
  { pincode: "700028", state: "West Bengal", district: "Kolkata", area: "Dum Dum", postOffice: "Dum Dum SO" },
  { pincode: "700156", state: "West Bengal", district: "Kolkata", area: "New Town", postOffice: "New Town SO" },
  
  // Rajasthan - Jaipur
  { pincode: "302001", state: "Rajasthan", district: "Jaipur", area: "Jaipur GPO", postOffice: "Jaipur GPO" },
  { pincode: "302017", state: "Rajasthan", district: "Jaipur", area: "Malviya Nagar", postOffice: "Malviya Nagar SO" },
  { pincode: "302021", state: "Rajasthan", district: "Jaipur", area: "Vaishali Nagar", postOffice: "Vaishali Nagar SO" },
  { pincode: "302020", state: "Rajasthan", district: "Jaipur", area: "Mansarovar", postOffice: "Mansarovar SO" },
  
  // Kerala - Kochi
  { pincode: "682001", state: "Kerala", district: "Kochi", area: "Kochi GPO", postOffice: "Kochi GPO" },
  { pincode: "682030", state: "Kerala", district: "Kochi", area: "Kakkanad", postOffice: "Kakkanad SO" },
  { pincode: "682024", state: "Kerala", district: "Kochi", area: "Edappally", postOffice: "Edappally SO" },
  
  // Punjab - Chandigarh
  { pincode: "160001", state: "Punjab", district: "Chandigarh", area: "Chandigarh GPO", postOffice: "Chandigarh GPO" },
  { pincode: "160017", state: "Punjab", district: "Chandigarh", area: "Sector 17", postOffice: "Sector 17 SO" },
  { pincode: "160022", state: "Punjab", district: "Chandigarh", area: "Sector 22", postOffice: "Sector 22 SO" },
];

// PIN Code facts for "Did you know?" section
export const PIN_FACTS = [
  "PIN stands for Postal Index Number, introduced in India on August 15, 1972.",
  "The first digit of Indian PIN represents the region - 1-2 for North, 3-4 for West, 5-6 for South, 7-8 for East, 9 for Army Post Offices.",
  "The second digit represents the sub-region or state, and the third digit represents the sorting district.",
  "India has over 150,000 post offices, making it the largest postal network in the world.",
  "The last 3 digits of a PIN code represent the specific post office within the sorting district.",
  "PIN codes in India range from 110001 (New Delhi) to 855117 (Kishanganj, Bihar).",
  "The highest PIN code in India is 855117 and the lowest is 110001.",
  "Some areas share the same PIN code with multiple post offices for efficient delivery.",
  "Indian postal service delivers to over 1.5 billion addresses across the country.",
  "The Union Territory of Lakshadweep has the fewest PIN codes in India.",
];

// Generate random PIN code for a state
export const generateRandomPinCode = (state?: string): string => {
  if (state && PIN_CODE_RANGES[state]) {
    const { start, end } = PIN_CODE_RANGES[state];
    return String(Math.floor(Math.random() * (end - start + 1)) + start);
  }
  // Generate completely random valid Indian PIN
  const ranges = Object.values(PIN_CODE_RANGES);
  const randomRange = ranges[Math.floor(Math.random() * ranges.length)];
  return String(Math.floor(Math.random() * (randomRange.end - randomRange.start + 1)) + randomRange.start);
};

// Generate bulk PIN codes
export const generateBulkPinCodes = (count: number, state?: string): string[] => {
  const pins: string[] = [];
  const generated = new Set<string>();
  
  while (pins.length < count) {
    const pin = generateRandomPinCode(state);
    if (!generated.has(pin)) {
      generated.add(pin);
      pins.push(pin);
    }
  }
  
  return pins;
};

// Reverse lookup PIN code
export const lookupPinCode = (pincode: string): PinCodeData | null => {
  return PIN_DATABASE.find(p => p.pincode === pincode) || null;
};

// Search PIN codes by area/city
export const searchPinCodes = (query: string): PinCodeData[] => {
  const lowercaseQuery = query.toLowerCase();
  return PIN_DATABASE.filter(
    p => 
      p.area.toLowerCase().includes(lowercaseQuery) ||
      p.postOffice.toLowerCase().includes(lowercaseQuery) ||
      p.district.toLowerCase().includes(lowercaseQuery) ||
      p.state.toLowerCase().includes(lowercaseQuery) ||
      p.pincode.includes(query)
  );
};

// Get all states
export const getStates = (): string[] => Object.keys(STATES_DATA);

// Get districts for a state
export const getDistricts = (state: string): string[] => {
  return STATES_DATA[state] ? Object.keys(STATES_DATA[state].districts) : [];
};

// Get areas for a district
export const getAreas = (state: string, district: string): string[] => {
  return STATES_DATA[state]?.districts[district] || [];
};
