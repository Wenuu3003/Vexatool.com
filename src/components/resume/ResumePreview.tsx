import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { templateConfig, fontConfig, TemplateType, FontFamily } from "./ResumeTemplates";

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

interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  experiences: Experience[];
  education: Education[];
  certifications: string;
  projects: string;
  languages: string;
  profileImage: string | null;
  imagePosition: "left" | "right";
  imageShape: "square" | "circle";
  showImage: boolean;
}

interface ResumePreviewProps {
  data: ResumeData;
  template: TemplateType;
  font: FontFamily;
  pageSize: "a4" | "letter";
}

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ data, template, font, pageSize }, ref) => {
    const config = templateConfig[template];
    const fontClass = fontConfig[font].className;

    const pageDimensions = pageSize === "a4" 
      ? "w-[210mm] min-h-[297mm]" 
      : "w-[8.5in] min-h-[11in]";

    return (
      <div
        ref={ref}
        id="resume-preview"
        className={cn(
          "bg-white text-gray-900 shadow-lg mx-auto print:shadow-none",
          fontClass,
          pageDimensions
        )}
        style={{ fontSize: "11pt", lineHeight: "1.4" }}
      >
        {/* Header */}
        <div className={cn("p-6", config.headerBg, config.headerText)}>
          <div className="flex items-start gap-4">
            {data.showImage && data.profileImage && (
              <div
                className={cn(
                  "flex-shrink-0 w-20 h-20 overflow-hidden bg-white/20",
                  data.imageShape === "circle" ? "rounded-full" : "rounded-lg",
                  data.imagePosition === "right" ? "order-2 ml-auto" : ""
                )}
              >
                <img
                  src={data.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className={cn("flex-1", data.imagePosition === "right" && data.showImage && data.profileImage ? "" : "")}>
              <h1 className="text-2xl font-bold">{data.fullName || "Your Name"}</h1>
              <div className="flex flex-wrap gap-3 mt-2 text-sm opacity-90">
                {data.email && <span>{data.email}</span>}
                {data.phone && <span>• {data.phone}</span>}
                {data.location && <span>• {data.location}</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Summary */}
          {data.summary && (
            <section className={config.sectionStyle}>
              <h2 className={cn("text-lg font-semibold mb-2", config.accentColor)}>
                Professional Summary
              </h2>
              <p className="text-gray-700">{data.summary}</p>
            </section>
          )}

          {/* Skills */}
          {data.skills.length > 0 && data.skills[0] && (
            <section className={config.sectionStyle}>
              <h2 className={cn("text-lg font-semibold mb-2", config.accentColor)}>
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.skills.filter(Boolean).map((skill, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Experience */}
          {data.experiences.some(e => e.company || e.position) && (
            <section className={config.sectionStyle}>
              <h2 className={cn("text-lg font-semibold mb-3", config.accentColor)}>
                Work Experience
              </h2>
              <div className="space-y-4">
                {data.experiences
                  .filter(e => e.company || e.position)
                  .map((exp, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                          <p className="text-gray-600">{exp.company}</p>
                        </div>
                        {exp.duration && (
                          <span className="text-sm text-gray-500">{exp.duration}</span>
                        )}
                      </div>
                      {exp.description && (
                        <p className="mt-1 text-gray-700 text-sm">{exp.description}</p>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* Education */}
          {data.education.some(e => e.institution || e.degree) && (
            <section className={config.sectionStyle}>
              <h2 className={cn("text-lg font-semibold mb-3", config.accentColor)}>
                Education
              </h2>
              <div className="space-y-3">
                {data.education
                  .filter(e => e.institution || e.degree)
                  .map((edu, i) => (
                    <div key={i} className="flex justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                        <p className="text-gray-600">{edu.institution}</p>
                      </div>
                      {edu.year && (
                        <span className="text-sm text-gray-500">{edu.year}</span>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {data.certifications && (
            <section className={config.sectionStyle}>
              <h2 className={cn("text-lg font-semibold mb-2", config.accentColor)}>
                Certifications
              </h2>
              <p className="text-gray-700">{data.certifications}</p>
            </section>
          )}

          {/* Projects */}
          {data.projects && (
            <section className={config.sectionStyle}>
              <h2 className={cn("text-lg font-semibold mb-2", config.accentColor)}>
                Projects
              </h2>
              <p className="text-gray-700">{data.projects}</p>
            </section>
          )}

          {/* Languages */}
          {data.languages && (
            <section className={config.sectionStyle}>
              <h2 className={cn("text-lg font-semibold mb-2", config.accentColor)}>
                Languages
              </h2>
              <p className="text-gray-700">{data.languages}</p>
            </section>
          )}
        </div>
      </div>
    );
  }
);

ResumePreview.displayName = "ResumePreview";
