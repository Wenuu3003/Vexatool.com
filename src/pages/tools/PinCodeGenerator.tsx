import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet";
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
  type SearchResult 
} from "@/lib/pinCodeSearch";
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
  
  // Statistics
  const [totalSearches, setTotalSearches] = useState<number>(0);

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
    
    if (value.length >= 2) {
      // Clean the input
      const cleanedValue = cleanUserInput(value);
      
      // Search with optional filters - works even without state/district selection
      const results = searchVillagesAutocomplete(
        cleanedValue, 
        selectedState || undefined, 
        selectedDistrict || undefined, 
        selectedTaluk || undefined
      );
      setVillageResults(results);
      setVillagePopoverOpen(results.length > 0);
      
      // If no exact results, get closest suggestions
      if (results.length === 0 && cleanedValue.length >= 2) {
        const suggestions = getClosestVillageSuggestions(cleanedValue, 5);
        setVillageSuggestions(suggestions);
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
  const handleReverseLookup = () => {
    if (lookupPin.length !== 6 || !/^\d+$/.test(lookupPin)) {
      setLookupError("Please enter a valid 6-digit PIN code");
      setLookupResult(null);
      return;
    }
    
    const result = lookupByPincode(lookupPin);
    if (result) {
      setLookupResult(result);
      setLookupError("");
      saveToHistory(lookupPin);
      toast.success("PIN code found!");
    } else {
      setLookupResult(null);
      setLookupError("PIN code not found in database. Try another PIN.");
    }
  };

  // Search with advanced matching - require 3 chars minimum
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length >= 3) {
      const { results, message } = advancedSearchPinCodes(query, { limit: 50, includeNearby: true });
      setSearchResults(results);
      setSearchMessage(message || "");
    } else {
      setSearchResults([]);
      setSearchMessage("");
    }
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
        <title>Online PIN Code Generator India | Find & Generate Indian PIN Codes</title>
        <meta name="description" content="Generate and find Indian PIN codes instantly. Search PIN codes by state, district, city or area. Fast, accurate and free online PIN Code Generator tool." />
        <meta name="keywords" content="pincode generator, india pin code, pin code finder, indian postal code, area pincode search, post office pincode, random pin generator" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="Online PIN Code Generator India" />
        <meta property="og:description" content="Find and generate Indian PIN codes by location. Fast and accurate postal PIN Code lookup tool." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Online PIN Code Generator India" />
        <meta name="twitter:description" content="Generate & find Indian PIN codes instantly with our smart PIN Code tool." />
        <meta name="theme-color" content="#ff2d95" />
        <meta httpEquiv="Content-Language" content="en-IN" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Online PIN Code Generator India",
            "url": canonicalUrl,
            "applicationCategory": "Utility",
            "operatingSystem": "All",
            "description": "Generate and find Indian PIN codes by state, district, city or area using this fast online tool."
          })}
        </script>
      </Helmet>
      
      <ToolLayout
        title="Smart PIN Code Generator"
        description="Generate, find & lookup Indian PIN codes instantly"
        icon={MapPin}
        colorClass="bg-gradient-to-r from-pink-500 to-purple-600"
        category="UtilitiesApplication"
      >
        {/* Stats Bar */}
        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="w-4 h-4" />
            <span>Total Searches: <strong className="text-foreground">{totalSearches.toLocaleString()}</strong></span>
          </div>
          <Badge variant="outline" className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500/30">
            <Lightbulb className="w-3 h-3 mr-1" />
            India Focused
          </Badge>
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
                  No exact village match found for "{searchQuery}"
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

        {/* Info Section */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-pink-500/5 to-purple-500/5">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" />
            About Indian PIN Codes
          </h3>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-muted-foreground">
              PIN (Postal Index Number) is a 6-digit code used by India Post to identify post offices. 
              The first digit represents the region, the second digit represents the sub-region, 
              and the last four digits represent the specific post office.
            </p>
            <ul className="text-muted-foreground mt-4 space-y-1">
              <li><strong>1-2:</strong> Northern Region (Delhi, UP, Rajasthan, Punjab, etc.)</li>
              <li><strong>3-4:</strong> Western Region (Gujarat, Maharashtra, MP, Goa)</li>
              <li><strong>5-6:</strong> Southern Region (AP, Karnataka, Tamil Nadu, Kerala)</li>
              <li><strong>7-8:</strong> Eastern Region (West Bengal, Odisha, Bihar, Jharkhand)</li>
              <li><strong>9:</strong> Army Post Offices (APO/FPO)</li>
            </ul>
          </div>
        </Card>
      </ToolLayout>
    </>
  );
};

export default PinCodeGenerator;
