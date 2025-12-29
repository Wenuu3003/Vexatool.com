import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileUser, Loader2, Download, Copy, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const [experiences, setExperiences] = useState<Experience[]>([
    { company: "", position: "", duration: "", description: "" },
  ]);
  const [education, setEducation] = useState<Education[]>([
    { institution: "", degree: "", year: "" },
  ]);
  const [generatedResume, setGeneratedResume] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  const handleGenerate = async () => {
    if (!fullName.trim()) {
      toast({ title: "Name required", description: "Please enter your full name.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setGeneratedResume("");

    try {
      const resumeData = {
        fullName,
        email,
        phone,
        location,
        summary,
        skills: skills.split(",").map(s => s.trim()).filter(Boolean),
        experiences: experiences.filter(e => e.company || e.position),
        education: education.filter(e => e.institution || e.degree),
      };

      const systemPrompt = `You are a professional resume writer. Create a polished, ATS-friendly resume based on the provided information. Format it clearly with sections for Contact Info, Professional Summary, Skills, Experience, and Education. Use bullet points for achievements. Make it professional and impactful.`;

      const response = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Create a professional resume with this data: ${JSON.stringify(resumeData)}` },
          ],
        },
      });

      if (response.error) throw new Error(response.error.message || "Request failed");

      const data = response.data;
      if (data?.response) {
        setGeneratedResume(data.response);
      } else if (data?.error) {
        throw new Error(data.error);
      } else {
        throw new Error("No response received");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedResume) return;
    await navigator.clipboard.writeText(generatedResume);
    toast({ title: "Copied!", description: "Resume copied to clipboard." });
  };

  const handleDownload = () => {
    if (!generatedResume) return;
    const blob = new Blob([generatedResume], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fullName.replace(/\s+/g, "_")}_Resume.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout
      title="AI Resume Builder"
      description="Create professional, ATS-friendly resumes with AI. Fill in your details and get a polished resume in seconds."
      icon={FileUser}
      colorClass="bg-gradient-to-br from-emerald-500 to-teal-500"
      category="AI Tools"
    >
      <div className="space-y-8">
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

        <Button onClick={handleGenerate} disabled={isLoading || !fullName.trim()} className="w-full" size="lg">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Resume...
            </>
          ) : (
            <>
              <FileUser className="mr-2 h-4 w-4" /> Generate Resume
            </>
          )}
        </Button>

        {generatedResume && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Generated Resume</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
              </div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4 whitespace-pre-wrap text-sm leading-relaxed max-h-[500px] overflow-y-auto">
              {generatedResume}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
