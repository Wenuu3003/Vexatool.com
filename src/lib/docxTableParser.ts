/**
 * Parse tables and structured content from DOCX files.
 * Handles nested tables, merged cells, and complex document structures.
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
 * Extract text from a w:p paragraph element (not recursing into nested tables).
 */
function extractParagraphText(paraXml: string): string {
  // Remove any nested table content from the paragraph before extracting runs
  const cleanPara = paraXml.replace(/<w:tbl[\s>][\s\S]*?<\/w:tbl>/g, "");
  const runs = cleanPara.match(/<w:r[\s>][\s\S]*?<\/w:r>/g) || [];
  return runs.map(extractRunText).join("").trim();
}

/**
 * Find top-level XML elements by tag name using balanced matching.
 * This properly handles nested elements of the same tag.
 */
function findTopLevelElements(xml: string, tagName: string): string[] {
  const results: string[] = [];
  const openTag = `<${tagName}`;
  const closeTag = `</${tagName}>`;
  let searchStart = 0;

  while (searchStart < xml.length) {
    const openIdx = xml.indexOf(openTag, searchStart);
    if (openIdx === -1) break;

    // Verify it's a real tag (followed by space, >, or /)
    const charAfter = xml[openIdx + openTag.length];
    if (charAfter !== ' ' && charAfter !== '>' && charAfter !== '/') {
      searchStart = openIdx + 1;
      continue;
    }

    // Find the matching close tag using depth counting
    let depth = 1;
    let pos = openIdx + openTag.length;

    while (depth > 0 && pos < xml.length) {
      const nextOpen = xml.indexOf(openTag, pos);
      const nextClose = xml.indexOf(closeTag, pos);

      if (nextClose === -1) break; // malformed XML

      if (nextOpen !== -1 && nextOpen < nextClose) {
        // Check if it's a real open tag
        const nc = xml[nextOpen + openTag.length];
        if (nc === ' ' || nc === '>' || nc === '/') {
          depth++;
        }
        pos = nextOpen + openTag.length;
      } else {
        depth--;
        if (depth === 0) {
          results.push(xml.substring(openIdx, nextClose + closeTag.length));
        }
        pos = nextClose + closeTag.length;
      }
    }

    searchStart = pos;
  }

  return results;
}

/**
 * Parse a <w:tbl> element into rows and cells.
 * Handles gridSpan (horizontal merge) for column spanning.
 */
function parseTable(tableXml: string): DocxTable {
  const rows: string[][] = [];
  const rowElements = findTopLevelElements(tableXml, "w:tr");

  for (const rowXml of rowElements) {
    const cellElements = findTopLevelElements(rowXml, "w:tc");
    const cellTexts: string[] = [];

    for (const cellXml of cellElements) {
      // Check for gridSpan (merged columns)
      const gridSpanMatch = cellXml.match(/<w:gridSpan\s+w:val="(\d+)"/);
      const spanCount = gridSpanMatch ? parseInt(gridSpanMatch[1], 10) : 1;

      // Check for vMerge (vertical merge continuation - skip content)
      const vMergeMatch = cellXml.match(/<w:vMerge\s*\/>/);
      const isVMergeContinue = vMergeMatch !== null;

      // Extract paragraphs (but not from nested tables)
      const cellContent = cellXml.replace(/<w:tbl[\s>][\s\S]*?<\/w:tbl>/g, "");
      const paraMatches = findTopLevelElements(cellContent, "w:p");
      const cellText = isVMergeContinue
        ? ""
        : paraMatches.map(extractParagraphText).filter(Boolean).join("\n");

      cellTexts.push(cellText);

      // Add empty cells for spanned columns
      for (let s = 1; s < spanCount; s++) {
        cellTexts.push("");
      }
    }

    if (cellTexts.length > 0) {
      rows.push(cellTexts);
    }
  }

  return { rows };
}

/**
 * Parse a DOCX file and extract tables + paragraph content in document order.
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

  const bodyMatch = docXml.match(/<w:body>([\s\S]*)<\/w:body>/);
  if (!bodyMatch) {
    throw new Error("Could not find document body");
  }

  const body = bodyMatch[1];

  // Extract top-level tables using balanced matching
  const tableElements = findTopLevelElements(body, "w:tbl");
  for (const tableXml of tableElements) {
    const parsed = parseTable(tableXml);
    if (parsed.rows.length > 0) {
      tables.push(parsed);
    }
  }

  // Extract paragraphs that are NOT inside tables
  let bodyWithoutTables = body;
  for (const tableXml of tableElements) {
    bodyWithoutTables = bodyWithoutTables.replace(tableXml, "\n__TABLE_PLACEHOLDER__\n");
  }

  const paraElements = findTopLevelElements(bodyWithoutTables, "w:p");
  for (const paraXml of paraElements) {
    if (paraXml.includes("__TABLE_PLACEHOLDER__")) continue;
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
