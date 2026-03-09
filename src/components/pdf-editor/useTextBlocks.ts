import { useMemo } from 'react';
import { OCRTextBlock } from './useOCR';

/**
 * A merged text region that groups nearby words into a readable paragraph/line block.
 */
export interface TextRegion {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pageIndex: number;
  confidence: number;
  /** Original word-level blocks that compose this region */
  sourceBlocks: OCRTextBlock[];
}

/**
 * Groups word-level OCR/PDF text blocks into larger paragraph/line regions.
 * Words on the same line (similar Y) with close X proximity are merged.
 * Lines with close Y and overlapping X range are merged into paragraphs.
 */
function groupIntoRegions(blocks: OCRTextBlock[], pageIndex: number): TextRegion[] {
  const pageBlocks = blocks
    .filter(b => b.pageIndex === pageIndex && b.text.trim())
    .sort((a, b) => a.y - b.y || a.x - b.x);

  if (pageBlocks.length === 0) return [];

  // Step 1: Merge into lines (same Y within threshold)
  const lines: OCRTextBlock[][] = [];
  let currentLine: OCRTextBlock[] = [pageBlocks[0]];

  for (let i = 1; i < pageBlocks.length; i++) {
    const block = pageBlocks[i];
    const prevBlock = currentLine[currentLine.length - 1];
    
    // Same line: Y difference < 60% of avg height
    const avgHeight = (prevBlock.height + block.height) / 2;
    const yThreshold = avgHeight * 0.6;
    
    if (Math.abs(block.y - prevBlock.y) < yThreshold) {
      currentLine.push(block);
    } else {
      lines.push(currentLine);
      currentLine = [block];
    }
  }
  lines.push(currentLine);

  // Step 2: Merge adjacent lines into paragraph regions
  const regions: TextRegion[] = [];
  let currentRegionLines: OCRTextBlock[][] = [lines[0]];

  for (let i = 1; i < lines.length; i++) {
    const prevLine = currentRegionLines[currentRegionLines.length - 1];
    const currLine = lines[i];
    
    // Get bounding boxes
    const prevBottom = Math.max(...prevLine.map(b => b.y + b.height));
    const currTop = Math.min(...currLine.map(b => b.y));
    const prevLeft = Math.min(...prevLine.map(b => b.x));
    const prevRight = Math.max(...prevLine.map(b => b.x + b.width));
    const currLeft = Math.min(...currLine.map(b => b.x));
    const currRight = Math.max(...currLine.map(b => b.x + b.width));
    
    // Vertical gap threshold: 1.5x average line height
    const avgLineHeight = prevLine.reduce((s, b) => s + b.height, 0) / prevLine.length;
    const verticalGap = currTop - prevBottom;
    
    // Check horizontal overlap
    const overlapLeft = Math.max(prevLeft, currLeft);
    const overlapRight = Math.min(prevRight, currRight);
    const hasHorizontalOverlap = overlapRight - overlapLeft > Math.min(prevRight - prevLeft, currRight - currLeft) * 0.3;
    
    if (verticalGap < avgLineHeight * 1.5 && hasHorizontalOverlap) {
      currentRegionLines.push(currLine);
    } else {
      regions.push(buildRegion(currentRegionLines, pageIndex, regions.length));
      currentRegionLines = [currLine];
    }
  }
  regions.push(buildRegion(currentRegionLines, pageIndex, regions.length));

  return regions;
}

function buildRegion(lineGroups: OCRTextBlock[][], pageIndex: number, index: number): TextRegion {
  const allBlocks = lineGroups.flat();
  
  const x = Math.min(...allBlocks.map(b => b.x));
  const y = Math.min(...allBlocks.map(b => b.y));
  const right = Math.max(...allBlocks.map(b => b.x + b.width));
  const bottom = Math.max(...allBlocks.map(b => b.y + b.height));
  
  // Build text: join words per line with spaces, join lines with newlines
  const text = lineGroups
    .map(line => {
      const sorted = [...line].sort((a, b) => a.x - b.x);
      return sorted.map(b => b.text).join(' ');
    })
    .join('\n');
  
  const avgConfidence = allBlocks.reduce((s, b) => s + b.confidence, 0) / allBlocks.length;
  
  return {
    id: `region-${pageIndex}-${index}`,
    text,
    x,
    y,
    width: right - x,
    height: bottom - y,
    pageIndex,
    confidence: Math.round(avgConfidence),
    sourceBlocks: allBlocks,
  };
}

/**
 * Hook that groups word-level text blocks into paragraph/line regions.
 */
export function useTextBlocks(
  textBlocks: OCRTextBlock[],
  deletedBlockIds: Set<string>,
  currentPage: number
) {
  const visibleBlocks = useMemo(
    () => textBlocks.filter(b => !deletedBlockIds.has(b.id)),
    [textBlocks, deletedBlockIds]
  );

  const regions = useMemo(
    () => groupIntoRegions(visibleBlocks, currentPage),
    [visibleBlocks, currentPage]
  );

  return { regions, visibleBlocks };
}
