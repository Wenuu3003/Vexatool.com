import { useState, useRef } from "react";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TemplateSelector, FontSelector, TemplateType, FontFamily } from "@/components/resume/ResumeTemplates";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { exportToPDF, exportToWord } from "@/lib/resumeExport";
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
  const { toast } = useToast();
  const resumeRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    whatIs: "AI Resume Builder is a professional tool that helps you create polished, ATS-friendly resumes with multiple templates and customization options. It provides a live preview as you build your resume, supports profile photos, multiple template designs, and font choices. Download your completed resume as PDF or Word document, ready to submit to employers. Perfect for job seekers, career changers, and anyone who wants to create a standout resume without design skills.",
    howToUse: [
      "Fill in your personal information: name, email, phone, and location.",
      "Add your professional summary, skills, work experience, and education.",
      "Optionally upload a profile photo and adjust image settings.",
      "Choose your preferred template and font from the Design tab.",
      "Preview your resume in real-time and make adjustments.",
      "Download as PDF or Word document when you're satisfied."
    ],
    features: [
      "Multiple professional resume templates: Modern, Classic, Minimal, Creative.",
      "Live preview that updates as you type.",
      "Profile photo support with position and shape options.",
      "Multiple font choices for personalization.",
      "A4 and US Letter page size options.",
      "Export to PDF or Word (.docx) formats.",
      "ATS-friendly formatting for applicant tracking systems."
    ],
    safetyNote: "All resume data is processed locally in your browser. Your personal information is never stored on our servers. The resume you create stays completely private until you choose to download and share it.",
    faqs: [
      {
        question: "What is ATS-friendly formatting?",
        answer: "ATS (Applicant Tracking System) is software used by employers to scan resumes. ATS-friendly formatting uses clear headings, standard sections, and readable fonts that these systems can parse correctly, increasing your chances of passing initial screening."
      },
      {
        question: "Should I include a photo on my resume?",
        answer: "This depends on your location and industry. In the US, photos are typically not recommended due to potential bias concerns. In Europe and some other regions, photos are more common. The tool gives you the option to include or exclude photos based on your preference."
      },
      {
        question: "Which format should I download: PDF or Word?",
        answer: "PDF is best for preserving formatting exactly as designed. Word (.docx) is useful if you need to make quick edits or if an employer specifically requests it. We recommend having both versions ready."
      },
      {
        question: "Can I edit my resume after downloading?",
        answer: "The Word format can be edited in Microsoft Word or Google Docs. For PDF, you would need to use this tool again or a PDF editor. We recommend saving your information to easily recreate or update your resume."
      }
    ]
  };

  return (
    <>
      <CanonicalHead 
        title="AI Resume Builder Free Online - Create Professional Resumes | MyPDFs"
        description="Free AI resume builder with professional templates. Create ATS-friendly resumes with live preview."
        keywords="resume builder, CV maker, professional resume, ATS resume, free resume, resume templates"
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

        {/* Right: Live Preview */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" /> Live Preview
            </h3>
            <div className="border rounded-lg bg-muted/30 p-4 overflow-auto max-h-[800px]">
              <div className="scale-[0.45] origin-top-left" style={{ width: "220%" }}>
                <ResumePreview
                  ref={resumeRef}
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
        <ToolSEOContent {...seoContent} />
      </ToolLayout>
    </>
  );
}
