import { useState, useRef, useEffect, useCallback } from "react";
import { CanonicalHead } from "@/components/CanonicalHead";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileUser,
  Loader2,
  Download,
  Plus,
  Trash2,
  Upload,
  FileText,
  Eye,
  Settings,
  FileUp,
  Save,
  RotateCcw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TemplateSelector, FontSelector, TemplateType, FontFamily } from "@/components/resume/ResumeTemplates";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { exportToPDF, exportToWord } from "@/lib/resumeExport";
import { parseResumeFile } from "@/lib/resumeParser";
import { useResumeDraft } from "@/hooks/useResumeDraft";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ToolSEOContent from "@/components/ToolSEOContent";

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

export default function AIResumeBuilder() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");
  const [certifications, setCertifications] = useState("");
  const [projects, setProjects] = useState("");
  const [languages, setLanguages] = useState("");
  const [experiences, setExperiences] = useState<Experience[]>([
    { company: "", position: "", duration: "", description: "" },
  ]);
  const [education, setEducation] = useState<Education[]>([
    { institution: "", degree: "", year: "" },
  ]);

  // Template & styling
  const [template, setTemplate] = useState<TemplateType>("modern");
  const [font, setFont] = useState<FontFamily>("inter");
  const [pageSize, setPageSize] = useState<"a4" | "letter">("a4");

  // Image settings
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imagePosition, setImagePosition] = useState<"left" | "right">("left");
  const [imageShape, setImageShape] = useState<"square" | "circle">("circle");
  const [showImage, setShowImage] = useState(true);

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const { toast } = useToast();
  const resumeRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Draft functionality
  const { draft, isLoaded, hasDraft, saveDraft, clearDraft } = useResumeDraft();

  // Restore draft on load
  useEffect(() => {
    if (isLoaded && hasDraft && draft && !draftRestored) {
      setFullName(draft.fullName);
      setEmail(draft.email);
      setPhone(draft.phone);
      setLocation(draft.location);
      setSummary(draft.summary);
      setSkills(draft.skills);
      setCertifications(draft.certifications);
      setProjects(draft.projects);
      setLanguages(draft.languages);
      if (draft.experiences.length > 0) setExperiences(draft.experiences);
      if (draft.education.length > 0) setEducation(draft.education);
      setProfileImage(draft.profileImage);
      setImagePosition(draft.imagePosition);
      setImageShape(draft.imageShape);
      setShowImage(draft.showImage);
      setTemplate(draft.template as TemplateType);
      setFont(draft.font as FontFamily);
      setPageSize(draft.pageSize);
      setDraftRestored(true);
      toast({
        title: "Draft Restored",
        description: `Your resume draft from ${new Date(draft.lastSaved).toLocaleDateString()} has been loaded.`,
      });
    }
  }, [isLoaded, hasDraft, draft, draftRestored, toast]);

  const handleSaveDraft = useCallback(() => {
    const success = saveDraft({
      fullName,
      email,
      phone,
      location,
      summary,
      skills,
      certifications,
      projects,
      languages,
      experiences,
      education,
      profileImage,
      imagePosition,
      imageShape,
      showImage,
      template,
      font,
      pageSize,
    });
    if (success) {
      toast({ title: "Draft Saved!", description: "Your resume progress has been saved locally." });
    } else {
      toast({ title: "Save failed", description: "Could not save draft to browser storage.", variant: "destructive" });
    }
  }, [fullName, email, phone, location, summary, skills, certifications, projects, languages, experiences, education, profileImage, imagePosition, imageShape, showImage, template, font, pageSize, saveDraft, toast]);

  const addExperience = () => {
    setExperiences([...experiences, { company: "", position: "", duration: "", description: "" }]);
  };

  const removeExperience = (index: number) => {
    if (experiences.length > 1) {
      setExperiences(experiences.filter((_, i) => i !== index));
    }
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const updated = [...experiences];
    updated[index][field] = value;
    setExperiences(updated);
  };

  const addEducation = () => {
    setEducation([...education, { institution: "", degree: "", year: "" }]);
  };

  const removeEducation = (index: number) => {
    if (education.length > 1) {
      setEducation(education.filter((_, i) => i !== index));
    }
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please select an image under 5MB", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImportResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const parsed = await parseResumeFile(file);
      
      // Pre-fill the form with parsed data
      setFullName(parsed.fullName);
      setEmail(parsed.email);
      setPhone(parsed.phone);
      setLocation(parsed.location);
      setSummary(parsed.summary);
      setSkills(parsed.skills.join(", "));
      setCertifications(parsed.certifications);
      setProjects(parsed.projects);
      setLanguages(parsed.languages);
      
      if (parsed.experiences.length > 0) {
        setExperiences(parsed.experiences);
      }
      
      if (parsed.education.length > 0) {
        setEducation(parsed.education);
      }
      
      toast({ 
        title: "Resume Imported!", 
        description: "Your resume data has been extracted. Please review and adjust as needed." 
      });
    } catch (error) {
      console.error("Import error:", error);
      toast({ 
        title: "Import failed", 
        description: error instanceof Error ? error.message : "Could not parse the resume file.", 
        variant: "destructive" 
      });
    } finally {
      setIsImporting(false);
      if (importInputRef.current) {
        importInputRef.current.value = "";
      }
    }
  };

  const handleExportPDF = async () => {
    if (!fullName.trim()) {
      toast({ title: "Name required", description: "Please enter your full name.", variant: "destructive" });
      return;
    }

    setIsExporting(true);
    try {
      await exportToPDF("resume-preview", fullName.replace(/\s+/g, "_") + "_Resume");
      toast({ title: "PDF Downloaded!", description: "Your resume has been saved as PDF." });
    } catch (error) {
      toast({ title: "Export failed", description: "Could not generate PDF. Please try again.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWord = async () => {
    if (!fullName.trim()) {
      toast({ title: "Name required", description: "Please enter your full name.", variant: "destructive" });
      return;
    }

    setIsExporting(true);
    try {
      await exportToWord(
        {
          fullName,
          email,
          phone,
          location,
          summary,
          skills: skills.split(",").map(s => s.trim()).filter(Boolean),
          experiences,
          education,
          certifications,
          projects,
          languages,
        },
        fullName.replace(/\s+/g, "_") + "_Resume"
      );
      toast({ title: "Word Document Downloaded!", description: "Your resume has been saved as .docx file." });
    } catch (error) {
      toast({ title: "Export failed", description: "Could not generate Word document. Please try again.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const resumeData = {
    fullName,
    email,
    phone,
    location,
    summary,
    skills: skills.split(",").map(s => s.trim()).filter(Boolean),
    experiences,
    education,
    certifications,
    projects,
    languages,
    profileImage,
    imagePosition,
    imageShape,
    showImage,
  };

  const seoContent = {
    toolName: "AI Resume Builder",
    whatIs: "AI Resume Builder is a free, professional tool that creates polished, ATS-optimized resumes with multiple modern templates. It offers a live preview as you build, supports profile photos with customizable positioning, and includes seven unique templates (Modern, Classic, Minimal, Creative, Executive, Technical, Academic). Import existing resumes from PDF or Word files to auto-fill forms instantly. Save drafts locally and download your completed resume as PDF or Word document. Perfect for job seekers, fresh graduates, career changers, and professionals wanting to create standout resumes without design skills or expensive software.",
    howToUse: [
      "Import an existing resume (optional) - Upload a PDF or Word file to auto-fill the form with your data.",
      "Fill in personal information: name, email, phone, and location.",
      "Add your professional summary describing your career highlights and goals.",
      "List your skills, work experience with achievements, and education details.",
      "Upload a profile photo (optional) and customize image shape and position.",
      "Choose your preferred template (7 styles) and font from the Design tab.",
      "Save your draft to continue later - your progress is stored in your browser.",
      "Preview in real-time and download as PDF or Word document."
    ],
    features: [
      "Seven professional resume templates: Modern, Classic, Minimal, Creative, Executive, Technical, Academic.",
      "Resume import feature - parse existing PDF or Word resumes to auto-fill the form.",
      "Save Draft functionality - store your resume progress in browser localStorage.",
      "Live preview that updates instantly as you type for real-time editing.",
      "Profile photo support with customizable position (left/right) and shape (circle/square).",
      "Multiple font choices: Inter, Roboto, Open Sans, Lato, Georgia for personalization.",
      "A4 and US Letter page size options for international compatibility.",
      "Export to high-quality PDF or editable Word (.docx) formats.",
      "ATS-friendly formatting tested against major applicant tracking systems.",
      "100% free with no watermarks, no account required, works entirely in your browser."
    ],
    safetyNote: "All resume data is processed locally in your browser. Your personal information, work history, and contact details are never uploaded to any server. The Save Draft feature stores data only in your browser's localStorage, giving you complete control over your privacy. Your resume stays completely private until you choose to download and share it.",
    faqs: [
      {
        question: "What is ATS-friendly formatting and why does it matter?",
        answer: "ATS (Applicant Tracking System) is software used by 99% of Fortune 500 companies and most employers to scan and filter resumes. ATS-friendly formatting uses clear section headings (Experience, Education, Skills), standard fonts, and proper structure that these systems can parse correctly. Our templates are designed to pass ATS screening while looking professional to human recruiters."
      },
      {
        question: "Should I include a photo on my resume?",
        answer: "This depends on your location and industry. In the US and UK, photos are typically not recommended due to potential bias concerns and anti-discrimination laws. In Europe, Asia, and many other regions, photos are standard and expected. For creative industries like modeling or acting, photos are always appropriate. Our tool gives you the option to include or exclude photos based on your preference."
      },
      {
        question: "Which format should I download: PDF or Word?",
        answer: "PDF is best for preserving formatting exactly as designed and is the most widely accepted format for job applications. It ensures your resume looks identical on any device. Word (.docx) is useful if you need to make quick edits, if an employer's ATS specifically requests it, or if a job posting requires Word format. We recommend having both versions ready for different application requirements."
      },
      {
        question: "Can I edit my resume after downloading?",
        answer: "Yes! The Word format can be edited in Microsoft Word, Google Docs, or LibreOffice. For PDF, you can use our Edit PDF tool or recreate it using the Save Draft feature. We strongly recommend saving your draft before downloading so you can easily update your resume anytime without re-entering all information."
      },
      {
        question: "How does the Resume Import feature work?",
        answer: "Our AI-powered parser reads text from your uploaded PDF or Word resume and intelligently identifies sections like contact info, experience, education, and skills. It then auto-fills the corresponding form fields. While not perfect for all formats, it saves significant time. Always review and adjust the imported data for accuracy."
      },
      {
        question: "Is my data safe with the Save Draft feature?",
        answer: "Absolutely. The Save Draft feature stores your resume data exclusively in your browser's localStorage on your device. No data is sent to any server. Your information remains completely private and accessible only from your browser. Clearing browser data will remove saved drafts, so download your completed resume before clearing."
      },
      {
        question: "What's the difference between the seven resume templates?",
        answer: "Modern: Clean blue gradient header, ideal for tech and corporate roles. Classic: Traditional gray tones, suits conservative industries. Minimal: Simple black and white, maximum readability. Creative: Pink gradient, great for design and marketing. Executive: Amber/gold tones for senior leadership positions. Technical: Cyan/blue with section highlights for IT and engineering. Academic: Emerald/teal for researchers and educators."
      },
      {
        question: "How long should my resume be?",
        answer: "For most professionals, one page is ideal for those with less than 10 years of experience. Two pages are acceptable for senior professionals with extensive relevant experience. Academic CVs can be longer to include publications, research, and presentations. Our templates are designed to maximize content within appropriate page limits."
      }
    ]
  };

  return (
    <>
      <CanonicalHead 
        title="AI Resume Builder Free Online - Create ATS-Friendly Resumes | MyPDFs"
        description="Free AI resume builder with 7 professional templates. Import existing resumes, save drafts, download PDF or Word. ATS-optimized, no signup required."
        keywords="resume builder, CV maker, professional resume, ATS resume, free resume, resume templates, ai resume, job application, career, pdf resume"
      />
      <ToolLayout
        title="AI Resume Builder"
        description="Create professional, ATS-friendly resumes with multiple templates. Download as PDF or Word document."
        icon={FileUser}
        colorClass="bg-gradient-to-br from-emerald-500 to-teal-500"
        category="AI Tools"
      >
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Form */}
        <div className="space-y-6">
          {/* Import Resume Button */}
          <div className="p-4 border-2 border-dashed border-primary/30 rounded-lg bg-primary/5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-semibold text-sm">Import Existing Resume</h3>
                <p className="text-xs text-muted-foreground">Upload a PDF or Word file to auto-fill the form</p>
              </div>
              <div>
                <input
                  ref={importInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleImportResume}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => importInputRef.current?.click()}
                  disabled={isImporting}
                >
                  {isImporting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileUp className="w-4 h-4 mr-2" />
                  )}
                  {isImporting ? "Parsing..." : "Import Resume"}
                </Button>
              </div>
            </div>
          </div>

          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info" className="gap-2">
                <FileText className="w-4 h-4" /> Info
              </TabsTrigger>
              <TabsTrigger value="design" className="gap-2">
                <Settings className="w-4 h-4" /> Design
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2 lg:hidden">
                <Eye className="w-4 h-4" /> Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-6 mt-6">
              {/* Profile Image */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Profile Photo</h3>
                <div className="flex items-center gap-4">
                  <div
                    className={`w-20 h-20 bg-muted rounded-${imageShape === "circle" ? "full" : "lg"} overflow-hidden flex items-center justify-center`}
                  >
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <FileUser className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" /> Upload Photo
                    </Button>
                    <div className="flex items-center gap-2">
                      <Switch checked={showImage} onCheckedChange={setShowImage} />
                      <span className="text-sm">Show on resume</span>
                    </div>
                  </div>
                </div>
                {profileImage && (
                  <div className="flex gap-4">
                    <Select value={imagePosition} onValueChange={(v: "left" | "right") => setImagePosition(v)}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={imageShape} onValueChange={(v: "square" | "circle") => setImageShape(v)}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Shape" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="circle">Circle</SelectItem>
                        <SelectItem value="square">Square</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 8900" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="New York, NY" />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <Label htmlFor="summary">Professional Summary</Label>
                <Textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Brief overview of your professional background and goals..."
                  className="min-h-[80px]"
                />
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input id="skills" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="JavaScript, React, Node.js, Project Management" />
              </div>

              {/* Experience */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Work Experience</h3>
                  <Button variant="outline" size="sm" onClick={addExperience}>
                    <Plus className="mr-2 h-4 w-4" /> Add
                  </Button>
                </div>
                {experiences.map((exp, index) => (
                  <div key={index} className="space-y-3 rounded-lg border p-4">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Experience {index + 1}</span>
                      {experiences.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeExperience(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input placeholder="Company" value={exp.company} onChange={(e) => updateExperience(index, "company", e.target.value)} />
                      <Input placeholder="Position" value={exp.position} onChange={(e) => updateExperience(index, "position", e.target.value)} />
                      <Input placeholder="Duration (e.g., 2020 - Present)" value={exp.duration} onChange={(e) => updateExperience(index, "duration", e.target.value)} />
                    </div>
                    <Textarea placeholder="Key responsibilities and achievements..." value={exp.description} onChange={(e) => updateExperience(index, "description", e.target.value)} className="min-h-[60px]" />
                  </div>
                ))}
              </div>

              {/* Education */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Education</h3>
                  <Button variant="outline" size="sm" onClick={addEducation}>
                    <Plus className="mr-2 h-4 w-4" /> Add
                  </Button>
                </div>
                {education.map((edu, index) => (
                  <div key={index} className="space-y-3 rounded-lg border p-4">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Education {index + 1}</span>
                      {education.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeEducation(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Input placeholder="Institution" value={edu.institution} onChange={(e) => updateEducation(index, "institution", e.target.value)} />
                      <Input placeholder="Degree" value={edu.degree} onChange={(e) => updateEducation(index, "degree", e.target.value)} />
                      <Input placeholder="Year" value={edu.year} onChange={(e) => updateEducation(index, "year", e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Sections */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications</Label>
                  <Textarea id="certifications" value={certifications} onChange={(e) => setCertifications(e.target.value)} placeholder="List your certifications..." className="min-h-[60px]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projects">Projects</Label>
                  <Textarea id="projects" value={projects} onChange={(e) => setProjects(e.target.value)} placeholder="Describe key projects..." className="min-h-[60px]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="languages">Languages</Label>
                  <Input id="languages" value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="English (Native), Spanish (Fluent)" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="design" className="space-y-6 mt-6">
              {/* Template Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Resume Template</h3>
                <TemplateSelector selected={template} onSelect={setTemplate} />
              </div>

              {/* Font Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Font</h3>
                <FontSelector selected={font} onSelect={setFont} />
              </div>

              {/* Page Size */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Page Size</h3>
                <div className="flex gap-3">
                  <Button
                    variant={pageSize === "a4" ? "default" : "outline"}
                    onClick={() => setPageSize("a4")}
                  >
                    A4
                  </Button>
                  <Button
                    variant={pageSize === "letter" ? "default" : "outline"}
                    onClick={() => setPageSize("letter")}
                  >
                    US Letter
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-6 lg:hidden">
              <div className="border rounded-lg p-4 bg-muted/30 overflow-auto max-h-[600px]">
                <div className="scale-[0.5] origin-top-left w-[200%]">
                  <ResumePreview
                    data={resumeData}
                    template={template}
                    font={font}
                    pageSize={pageSize}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Export Buttons */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <Button
                onClick={handleSaveDraft}
                variant="outline"
                className="flex-1"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
              {hasDraft && (
                <Button
                  onClick={clearDraft}
                  variant="ghost"
                  size="icon"
                  title="Clear saved draft"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleExportPDF}
                disabled={isExporting || !fullName.trim()}
                className="flex-1"
                size="lg"
              >
                {isExporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download PDF
              </Button>
              <Button
                onClick={handleExportWord}
                disabled={isExporting || !fullName.trim()}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                {isExporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                Download Word
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" /> Live Preview
            </h3>
            <div className="border rounded-lg bg-muted/30 p-4 overflow-auto max-h-[800px]">
              <div className="scale-[0.45] origin-top-left" style={{ width: "220%" }}>
                <ResumePreview
                  data={resumeData}
                  template={template}
                  font={font}
                  pageSize={pageSize}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden full-size preview for PDF export */}
      <div 
        style={{ 
          position: 'absolute', 
          left: '-9999px', 
          top: 0,
          width: '794px',
          overflow: 'visible',
        }}
        aria-hidden="true"
      >
        <ResumePreview
          ref={resumeRef}
          id="resume-preview"
          data={resumeData}
          template={template}
          font={font}
          pageSize={pageSize}
        />
      </div>

        <ToolSEOContent {...seoContent} />
      </ToolLayout>
    </>
  );
}
