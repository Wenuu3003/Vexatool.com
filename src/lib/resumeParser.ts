import * as pdfjs from "pdfjs-dist";
import JSZip from "jszip";

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface ParsedResume {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  experiences: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
  }>;
  certifications: string;
  projects: string;
  languages: string;
}

// Email regex
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Phone regex (various formats)
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;

// Section headers to detect
const SECTION_HEADERS = {
  summary: /(?:summary|profile|objective|about\s*me|professional\s*summary)/i,
  experience: /(?:experience|work\s*history|employment|professional\s*experience|work\s*experience)/i,
  education: /(?:education|academic|qualifications|degrees)/i,
  skills: /(?:skills|technical\s*skills|expertise|competencies|technologies)/i,
  certifications: /(?:certifications?|licenses?|credentials)/i,
  projects: /(?:projects?|portfolio|work\s*samples)/i,
  languages: /(?:languages?|linguistic)/i,
};

function extractEmail(text: string): string {
  const matches = text.match(EMAIL_REGEX);
  return matches?.[0] || "";
}

function extractPhone(text: string): string {
  const matches = text.match(PHONE_REGEX);
  if (!matches) return "";
  // Filter out years (4 digits starting with 19 or 20)
  const phones = matches.filter(m => !m.match(/^(19|20)\d{2}$/));
  return phones[0]?.trim() || "";
}

function extractName(lines: string[]): string {
  // Usually the first non-empty line is the name
  for (const line of lines.slice(0, 5)) {
    const trimmed = line.trim();
    if (trimmed && trimmed.length > 2 && trimmed.length < 50) {
      // Skip if it looks like a header or contains email/phone
      if (!trimmed.match(EMAIL_REGEX) && !trimmed.match(PHONE_REGEX)) {
        // Skip common header words
        if (!trimmed.match(/^(resume|cv|curriculum\s*vitae)$/i)) {
          return trimmed;
        }
      }
    }
  }
  return "";
}

function extractLocation(text: string): string {
  // Look for city, state/country patterns
  const locationPatterns = [
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2})/,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
  ];
  
  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return "";
}

function parseSkills(text: string): string[] {
  // Split by common delimiters
  const skills = text
    .split(/[,•|·\n]/)
    .map(s => s.trim())
    .filter(s => s.length > 1 && s.length < 50);
  
  return skills.slice(0, 20);
}

function parseSections(text: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const lines = text.split('\n');
  let currentSection = 'header';
  let currentContent: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Check if this line is a section header
    let foundSection = false;
    for (const [key, regex] of Object.entries(SECTION_HEADERS)) {
      if (regex.test(trimmed) && trimmed.length < 40) {
        // Save previous section
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        currentSection = key;
        currentContent = [];
        foundSection = true;
        break;
      }
    }
    
    if (!foundSection) {
      currentContent.push(line);
    }
  }
  
  // Save last section
  if (currentContent.length > 0) {
    sections[currentSection] = currentContent.join('\n').trim();
  }
  
  return sections;
}

function parseExperience(text: string): ParsedResume['experiences'] {
  const experiences: ParsedResume['experiences'] = [];
  const lines = text.split('\n').filter(l => l.trim());
  
  let current: ParsedResume['experiences'][0] | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for date patterns (e.g., "2020 - Present", "Jan 2020 - Dec 2023")
    const datePattern = /(\d{4}|\w+\s+\d{4})\s*[-–—to]+\s*(\d{4}|present|current|\w+\s+\d{4})/i;
    const dateMatch = line.match(datePattern);
    
    if (dateMatch) {
      // This line likely contains job info
      if (current && (current.company || current.position)) {
        experiences.push(current);
      }
      
      current = {
        company: "",
        position: "",
        duration: dateMatch[0],
        description: "",
      };
      
      // Remove date from line to get position/company
      const remaining = line.replace(datePattern, '').trim();
      if (remaining) {
        // Usually position comes before company
        const parts = remaining.split(/\s+at\s+|\s*[-–—|]\s*/i);
        if (parts.length >= 2) {
          current.position = parts[0].trim();
          current.company = parts[1].trim();
        } else {
          current.position = remaining;
        }
      }
    } else if (current) {
      // This is description text
      if (!current.position && line.length < 60 && !line.match(/^[•\-\*]/)) {
        if (!current.company) {
          current.company = line;
        } else {
          current.position = line;
        }
      } else {
        current.description += (current.description ? ' ' : '') + line.replace(/^[•\-\*]\s*/, '');
      }
    }
  }
  
  if (current && (current.company || current.position)) {
    experiences.push(current);
  }
  
  return experiences.slice(0, 5);
}

function parseEducation(text: string): ParsedResume['education'] {
  const education: ParsedResume['education'] = [];
  const lines = text.split('\n').filter(l => l.trim());
  
  let current: ParsedResume['education'][0] | null = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Look for year patterns
    const yearMatch = trimmed.match(/\b(19|20)\d{2}\b/);
    
    // Look for degree keywords
    const degreeKeywords = /\b(bachelor|master|phd|doctorate|associate|diploma|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?|b\.?e\.?|m\.?b\.?a\.?|b\.?tech|m\.?tech)\b/i;
    
    if (degreeKeywords.test(trimmed) || yearMatch) {
      if (current && (current.institution || current.degree)) {
        education.push(current);
      }
      
      current = {
        institution: "",
        degree: "",
        year: yearMatch ? yearMatch[0] : "",
      };
      
      if (degreeKeywords.test(trimmed)) {
        current.degree = trimmed.replace(/\b(19|20)\d{2}\b/, '').trim();
      } else {
        current.institution = trimmed.replace(/\b(19|20)\d{2}\b/, '').trim();
      }
    } else if (current) {
      if (!current.institution && trimmed.length > 3) {
        current.institution = trimmed;
      } else if (!current.degree && trimmed.length > 3) {
        current.degree = trimmed;
      }
    }
  }
  
  if (current && (current.institution || current.degree)) {
    education.push(current);
  }
  
  return education.slice(0, 3);
}

export async function parseResumeFromPDF(file: File): Promise<ParsedResume> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = "";
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }
  
  return parseResumeText(fullText);
}

export async function parseResumeFromWord(file: File): Promise<ParsedResume> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = new JSZip();
  const docx = await zip.loadAsync(arrayBuffer);
  
  // Extract text from document.xml
  const documentXml = await docx.file('word/document.xml')?.async('text');
  if (!documentXml) {
    throw new Error("Could not read Word document content");
  }
  
  // Parse XML and extract text
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(documentXml, 'text/xml');
  
  // Extract all text nodes
  const textNodes = xmlDoc.getElementsByTagName('w:t');
  let fullText = "";
  
  for (let i = 0; i < textNodes.length; i++) {
    fullText += textNodes[i].textContent + ' ';
  }
  
  // Also check for paragraphs to add line breaks
  const paragraphs = xmlDoc.getElementsByTagName('w:p');
  let structuredText = "";
  
  for (let i = 0; i < paragraphs.length; i++) {
    const texts = paragraphs[i].getElementsByTagName('w:t');
    let paragraphText = "";
    for (let j = 0; j < texts.length; j++) {
      paragraphText += texts[j].textContent || '';
    }
    if (paragraphText.trim()) {
      structuredText += paragraphText.trim() + '\n';
    }
  }
  
  return parseResumeText(structuredText || fullText);
}

function parseResumeText(text: string): ParsedResume {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const sections = parseSections(text);
  
  const result: ParsedResume = {
    fullName: extractName(lines),
    email: extractEmail(text),
    phone: extractPhone(text),
    location: extractLocation(text),
    summary: "",
    skills: [],
    experiences: [],
    education: [],
    certifications: "",
    projects: "",
    languages: "",
  };
  
  // Parse sections
  if (sections.summary) {
    result.summary = sections.summary.substring(0, 500);
  }
  
  if (sections.skills) {
    result.skills = parseSkills(sections.skills);
  }
  
  if (sections.experience) {
    result.experiences = parseExperience(sections.experience);
  }
  
  if (sections.education) {
    result.education = parseEducation(sections.education);
  }
  
  if (sections.certifications) {
    result.certifications = sections.certifications.substring(0, 300);
  }
  
  if (sections.projects) {
    result.projects = sections.projects.substring(0, 500);
  }
  
  if (sections.languages) {
    result.languages = sections.languages.substring(0, 200);
  }
  
  // Ensure at least one experience and education entry
  if (result.experiences.length === 0) {
    result.experiences = [{ company: "", position: "", duration: "", description: "" }];
  }
  
  if (result.education.length === 0) {
    result.education = [{ institution: "", degree: "", year: "" }];
  }
  
  return result;
}

export function parseResumeFile(file: File): Promise<ParsedResume> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (extension === 'pdf') {
    return parseResumeFromPDF(file);
  } else if (extension === 'docx') {
    return parseResumeFromWord(file);
  } else {
    throw new Error("Unsupported file format. Please upload a PDF or Word (.docx) file.");
  }
}
