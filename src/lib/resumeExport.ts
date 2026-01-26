import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from "docx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
  profileImage?: string | null;
}

export const exportToPDF = async (elementId: string, filename: string): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) throw new Error("Resume preview element not found");

  // A4 dimensions in pixels at 96dpi
  const A4_WIDTH_PX = 794;
  const A4_HEIGHT_PX = 1123;

  // Wait for fonts and images to load
  await document.fonts.ready;
  
  // Wait for any images to load
  const images = element.querySelectorAll('img');
  await Promise.all(
    Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    })
  );
  
  // Short delay for layout stabilization
  await new Promise(resolve => setTimeout(resolve, 200));

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: A4_WIDTH_PX,
      height: Math.max(element.scrollHeight, A4_HEIGHT_PX),
      windowWidth: A4_WIDTH_PX,
      imageTimeout: 5000,
      removeContainer: true,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          // Remove any transforms that might affect rendering
          clonedElement.style.transform = 'none';
          clonedElement.style.position = 'relative';
          clonedElement.style.overflow = 'visible';
          clonedElement.style.width = `${A4_WIDTH_PX}px`;
          clonedElement.style.maxWidth = `${A4_WIDTH_PX}px`;
          clonedElement.style.minWidth = `${A4_WIDTH_PX}px`;
          
          // Replace CSS gradients with solid colors for html2canvas compatibility
          const elementsWithGradients = clonedElement.querySelectorAll('[class*="bg-gradient"]');
          elementsWithGradients.forEach((el) => {
            const htmlEl = el as HTMLElement;
            const className = htmlEl.className;
            
            // Map gradient classes to solid fallback colors
            if (className.includes('from-pink')) {
              htmlEl.style.background = '#ec4899';
            } else if (className.includes('from-amber')) {
              htmlEl.style.background = '#b45309';
            } else if (className.includes('from-cyan')) {
              htmlEl.style.background = '#0891b2';
            } else if (className.includes('from-emerald')) {
              htmlEl.style.background = '#047857';
            } else if (className.includes('from-blue')) {
              htmlEl.style.background = '#2563eb';
            } else if (className.includes('from-gray') || className.includes('from-slate')) {
              htmlEl.style.background = '#475569';
            } else if (className.includes('from-purple')) {
              htmlEl.style.background = '#7c3aed';
            } else {
              htmlEl.style.background = '#3b82f6';
            }
            htmlEl.style.backgroundImage = 'none';
          });
          
          // Fix flex issues
          const allElements = clonedElement.querySelectorAll('*');
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            const computed = window.getComputedStyle(htmlEl);
            if (computed.display === 'flex') {
              htmlEl.style.flexWrap = 'wrap';
            }
          });
        }
      }
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);

    // Handle multi-page if content is longer than one page
    let heightLeft = imgHeight;
    let position = 0;
    let pageCount = 0;

    while (heightLeft > 0) {
      if (pageCount > 0) {
        pdf.addPage();
      }
      
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      position -= pageHeight;
      pageCount++;
      
      // Safety limit
      if (pageCount > 10) break;
    }

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error("PDF export error:", error);
    throw new Error("Failed to generate PDF. Please try again.");
  }
};

export const exportToWord = async (data: ResumeData, filename: string): Promise<void> => {
  const children: Paragraph[] = [];

  // Header - Name
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: data.fullName,
          bold: true,
          size: 48,
          color: "2563EB",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    })
  );

  // Contact Info
  const contactParts = [data.email, data.phone, data.location].filter(Boolean);
  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contactParts.join(" | "),
            size: 22,
            color: "666666",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      })
    );
  }

  // Summary
  if (data.summary) {
    children.push(
      new Paragraph({
        text: "PROFESSIONAL SUMMARY",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        border: {
          bottom: { color: "2563EB", size: 6, style: BorderStyle.SINGLE },
        },
      }),
      new Paragraph({
        text: data.summary,
        spacing: { after: 200 },
      })
    );
  }

  // Skills
  if (data.skills.length > 0 && data.skills[0]) {
    children.push(
      new Paragraph({
        text: "SKILLS",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        border: {
          bottom: { color: "2563EB", size: 6, style: BorderStyle.SINGLE },
        },
      }),
      new Paragraph({
        text: data.skills.filter(Boolean).join(" • "),
        spacing: { after: 200 },
      })
    );
  }

  // Experience
  const validExperiences = data.experiences.filter(e => e.company || e.position);
  if (validExperiences.length > 0) {
    children.push(
      new Paragraph({
        text: "WORK EXPERIENCE",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        border: {
          bottom: { color: "2563EB", size: 6, style: BorderStyle.SINGLE },
        },
      })
    );

    validExperiences.forEach((exp) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.position, bold: true, size: 24 }),
            new TextRun({ text: exp.duration ? ` (${exp.duration})` : "", size: 22, color: "666666" }),
          ],
          spacing: { before: 100 },
        }),
        new Paragraph({
          text: exp.company,
          spacing: { after: 50 },
          run: { italics: true, color: "444444" },
        })
      );
      if (exp.description) {
        children.push(
          new Paragraph({
            text: exp.description,
            spacing: { after: 100 },
          })
        );
      }
    });
  }

  // Education
  const validEducation = data.education.filter(e => e.institution || e.degree);
  if (validEducation.length > 0) {
    children.push(
      new Paragraph({
        text: "EDUCATION",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        border: {
          bottom: { color: "2563EB", size: 6, style: BorderStyle.SINGLE },
        },
      })
    );

    validEducation.forEach((edu) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.degree, bold: true, size: 24 }),
            new TextRun({ text: edu.year ? ` (${edu.year})` : "", size: 22, color: "666666" }),
          ],
          spacing: { before: 100 },
        }),
        new Paragraph({
          text: edu.institution,
          spacing: { after: 100 },
          run: { italics: true },
        })
      );
    });
  }

  // Certifications
  if (data.certifications) {
    children.push(
      new Paragraph({
        text: "CERTIFICATIONS",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        border: {
          bottom: { color: "2563EB", size: 6, style: BorderStyle.SINGLE },
        },
      }),
      new Paragraph({
        text: data.certifications,
        spacing: { after: 200 },
      })
    );
  }

  // Projects
  if (data.projects) {
    children.push(
      new Paragraph({
        text: "PROJECTS",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        border: {
          bottom: { color: "2563EB", size: 6, style: BorderStyle.SINGLE },
        },
      }),
      new Paragraph({
        text: data.projects,
        spacing: { after: 200 },
      })
    );
  }

  // Languages
  if (data.languages) {
    children.push(
      new Paragraph({
        text: "LANGUAGES",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        border: {
          bottom: { color: "2563EB", size: 6, style: BorderStyle.SINGLE },
        },
      }),
      new Paragraph({
        text: data.languages,
        spacing: { after: 200 },
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // 0.5 inch
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.docx`;
  link.click();
  URL.revokeObjectURL(url);
};
