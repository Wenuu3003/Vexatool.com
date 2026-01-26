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
  id?: string;
}

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ data, template, font, pageSize, id }, ref) => {
    const config = templateConfig[template];
    const fontClass = fontConfig[font].className;

    // Fixed pixel dimensions for consistent PDF rendering
    // A4: 210mm x 297mm = 794px x 1123px at 96dpi
    const pageDimensions = pageSize === "a4" 
      ? { width: 794, minHeight: 1123 }
      : { width: 816, minHeight: 1056 }; // Letter: 8.5in x 11in

    return (
      <div
        ref={ref}
        id={id}
        className={cn(
          "bg-white text-gray-900 shadow-lg mx-auto print:shadow-none",
          fontClass
        )}
        style={{ 
          width: `${pageDimensions.width}px`,
          minHeight: `${pageDimensions.minHeight}px`,
          maxWidth: '100%',
          fontSize: "11pt", 
          lineHeight: "1.5",
          boxSizing: "border-box",
          transform: 'none',
        }}
      >
        {/* Header */}
        <div 
          className={cn("p-6", config.headerBg, config.headerText)}
          style={{ pageBreakInside: 'avoid' }}
        >
          <div className={cn(
            "flex items-start gap-4",
            data.imagePosition === "right" ? "flex-row-reverse" : "flex-row"
          )}>
            {data.showImage && data.profileImage && (
              <div
                className={cn(
                  "flex-shrink-0 overflow-hidden bg-white/20",
                  data.imageShape === "circle" ? "rounded-full" : "rounded-lg"
                )}
                style={{ width: 80, height: 80 }}
              >
                <img
                  src={data.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 
                className="text-2xl font-bold break-words"
                style={{ fontSize: '24pt', lineHeight: 1.2, margin: 0 }}
              >
                {data.fullName || "Your Name"}
              </h1>
              <div 
                className="flex flex-wrap gap-x-3 gap-y-1 mt-2 opacity-90"
                style={{ fontSize: '10pt' }}
              >
                {data.email && <span>{data.email}</span>}
                {data.phone && (
                  <>
                    {data.email && <span>•</span>}
                    <span>{data.phone}</span>
                  </>
                )}
                {data.location && (
                  <>
                    {(data.email || data.phone) && <span>•</span>}
                    <span>{data.location}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6" style={{ paddingTop: 20, paddingBottom: 20 }}>
          {/* Summary */}
          {data.summary && (
            <section className={cn(config.sectionStyle, "mb-5")} style={{ pageBreakInside: 'avoid' }}>
              <h2 
                className={cn("font-semibold mb-2", config.accentColor)}
                style={{ fontSize: '14pt', margin: '0 0 8px 0' }}
              >
                Professional Summary
              </h2>
              <p className="text-gray-700" style={{ fontSize: '11pt', margin: 0, lineHeight: 1.5 }}>
                {data.summary}
              </p>
            </section>
          )}

          {/* Skills */}
          {data.skills.length > 0 && data.skills[0] && (
            <section className={cn(config.sectionStyle, "mb-5")} style={{ pageBreakInside: 'avoid' }}>
              <h2 
                className={cn("font-semibold mb-2", config.accentColor)}
                style={{ fontSize: '14pt', margin: '0 0 8px 0' }}
              >
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.skills.filter(Boolean).map((skill, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-gray-100 rounded text-gray-700"
                    style={{ fontSize: '10pt', display: 'inline-block' }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Experience */}
          {data.experiences.some(e => e.company || e.position) && (
            <section className={cn(config.sectionStyle, "mb-5")}>
              <h2 
                className={cn("font-semibold mb-3", config.accentColor)}
                style={{ fontSize: '14pt', margin: '0 0 12px 0' }}
              >
                Work Experience
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {data.experiences
                  .filter(e => e.company || e.position)
                  .map((exp, i) => (
                    <div key={i} style={{ pageBreakInside: 'avoid' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 className="font-semibold text-gray-900" style={{ fontSize: '12pt', margin: 0 }}>
                            {exp.position}
                          </h3>
                          <p className="text-gray-600" style={{ fontSize: '11pt', margin: 0 }}>
                            {exp.company}
                          </p>
                        </div>
                        {exp.duration && (
                          <span className="text-gray-500" style={{ fontSize: '10pt', flexShrink: 0 }}>
                            {exp.duration}
                          </span>
                        )}
                      </div>
                      {exp.description && (
                        <p className="mt-1 text-gray-700" style={{ fontSize: '10pt', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* Education */}
          {data.education.some(e => e.institution || e.degree) && (
            <section className={cn(config.sectionStyle, "mb-5")}>
              <h2 
                className={cn("font-semibold mb-3", config.accentColor)}
                style={{ fontSize: '14pt', margin: '0 0 12px 0' }}
              >
                Education
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.education
                  .filter(e => e.institution || e.degree)
                  .map((edu, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, pageBreakInside: 'avoid' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 className="font-semibold text-gray-900" style={{ fontSize: '12pt', margin: 0 }}>
                          {edu.degree}
                        </h3>
                        <p className="text-gray-600" style={{ fontSize: '11pt', margin: 0 }}>
                          {edu.institution}
                        </p>
                      </div>
                      {edu.year && (
                        <span className="text-gray-500" style={{ fontSize: '10pt', flexShrink: 0 }}>
                          {edu.year}
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {data.certifications && (
            <section className={cn(config.sectionStyle, "mb-5")} style={{ pageBreakInside: 'avoid' }}>
              <h2 
                className={cn("font-semibold mb-2", config.accentColor)}
                style={{ fontSize: '14pt', margin: '0 0 8px 0' }}
              >
                Certifications
              </h2>
              <p className="text-gray-700" style={{ fontSize: '11pt', margin: 0, lineHeight: 1.5 }}>
                {data.certifications}
              </p>
            </section>
          )}

          {/* Projects */}
          {data.projects && (
            <section className={cn(config.sectionStyle, "mb-5")} style={{ pageBreakInside: 'avoid' }}>
              <h2 
                className={cn("font-semibold mb-2", config.accentColor)}
                style={{ fontSize: '14pt', margin: '0 0 8px 0' }}
              >
                Projects
              </h2>
              <p className="text-gray-700" style={{ fontSize: '11pt', margin: 0, lineHeight: 1.5 }}>
                {data.projects}
              </p>
            </section>
          )}

          {/* Languages */}
          {data.languages && (
            <section className={cn(config.sectionStyle, "mb-5")} style={{ pageBreakInside: 'avoid' }}>
              <h2 
                className={cn("font-semibold mb-2", config.accentColor)}
                style={{ fontSize: '14pt', margin: '0 0 8px 0' }}
              >
                Languages
              </h2>
              <p className="text-gray-700" style={{ fontSize: '11pt', margin: 0, lineHeight: 1.5 }}>
                {data.languages}
              </p>
            </section>
          )}
        </div>
      </div>
    );
  }
);

ResumePreview.displayName = "ResumePreview";
