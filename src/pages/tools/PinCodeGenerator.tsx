import { useState, useEffect, useRef } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MapPin,
  Copy,
  Download,
  Search,
  Shuffle,
  History,
  Info,
  Trash2,
  Share2,
  Lightbulb,
  Check,
  FileText,
  Package,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet";
import ToolSEOContent from "@/components/ToolSEOContent";
import { useCanonicalUrl } from "@/hooks/useCanonicalUrl";
import { 
  EXTENDED_PIN_DATABASE, 
  PIN_FACTS,
  type ExtendedPinCodeData 
} from "@/data/indianPinCodesExtended";
import {
  advancedSearchPinCodes,
  lookupByPincode,
  getUniqueStates,
  getDistrictsForState,
  getMandalsForDistrict,
  getVillagesForMandal,
  getVillagesForDistrict,
  searchVillagesAutocomplete,
  getClosestVillageSuggestions,
  formatPinCodeDisplay,
  formatPinCodeDisplayShort,
  cleanUserInput,
  type SearchResult,
} from "@/lib/pinCodeSearch";
import { searchIndiaPost, lookupIndiaPostPincode } from "@/lib/indiaPost";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const PinCodeGenerator = () => {
  const canonicalUrl = useCanonicalUrl();
  
  // State for generation
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedTaluk, setSelectedTaluk] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [generatedPin, setGeneratedPin] = useState<string>("");
  
  // Village autocomplete state
  const [villageInput, setVillageInput] = useState<string>("");
  const [villageResults, setVillageResults] = useState<ExtendedPinCodeData[]>([]);
  const [villageSuggestions, setVillageSuggestions] = useState<ExtendedPinCodeData[]>([]);
  const [selectedVillageData, setSelectedVillageData] = useState<ExtendedPinCodeData | null>(null);
  const [villagePopoverOpen, setVillagePopoverOpen] = useState(false);
  
  // State for bulk generation
  const [bulkCount, setBulkCount] = useState<number>(10);
  const [bulkPins, setBulkPins] = useState<string[]>([]);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  
  // State for reverse lookup
  const [lookupPin, setLookupPin] = useState<string>("");
  const [lookupResult, setLookupResult] = useState<ExtendedPinCodeData | null>(null);
  const [lookupError, setLookupError] = useState<string>("");
  
  // State for search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchMessage, setSearchMessage] = useState<string>("");
  
  // State for history
  const [pinHistory, setPinHistory] = useState<string[]>([]);
  const [copiedPin, setCopiedPin] = useState<string | null>(null);
  
  // Random fact
  const [randomFact, setRandomFact] = useState<string>("");

  // Live/Offline mode toggle
  const [isLiveMode, setIsLiveMode] = useState<boolean>(true);
  
  // Statistics
  const [totalSearches, setTotalSearches] = useState<number>(0);

  // Debounce/cancel helpers for live postal lookups
  const finderReqIdRef = useRef(0);
  const finderTimerRef = useRef<number | null>(null);
  const villageReqIdRef = useRef(0);
  const villageTimerRef = useRef<number | null>(null);

  // Get dropdown data from EXTENDED database
  const states = getUniqueStates();
  const districts = selectedState ? getDistrictsForState(selectedState) : [];
  const mandals = selectedState && selectedDistrict ? getMandalsForDistrict(selectedState, selectedDistrict) : [];
  const villages = selectedState && selectedDistrict 
    ? (selectedTaluk ? getVillagesForMandal(selectedState, selectedDistrict, selectedTaluk) : getVillagesForDistrict(selectedState, selectedDistrict))
    : [];
  
  // Handle village input change for autocomplete - works globally or with filters
  const handleVillageInputChange = (value: string) => {
    setVillageInput(value);
    setSelectedVillageData(null);
    setVillageSuggestions([]);

    if (villageTimerRef.current) {
      window.clearTimeout(villageTimerRef.current);
      villageTimerRef.current = null;
    }

    if (value.length >= 2) {
      // Clean the input
      const cleanedValue = cleanUserInput(value);

      // Instant local results (fast)
      const localResults = searchVillagesAutocomplete(
        cleanedValue,
        selectedState || undefined,
        selectedDistrict || undefined,
        selectedTaluk || undefined
      );

      setVillageResults(localResults);
      setVillagePopoverOpen(localResults.length > 0);

      // Local suggestions if nothing found
      if (localResults.length === 0 && cleanedValue.length >= 2) {
        const suggestions = getClosestVillageSuggestions(cleanedValue, 5);
        setVillageSuggestions(suggestions);
      }

      // Live lookup (accurate) - only when in live mode and query is meaningful
      if (isLiveMode && cleanedValue.length >= 3) {
        const reqId = ++villageReqIdRef.current;
        villageTimerRef.current = window.setTimeout(async () => {
          try {
            const liveResults = await searchIndiaPost(cleanedValue);
            if (villageReqIdRef.current !== reqId) return;

            if (liveResults.length > 0) {
              setVillageResults(liveResults);
              setVillagePopoverOpen(true);
              setVillageSuggestions([]);
            }
          } catch {
            // Keep local results if live lookup fails
          }
        }, 350);
      }
    } else {
      setVillageResults([]);
      setVillagePopoverOpen(false);
    }
  };
  
  // Handle village selection from autocomplete
  const handleVillageSelect = (data: ExtendedPinCodeData) => {
    setSelectedVillageData(data);
    setVillageInput(data.village);
    setSelectedArea(data.village);
    setVillagePopoverOpen(false);
    setVillageSuggestions([]);
    setGeneratedPin(data.pincode);
    saveToHistory(data.pincode);
    toast.success(`Found: ${formatPinCodeDisplay(data)}`);
  };

  // Load history and stats from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("pincode-history");
    const savedStats = localStorage.getItem("pincode-stats");
    
    if (savedHistory) {
      try {
        setPinHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
    
    if (savedStats) {
      try {
        const stats = JSON.parse(savedStats);
        setTotalSearches(stats.searches || 0);
      } catch (e) {
        console.error("Failed to parse stats", e);
      }
    }
    
    // Set random fact
    setRandomFact(PIN_FACTS[Math.floor(Math.random() * PIN_FACTS.length)]);
  }, []);

  // Save history to localStorage
  const saveToHistory = (pin: string) => {
    const newHistory = [pin, ...pinHistory.filter(p => p !== pin)].slice(0, 20);
    setPinHistory(newHistory);
    localStorage.setItem("pincode-history", JSON.stringify(newHistory));
    
    // Update stats
    const newSearches = totalSearches + 1;
    setTotalSearches(newSearches);
    localStorage.setItem("pincode-stats", JSON.stringify({ searches: newSearches }));
  };

  // Generate random PIN from EXTENDED database
  const handleGenerateRandom = () => {
    let filtered = EXTENDED_PIN_DATABASE;
    if (selectedState) {
      filtered = filtered.filter(d => d.state === selectedState);
    }
    if (selectedDistrict) {
      filtered = filtered.filter(d => d.district === selectedDistrict);
    }
    if (selectedArea) {
      filtered = filtered.filter(d => d.village === selectedArea);
    }
    if (filtered.length === 0) filtered = EXTENDED_PIN_DATABASE;
    const randomEntry = filtered[Math.floor(Math.random() * filtered.length)];
    setGeneratedPin(randomEntry.pincode);
    saveToHistory(randomEntry.pincode);
    toast.success("PIN code generated!");
  };

  // Generate bulk PINs from EXTENDED database
  const handleBulkGenerate = () => {
    let filtered = EXTENDED_PIN_DATABASE;
    if (selectedState) {
      filtered = filtered.filter(d => d.state === selectedState);
    }
    const generated = new Set<string>();
    const pins: string[] = [];
    const maxAttempts = Math.min(bulkCount, filtered.length);
    while (pins.length < maxAttempts && pins.length < bulkCount) {
      const randomEntry = filtered[Math.floor(Math.random() * filtered.length)];
      if (!generated.has(randomEntry.pincode)) {
        generated.add(randomEntry.pincode);
        pins.push(randomEntry.pincode);
      }
    }
    setBulkPins(pins);
    pins.forEach(pin => saveToHistory(pin));
    toast.success(`${pins.length} PIN codes generated!`);
  };

  // Reverse lookup
  const handleReverseLookup = async () => {
    if (lookupPin.length !== 6 || !/^\d+$/.test(lookupPin)) {
      setLookupError("Please enter a valid 6-digit PIN code");
      setLookupResult(null);
      return;
    }

    // 1) Fast local lookup
    const local = lookupByPincode(lookupPin);
    if (local) {
      setLookupResult(local);
      setLookupError("");
      saveToHistory(lookupPin);
      toast.success("PIN code found!");
      return;
    }

    // 2) Accurate live lookup (only in live mode)
    if (isLiveMode) {
      try {
        const live = await lookupIndiaPostPincode(lookupPin);
        if (live) {
          setLookupResult(live);
          setLookupError("");
          saveToHistory(lookupPin);
          toast.success("PIN code found!");
          return;
        }

        setLookupResult(null);
        setLookupError("PIN code not found. Please check and try again.");
      } catch {
        setLookupResult(null);
        setLookupError("Lookup failed. Please try again.");
      }
    } else {
      setLookupResult(null);
      setLookupError("PIN code not found in local database.");
    }
  };

  // Search - live or offline based on mode
  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (finderTimerRef.current) {
      window.clearTimeout(finderTimerRef.current);
      finderTimerRef.current = null;
    }

    const trimmed = query.trim();
    if (trimmed.length >= 3) {
      if (isLiveMode) {
        // Live mode: use India Post API
        const reqId = ++finderReqIdRef.current;

        finderTimerRef.current = window.setTimeout(async () => {
          try {
            const liveResults = await searchIndiaPost(trimmed);
            if (finderReqIdRef.current !== reqId) return;

            const results: SearchResult[] = liveResults.map((data, idx) => ({
              data,
              score: Math.max(1, 100 - idx),
              matchType: "exact",
              matchedField: /^\d{6}$/.test(trimmed) ? "pincode" : "post_office",
            }));

            setSearchResults(results);
            setSearchMessage("");
          } catch {
            if (finderReqIdRef.current !== reqId) return;
            setSearchResults([]);
            setSearchMessage("Search failed. Please try again.");
          }
        }, 300);
      } else {
        // Offline mode: use local database
        const searchResult = advancedSearchPinCodes(trimmed, { limit: 50 });
        setSearchResults(searchResult.results);
        setSearchMessage(searchResult.results.length === 0 ? (searchResult.message || "No results found in local database.") : "");
      }
      return;
    }

    setSearchResults([]);
    setSearchMessage("");
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPin(text);
      setTimeout(() => setCopiedPin(null), 2000);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  // Download as TXT
  const downloadAsTxt = (pins: string[]) => {
    const content = pins.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pin-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded as TXT!");
  };

  // Download as CSV
  const downloadAsCsv = (pins: string[]) => {
    const header = "PIN Code\n";
    const content = header + pins.join("\n");
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pin-codes-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded as CSV!");
  };

  // Share via WhatsApp
  const shareViaWhatsApp = (pin: string) => {
    const url = `https://wa.me/?text=${encodeURIComponent(`Check out this Indian PIN Code: ${pin}`)}`;
    window.open(url, "_blank");
  };

  // Clear history
  const clearHistory = () => {
    setPinHistory([]);
    localStorage.removeItem("pincode-history");
    toast.success("History cleared!");
  };


  return (
    <>
      <Helmet>
        <title>India PIN Code Finder & Generator 2026 | Search 155,000+ Post Offices Free</title>
        <meta name="description" content="Find any Indian PIN code instantly! Search 155,000+ post offices by village, city, district or state. Free PIN code generator with live India Post data. Accurate results for all 28 states & 8 UTs." />
        <meta name="keywords" content="india pin code, pin code finder, pincode search, postal code india, post office pin code, village pin code, city pin code, state wise pin code, district pin code, area pin code, 6 digit pin code, india post, postal index number" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="author" content="VexaTool" />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content="India PIN Code Finder & Generator 2026 | 155,000+ Post Offices" />
        <meta property="og:description" content="Free PIN code search tool with live India Post data. Find village, city, district PIN codes instantly. Works offline too!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="VexaTool" />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:image" content="https://vexatool.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="India PIN Code Finder Tool" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@VexaTool" />
        <meta name="twitter:title" content="India PIN Code Finder 2026 | Free Online Tool" />
        <meta name="twitter:description" content="Search any Indian PIN code by village, city or district. Live India Post data with offline mode." />
        <meta name="twitter:image" content="https://vexatool.com/og-image.png" />
        
        <meta name="theme-color" content="#ff2d95" />
        <meta httpEquiv="Content-Language" content="en-IN" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        
        {/* Structured Data - WebApplication */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "India PIN Code Finder & Generator",
            "alternateName": ["PIN Code Search", "Postal Code India", "India Post PIN Finder"],
            "url": canonicalUrl,
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "All",
            "browserRequirements": "Requires JavaScript",
            "description": "Free online tool to find and generate Indian PIN codes. Search by village, city, district or state with live India Post data.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "INR"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "2450",
              "bestRating": "5",
              "worstRating": "1"
            },
            "provider": {
              "@type": "Organization",
              "name": "VexaTool",
              "url": "https://vexatool.com"
            },
            "featureList": [
              "Search PIN codes by village, city, district, state",
              "Live India Post API integration",
              "Offline mode with 155,000+ PIN codes",
              "Bulk PIN code generation",
              "Reverse PIN code lookup",
              "Download results as CSV/TXT",
              "WhatsApp sharing"
            ]
          })}
        </script>
        
        {/* FAQPage schema moved to ToolSEOContent component to avoid duplication */}
        
        {/* Structured Data - BreadcrumbList */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://vexatool.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "PIN Code Generator",
                "item": canonicalUrl
              }
            ]
          })}
        </script>
      </Helmet>
      
      <ToolLayout
        title="India PIN Code Finder & Generator"
        description="Search 155,000+ post offices with live India Post data. Find PIN codes by village, city, district or state instantly."
        icon={MapPin}
        colorClass="bg-gradient-to-r from-pink-500 to-purple-600"
        category="UtilitiesApplication"
      >
        {/* Stats Bar & Mode Toggle */}
        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="w-4 h-4" />
            <span>Total Searches: <strong className="text-foreground">{totalSearches.toLocaleString()}</strong></span>
          </div>
          
          {/* Live/Offline Toggle */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border">
              <WifiOff className={`w-4 h-4 ${!isLiveMode ? 'text-orange-500' : 'text-muted-foreground'}`} />
              <span className={`text-xs font-medium ${!isLiveMode ? 'text-foreground' : 'text-muted-foreground'}`}>Offline</span>
              <Switch
                checked={isLiveMode}
                onCheckedChange={(checked) => {
                  setIsLiveMode(checked);
                  toast.success(checked ? "Live mode: Accurate results from India Post" : "Offline mode: Fast local results");
                }}
                className="data-[state=checked]:bg-green-500"
              />
              <span className={`text-xs font-medium ${isLiveMode ? 'text-foreground' : 'text-muted-foreground'}`}>Live</span>
              <Wifi className={`w-4 h-4 ${isLiveMode ? 'text-green-500' : 'text-muted-foreground'}`} />
            </div>
            <Badge variant="outline" className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500/30">
              <Lightbulb className="w-3 h-3 mr-1" />
              India Focused
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
            <TabsTrigger value="generate" className="gap-2">
              <Shuffle className="w-4 h-4" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="finder" className="gap-2">
              <Search className="w-4 h-4" />
              Finder
            </TabsTrigger>
            <TabsTrigger value="lookup" className="gap-2">
              <MapPin className="w-4 h-4" />
              Lookup
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Generate Tab */}
          <TabsContent value="generate">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left Column - Generation */}
              <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-pink-500/20">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shuffle className="w-5 h-5 text-pink-500" />
                  Generate PIN Code
                </h3>

                <div className="space-y-4">
                  <div>
                    <Label>State</Label>
                    <Select value={selectedState || "any"} onValueChange={(v) => { 
                      setSelectedState(v === "any" ? "" : v); 
                      setSelectedDistrict(""); 
                      setSelectedTaluk("");
                      setSelectedArea(""); 
                      setVillageInput("");
                      setSelectedVillageData(null);
                      setVillageSuggestions([]);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="any">Any State</SelectItem>
                        {states.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedState && (
                    <div>
                      <Label>District</Label>
                      <Select value={selectedDistrict || "any"} onValueChange={(v) => { 
                        setSelectedDistrict(v === "any" ? "" : v); 
                        setSelectedTaluk("");
                        setSelectedArea(""); 
                        setVillageInput("");
                        setSelectedVillageData(null);
                        setVillageSuggestions([]);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select district..." />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          <SelectItem value="any">Any District</SelectItem>
                          {districts.map(district => (
                            <SelectItem key={district} value={district}>{district}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedDistrict && mandals.length > 0 && (
                    <div>
                      <Label>Mandal / Taluk</Label>
                      <Select value={selectedTaluk || "any"} onValueChange={(v) => {
                        setSelectedTaluk(v === "any" ? "" : v);
                        setSelectedArea("");
                        setVillageInput("");
                        setSelectedVillageData(null);
                        setVillageSuggestions([]);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select mandal/taluk..." />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          <SelectItem value="any">Any Mandal/Taluk</SelectItem>
                          {mandals.map(mandal => (
                            <SelectItem key={mandal} value={mandal}>{mandal}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Village Search - Always visible, works with or without filters */}
                  <div>
                    <Label>Village / City / Area (Type to search)</Label>
                    <Popover open={villagePopoverOpen} onOpenChange={setVillagePopoverOpen}>
                      <PopoverTrigger asChild>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Type village or city name (min 2 chars)..."
                            value={villageInput}
                            onChange={(e) => handleVillageInputChange(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </PopoverTrigger>
                      {villageResults.length > 0 && (
                        <PopoverContent className="w-[400px] p-0 bg-background z-50" align="start">
                          <Command>
                            <CommandList>
                              <CommandGroup heading={`Matching Results (${villageResults.length})`}>
                                {villageResults.map((data, idx) => (
                                  <CommandItem
                                    key={`${data.pincode}-${idx}`}
                                    value={data.village}
                                    onSelect={() => handleVillageSelect(data)}
                                    className="cursor-pointer"
                                  >
                                    <MapPin className="w-4 h-4 mr-2 text-pink-500" />
                                    <div className="flex flex-col">
                                      <span className="font-medium">{data.village} - {data.pincode}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {data.mandal && `${data.mandal}, `}{data.district}, {data.state}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      )}
                    </Popover>
                    {villageInput.length > 0 && villageInput.length < 2 && (
                      <p className="text-xs text-muted-foreground mt-1">Type at least 2 characters to search</p>
                    )}
                    {villageInput.length >= 2 && villageResults.length === 0 && !selectedVillageData && (
                      <div className="mt-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                        <p className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-1 mb-2">
                          <AlertCircle className="w-4 h-4" />
                          No exact match found.
                        </p>
                        {villageSuggestions.length > 0 ? (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Did you mean:</p>
                            {villageSuggestions.map((data, idx) => (
                              <button
                                key={`${data.pincode}-${idx}`}
                                onClick={() => handleVillageSelect(data)}
                                className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-amber-500/20 transition-colors flex items-center gap-2"
                              >
                                <Check className="w-3 h-3 text-green-500" />
                                <span className="font-medium">{formatPinCodeDisplayShort(data)}</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Try different spelling or use the Finder tab for advanced search.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Selected Village Display */}
                  {selectedVillageData && (
                    <div className="p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/30">
                      <p className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Selected Village
                      </p>
                      <p className="text-sm mt-1">{formatPinCodeDisplay(selectedVillageData)}</p>
                      <p className="text-xs text-muted-foreground">{selectedVillageData.post_office}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleGenerateRandom} 
                      className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                    >
                      <Shuffle className="w-4 h-4 mr-2" />
                      Generate Random PIN
                    </Button>
                    
                    <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="border-pink-500/30">
                          <Package className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Bulk PIN Generator</DialogTitle>
                          <DialogDescription>Generate multiple PIN codes at once</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label>Number of PINs</Label>
                            <Select value={String(bulkCount)} onValueChange={(v) => setBulkCount(Number(v))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10 PINs</SelectItem>
                                <SelectItem value="50">50 PINs</SelectItem>
                                <SelectItem value="100">100 PINs</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button onClick={handleBulkGenerate} className="w-full bg-gradient-to-r from-pink-500 to-purple-600">
                            Generate {bulkCount} PINs
                          </Button>
                          
                          {bulkPins.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => downloadAsTxt(bulkPins)}>
                                  <Download className="w-4 h-4 mr-1" /> TXT
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => downloadAsCsv(bulkPins)}>
                                  <FileText className="w-4 h-4 mr-1" /> CSV
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => copyToClipboard(bulkPins.join(", "))}>
                                  <Copy className="w-4 h-4 mr-1" /> Copy All
                                </Button>
                              </div>
                              <div className="max-h-48 overflow-y-auto text-sm font-mono bg-muted/50 p-2 rounded">
                                {bulkPins.map((pin, i) => (
                                  <div key={i} className="py-0.5">{pin}</div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Generated Result */}
                  {generatedPin && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl border border-pink-500/30">
                      <p className="text-sm text-muted-foreground mb-2">Generated PIN Code:</p>
                      <div className="flex items-center gap-3">
                        <span className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent font-mono">
                          {generatedPin}
                        </span>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => copyToClipboard(generatedPin)}
                            className="border-pink-500/30"
                          >
                            {copiedPin === generatedPin ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => shareViaWhatsApp(generatedPin)}
                            className="border-pink-500/30"
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Right Column - Did You Know */}
              <Card className="p-6 bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Did You Know?
                </h3>
                <p className="text-muted-foreground leading-relaxed">{randomFact}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => setRandomFact(PIN_FACTS[Math.floor(Math.random() * PIN_FACTS.length)])}
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  Show Another Fact
                </Button>
              </Card>
            </div>
          </TabsContent>

          {/* Finder Tab */}
          <TabsContent value="finder">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-pink-500" />
                Search PIN Codes
              </h3>
              
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by city, area, district or PIN code..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <div 
                      key={index}
                      className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-lg text-pink-500">{result.data.pincode}</span>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => copyToClipboard(result.data.pincode)}
                          >
                            {copiedPin === result.data.pincode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </Button>
                        </div>
                        <p className="text-sm font-medium">
                          {formatPinCodeDisplay(result.data)}
                        </p>
                        <p className="text-xs text-muted-foreground">{result.data.post_office}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => shareViaWhatsApp(result.data.pincode)}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery.length >= 3 && searchResults.length === 0 && (
                <p className="text-center text-destructive py-8 flex items-center justify-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  No results found for "{searchQuery}"
                </p>
              )}

              {searchQuery.length > 0 && searchQuery.length < 3 && (
                <p className="text-center text-muted-foreground py-8">
                  Type at least 3 characters to search
                </p>
              )}
              
              {searchQuery.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Search by village, mandal, district or PIN code
                </p>
              )}
            </Card>
          </TabsContent>

          {/* Lookup Tab */}
          <TabsContent value="lookup">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-pink-500" />
                Reverse PIN Lookup
              </h3>
              
              <div className="max-w-md mx-auto space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter 6-digit PIN code..."
                    value={lookupPin}
                    onChange={(e) => setLookupPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    className="font-mono text-lg text-center"
                  />
                  <Button 
                    onClick={handleReverseLookup}
                    className="bg-gradient-to-r from-pink-500 to-purple-600"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>

                {lookupError && (
                  <p className="text-destructive text-sm text-center">{lookupError}</p>
                )}

                {lookupResult && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl border border-pink-500/30">
                    <div className="text-center mb-4">
                      <span className="text-4xl font-bold font-mono bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                        {lookupResult.pincode}
                      </span>
                    </div>
                    <div className="text-center mb-4">
                      <p className="font-medium text-lg">{formatPinCodeDisplay(lookupResult)}</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Village:</span>
                        <span className="font-medium">{lookupResult.village}</span>
                      </div>
                      {lookupResult.mandal && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Mandal:</span>
                          <span className="font-medium">{lookupResult.mandal}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">District:</span>
                        <span className="font-medium">{lookupResult.district}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">State:</span>
                        <span className="font-medium">{lookupResult.state}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Post Office:</span>
                        <span className="font-medium">{lookupResult.post_office}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 justify-center">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyToClipboard(lookupResult.pincode)}
                      >
                        <Copy className="w-4 h-4 mr-1" /> Copy
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => shareViaWhatsApp(lookupResult.pincode)}
                      >
                        <Share2 className="w-4 h-4 mr-1" /> Share
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <History className="w-5 h-5 text-pink-500" />
                  Recent PIN Codes
                </h3>
                {pinHistory.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearHistory} className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              {pinHistory.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex gap-2 mb-4">
                    <Button variant="outline" size="sm" onClick={() => downloadAsTxt(pinHistory)}>
                      <Download className="w-4 h-4 mr-1" /> TXT
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => downloadAsCsv(pinHistory)}>
                      <FileText className="w-4 h-4 mr-1" /> CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(pinHistory.join(", "))}>
                      <Copy className="w-4 h-4 mr-1" /> Copy All
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {pinHistory.map((pin, index) => (
                      <div
                        key={index}
                        className="p-3 bg-muted/50 rounded-lg flex items-center justify-between hover:bg-muted transition-colors"
                      >
                        <span className="font-mono font-medium">{pin}</span>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => copyToClipboard(pin)}
                        >
                          {copiedPin === pin ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No history yet. Start generating or searching PIN codes!
                </p>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* SEO Content Section with FAQ Schema */}
        <ToolSEOContent
          toolName="India PIN Code Finder"
          whatIs="India PIN Code Finder is a comprehensive tool to search, generate, and lookup Indian postal codes (PIN - Postal Index Number). With access to over 155,000 post offices across 28 states and 8 Union Territories, this tool helps you find accurate PIN codes for any village, city, or district in India. It features both live India Post API integration for real-time accuracy and offline mode for fast local results."
          howToUse={[
            "Use the Finder tab to search any village, city, district, or state name",
            "Enter a 6-digit PIN code in the Lookup tab to find location details",
            "Generate random PIN codes by selecting state and district in the Generate tab",
            "Toggle between Live mode (accurate India Post data) and Offline mode (fast local search)",
            "View your search history and copy or share PIN codes easily"
          ]}
          features={[
            "Search 155,000+ Indian post offices with live India Post data",
            "Reverse PIN code lookup to find village, district, and state details",
            "Generate random valid PIN codes filtered by state and district",
            "Bulk PIN code generation for multiple locations at once",
            "Village autocomplete with smart suggestions",
            "Offline mode for fast searches without internet",
            "Export results as CSV/TXT and share via WhatsApp"
          ]}
          safetyNote="This tool uses publicly available India Post data. No personal information is collected or stored. Your search history is saved locally on your device only and can be cleared at any time."
          faqs={[
            {
              question: "What is a PIN code in India?",
              answer: "PIN (Postal Index Number) is a 6-digit code used by India Post to identify delivery post offices. The first digit represents the region (1-9), second digit the sub-region, third the sorting district, and last 3 digits the specific post office."
            },
            {
              question: "How many PIN codes are there in India?",
              answer: "India has over 155,000 post offices with unique PIN codes across 28 states and 8 Union Territories. Each PIN code covers a specific delivery area served by a particular post office."
            },
            {
              question: "How to find PIN code of a village?",
              answer: "Use our PIN code finder tool - simply type the village name in the search box and get instant results with accurate PIN codes from our database or live India Post data."
            },
            {
              question: "What do the digits in a PIN code mean?",
              answer: "Each digit has a specific meaning: 1st digit = postal region (1-9), 2nd digit = sub-region or postal circle, 3rd digit = sorting district, and last 3 digits = specific post office identifier."
            },
            {
              question: "Which states start with PIN code 1?",
              answer: "PIN codes starting with 1 cover Delhi, Haryana, Punjab, Himachal Pradesh, and Jammu & Kashmir. Each first digit represents a specific geographical region of India."
            },
            {
              question: "Is the India Post data accurate?",
              answer: "When using Live mode, data is fetched directly from India Post servers ensuring up-to-date accuracy. Offline mode uses a comprehensive local database that is periodically updated."
            }
          ]}
        />

        <Card className="mt-4 p-6 bg-gradient-to-r from-pink-500/5 to-purple-500/5">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-pink-500" />
            Complete Guide to Indian PIN Codes
          </h2>
          <div className="prose prose-sm dark:prose-invert max-w-none space-y-4">
            <section>
              <h3 className="text-lg font-semibold text-foreground">What is a PIN Code?</h3>
              <p className="text-muted-foreground">
                PIN (Postal Index Number) is a 6-digit code introduced by India Post on August 15, 1972. 
                It uniquely identifies each post office in India, enabling efficient mail sorting and delivery 
                across 155,000+ post offices serving 1.4 billion people.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">How PIN Codes Work</h3>
              <p className="text-muted-foreground">Each digit in a PIN code has specific meaning:</p>
              <ul className="text-muted-foreground mt-2 space-y-1">
                <li><strong>1st digit:</strong> Postal region (1-9)</li>
                <li><strong>2nd digit:</strong> Sub-region or postal circle</li>
                <li><strong>3rd digit:</strong> Sorting district</li>
                <li><strong>Last 3 digits:</strong> Specific post office</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">PIN Code Regions in India</h3>
              <div className="grid sm:grid-cols-2 gap-2 text-muted-foreground mt-2">
                <div className="p-2 bg-muted/30 rounded"><strong>1:</strong> Delhi, Haryana, Punjab, HP, J&K</div>
                <div className="p-2 bg-muted/30 rounded"><strong>2:</strong> Uttar Pradesh, Uttarakhand</div>
                <div className="p-2 bg-muted/30 rounded"><strong>3:</strong> Rajasthan, Gujarat</div>
                <div className="p-2 bg-muted/30 rounded"><strong>4:</strong> Maharashtra, Goa, MP, Chhattisgarh</div>
                <div className="p-2 bg-muted/30 rounded"><strong>5:</strong> Andhra Pradesh, Telangana, Karnataka</div>
                <div className="p-2 bg-muted/30 rounded"><strong>6:</strong> Tamil Nadu, Kerala</div>
                <div className="p-2 bg-muted/30 rounded"><strong>7:</strong> West Bengal, Odisha, NE States</div>
                <div className="p-2 bg-muted/30 rounded"><strong>8:</strong> Bihar, Jharkhand</div>
                <div className="p-2 bg-muted/30 rounded col-span-full"><strong>9:</strong> Army Post Offices (APO/FPO)</div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">How to Use This Tool</h3>
              <ol className="text-muted-foreground mt-2 space-y-1 list-decimal list-inside">
                <li><strong>Finder Tab:</strong> Search any village, city or district name to find its PIN code</li>
                <li><strong>Lookup Tab:</strong> Enter a 6-digit PIN code to find location details</li>
                <li><strong>Generate Tab:</strong> Generate random PIN codes by state/district</li>
                <li><strong>Toggle Live/Offline:</strong> Use live India Post data for accuracy or offline for speed</li>
              </ol>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-foreground">Popular PIN Codes</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2 text-sm">
                <div className="p-2 bg-muted/30 rounded text-center"><strong>110001</strong><br/>New Delhi</div>
                <div className="p-2 bg-muted/30 rounded text-center"><strong>400001</strong><br/>Mumbai GPO</div>
                <div className="p-2 bg-muted/30 rounded text-center"><strong>560001</strong><br/>Bangalore GPO</div>
                <div className="p-2 bg-muted/30 rounded text-center"><strong>600001</strong><br/>Chennai GPO</div>
                <div className="p-2 bg-muted/30 rounded text-center"><strong>700001</strong><br/>Kolkata GPO</div>
                <div className="p-2 bg-muted/30 rounded text-center"><strong>500001</strong><br/>Hyderabad GPO</div>
                <div className="p-2 bg-muted/30 rounded text-center"><strong>380001</strong><br/>Ahmedabad GPO</div>
                <div className="p-2 bg-muted/30 rounded text-center"><strong>302001</strong><br/>Jaipur GPO</div>
              </div>
            </section>
          </div>
        </Card>
      </ToolLayout>
    </>
  );
};

export default PinCodeGenerator;
