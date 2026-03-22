/**
 * Parse tables and structured content from DOCX files.
 * Extracts actual <w:tbl> table elements rather than dumping raw text.
 */
import JSZip from "jszip";

export interface DocxTable {
  rows: string[][];
}

export interface DocxContent {
  tables: DocxTable[];
  paragraphs: string[];
}

/**
 * Extract text from a w:r run element.
 */
function extractRunText(runXml: string): string {
  const textMatches = runXml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
  return textMatches.map(t => t.replace(/<[^>]+>/g, "")).join("");
}

/**
 * Extract text from a w:p paragraph element.
 */
function extractParagraphText(paraXml: string): string {
  const runs = paraXml.match(/<w:r[\s>][\s\S]*?<\/w:r>/g) || [];
  return runs.map(extractRunText).join("").trim();
}

/**
 * Parse a <w:tbl> element into rows and cells.
 */
function parseTable(tableXml: string): DocxTable {
  const rows: string[][] = [];
  const rowMatches = tableXml.match(/<w:tr[\s>][\s\S]*?<\/w:tr>/g) || [];

  for (const rowXml of rowMatches) {
    const cellMatches = rowXml.match(/<w:tc[\s>][\s\S]*?<\/w:tc>/g) || [];
    const cellTexts: string[] = [];

    for (const cellXml of cellMatches) {
      // Each cell can have multiple paragraphs
      const paraMatches = cellXml.match(/<w:p[\s>][\s\S]*?<\/w:p>/g) || [];
      const cellText = paraMatches.map(extractParagraphText).filter(Boolean).join("\n");
      cellTexts.push(cellText);
    }

    if (cellTexts.length > 0) {
      rows.push(cellTexts);
    }
  }

  return { rows };
}

/**
 * Parse a DOCX file and extract tables + paragraph content.
 */
export async function parseDocxContent(file: File): Promise<DocxContent> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  const docXml = await zip.file("word/document.xml")?.async("text");

  if (!docXml) {
    throw new Error("Could not read document.xml from DOCX file");
  }

  const tables: DocxTable[] = [];
  const paragraphs: string[] = [];

  // Find all tables and paragraphs in document order
  // We'll process the body content sequentially
  const bodyMatch = docXml.match(/<w:body>([\s\S]*)<\/w:body>/);
  if (!bodyMatch) {
    throw new Error("Could not find document body");
  }

  const body = bodyMatch[1];

  // Extract tables first
  const tableMatches = body.match(/<w:tbl[\s>][\s\S]*?<\/w:tbl>/g) || [];
  for (const tableXml of tableMatches) {
    const parsed = parseTable(tableXml);
    if (parsed.rows.length > 0) {
      tables.push(parsed);
    }
  }

  // Extract paragraphs that are NOT inside tables
  let bodyWithoutTables = body;
  for (const tableXml of tableMatches) {
    bodyWithoutTables = bodyWithoutTables.replace(tableXml, "\n__TABLE_PLACEHOLDER__\n");
  }

  const paraMatches = bodyWithoutTables.match(/<w:p[\s>][\s\S]*?<\/w:p>/g) || [];
  for (const paraXml of paraMatches) {
    const text = extractParagraphText(paraXml);
    if (text) {
      paragraphs.push(text);
    }
  }

  return { tables, paragraphs };
}

/**
 * Extract text content from legacy .doc files or as fallback.
 */
export async function extractDocText(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".txt")) {
    return await file.text();
  }

  if (fileName.endsWith(".docx")) {
    try {
      const content = await parseDocxContent(file);
      const parts: string[] = [];

      // Rebuild text with tables as tab-separated
      for (const para of content.paragraphs) {
        parts.push(para);
      }
      for (const table of content.tables) {
        for (const row of table.rows) {
          parts.push(row.join("\t"));
        }
      }
      return parts.join("\n");
    } catch {
      // Fallback to raw XML text extraction
    }
  }

  // .doc or fallback: byte scanning
  const bytes = new Uint8Array(await file.arrayBuffer());
  let extracted = "";
  for (let i = 0; i < bytes.length; i++) {
    const c = bytes[i];
    if ((c >= 32 && c <= 126) || c === 10 || c === 13 || c === 9) {
      extracted += String.fromCharCode(c);
    }
  }
  return extracted.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
}
