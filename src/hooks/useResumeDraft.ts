import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface Experience {
  company: string;
  position: string;
  duration: string;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  year: string;
}

export interface ResumeDraft {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string;
  certifications: string;
  projects: string;
  languages: string;
  experiences: Experience[];
  education: Education[];
  profileImage: string | null;
  imagePosition: "left" | "right";
  imageShape: "square" | "circle";
  showImage: boolean;
  template: string;
  font: string;
  pageSize: "a4" | "letter";
  lastSaved: string;
}

const STORAGE_KEY = "resume-builder-draft";

const defaultDraft: ResumeDraft = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  summary: "",
  skills: "",
  certifications: "",
  projects: "",
  languages: "",
  experiences: [{ company: "", position: "", duration: "", description: "" }],
  education: [{ institution: "", degree: "", year: "" }],
  profileImage: null,
  imagePosition: "left",
  imageShape: "circle",
  showImage: true,
  template: "modern",
  font: "inter",
  pageSize: "a4",
  lastSaved: "",
};

export function useResumeDraft() {
  const [draft, setDraft] = useState<ResumeDraft | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ResumeDraft;
        setDraft(parsed);
      }
    } catch (error) {
      console.error("Failed to load draft:", error);
    }
    setIsLoaded(true);
  }, []);

  const saveDraft = useCallback((data: Partial<ResumeDraft>) => {
    try {
      const newDraft: ResumeDraft = {
        ...defaultDraft,
        ...draft,
        ...data,
        lastSaved: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newDraft));
      setDraft(newDraft);
      return true;
    } catch (error) {
      console.error("Failed to save draft:", error);
      return false;
    }
  }, [draft]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setDraft(null);
      toast({
        title: "Draft Cleared",
        description: "Your saved resume draft has been deleted.",
      });
    } catch (error) {
      console.error("Failed to clear draft:", error);
    }
  }, [toast]);

  const hasDraft = draft !== null && draft.fullName.trim() !== "";

  return {
    draft,
    isLoaded,
    hasDraft,
    saveDraft,
    clearDraft,
  };
}
