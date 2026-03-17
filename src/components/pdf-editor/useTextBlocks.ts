import { useMemo } from 'react';
import { OCRTextBlock } from './useOCR';

export type TextSegmentationMode = 'auto' | 'paragraph' | 'line' | 'word' | 'table' | 'form';
export type ResolvedSegmentationMode = Exclude<TextSegmentationMode, 'auto'>;
export type TextRegionKind = 'paragraph' | 'line' | 'word' | 'cell' | 'field';

/**
 * A merged text region that groups nearby words into a readable paragraph/line/word block.
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
  kind: TextRegionKind;
  lineCount: number;
  /** Original word-level blocks that compose this region */
  sourceBlocks: OCRTextBlock[];
}

interface LineSegment {
  blocks: OCRTextBlock[];
  lineIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
}

interface TextLine {
  blocks: OCRTextBlock[];
  lineIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  segments: LineSegment[];
}

interface RegionBuildInput {
  segments: LineSegment[];
  pageIndex: number;
  mode: ResolvedSegmentationMode;
}

interface GroupedResult {
  regions: TextRegion[];
  modeUsed: ResolvedSegmentationMode;
}

const hashString = (value: string): string => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash >>> 0).toString(36);
};

const median = (values: number[]): number => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

const getBBox = (blocks: OCRTextBlock[]) => {
  const x = Math.min(...blocks.map(b => b.x));
  const y = Math.min(...blocks.map(b => b.y));
  const right = Math.max(...blocks.map(b => b.x + b.width));
  const bottom = Math.max(...blocks.map(b => b.y + b.height));

  return {
    x,
    y,
    width: right - x,
    height: bottom - y,
    right,
    bottom,
  };
};

const clusterIntoLines = (blocks: OCRTextBlock[]): OCRTextBlock[][] => {
  if (!blocks.length) return [];

  const sorted = [...blocks].sort((a, b) => {
    const aMid = a.y + a.height / 2;
    const bMid = b.y + b.height / 2;
    return aMid - bMid || a.x - b.x;
  });

  const lines: OCRTextBlock[][] = [];
  let currentLine: OCRTextBlock[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const block = sorted[i];
    const currentMid = median(currentLine.map(b => b.y + b.height / 2));
    const avgHeight = currentLine.reduce((sum, b) => sum + b.height, 0) / currentLine.length;
    const threshold = Math.max(5, Math.min(avgHeight, block.height) * 0.55);

    if (Math.abs((block.y + block.height / 2) - currentMid) <= threshold) {
      currentLine.push(block);
    } else {
      lines.push(currentLine);
      currentLine = [block];
    }
  }

  lines.push(currentLine);

  return lines
    .map(line => [...line].sort((a, b) => a.x - b.x))
    .sort((a, b) => Math.min(...a.map(x => x.y)) - Math.min(...b.map(x => x.y)));
};

const splitLineIntoSegments = (
  lineBlocks: OCRTextBlock[],
  lineIndex: number,
  pageWidth: number
): LineSegment[] => {
  if (!lineBlocks.length) return [];

  const gaps: number[] = [];
  for (let i = 0; i < lineBlocks.length - 1; i++) {
    const gap = lineBlocks[i + 1].x - (lineBlocks[i].x + lineBlocks[i].width);
    if (gap > 0) gaps.push(gap);
  }

  const avgHeight = lineBlocks.reduce((s, b) => s + b.height, 0) / lineBlocks.length;
  const medianGap = median(gaps);
  const breakThreshold = Math.max(avgHeight * 1.15, medianGap * 2.3, pageWidth * 0.022, 14);

  const groups: OCRTextBlock[][] = [];
  let currentGroup: OCRTextBlock[] = [lineBlocks[0]];

  for (let i = 1; i < lineBlocks.length; i++) {
    const previous = lineBlocks[i - 1];
    const current = lineBlocks[i];
    const gap = current.x - (previous.x + previous.width);

    if (gap > breakThreshold) {
      groups.push(currentGroup);
      currentGroup = [current];
    } else {
      currentGroup.push(current);
    }
  }

  groups.push(currentGroup);

  return groups.map(group => {
    const bbox = getBBox(group);
    return {
      blocks: group,
      lineIndex,
      x: bbox.x,
      y: bbox.y,
      width: bbox.width,
      height: bbox.height,
      text: group.map(b => b.text.trim()).filter(Boolean).join(' ').replace(/\s+/g, ' '),
    };
  });
};

const buildLines = (blocks: OCRTextBlock[], pageWidth: number): TextLine[] => {
  return clusterIntoLines(blocks).map((lineBlocks, lineIndex) => {
    const bbox = getBBox(lineBlocks);
    return {
      blocks: lineBlocks,
      lineIndex,
      x: bbox.x,
      y: bbox.y,
      width: bbox.width,
      height: bbox.height,
      segments: splitLineIntoSegments(lineBlocks, lineIndex, pageWidth),
    };
  });
};

const resolveSegmentationMode = (
  lines: TextLine[],
  requestedMode: TextSegmentationMode,
  pageWidth: number
): ResolvedSegmentationMode => {
  if (requestedMode !== 'auto') return requestedMode;
  if (!lines.length) return 'line';

  // Default to line mode for better precision — user can switch to paragraph if needed
  const multiSegmentLines = lines.filter(line => line.segments.length > 1).length;
  const multiSegmentRatio = multiSegmentLines / lines.length;
  const avgSegments = lines.reduce((sum, line) => sum + line.segments.length, 0) / lines.length;

  if (multiSegmentRatio >= 0.35 || avgSegments >= 1.45) return 'table';
  // Default to 'line' instead of 'paragraph' for better editing precision
  return 'line';
};

const overlapRatio = (aStart: number, aEnd: number, bStart: number, bEnd: number): number => {
  const overlap = Math.max(0, Math.min(aEnd, bEnd) - Math.max(aStart, bStart));
  const minWidth = Math.max(1, Math.min(aEnd - aStart, bEnd - bStart));
  return overlap / minWidth;
};

const shouldMerge = (
  previous: LineSegment,
  current: LineSegment,
  mode: ResolvedSegmentationMode,
  pageWidth: number,
  pageHeight: number,
  firstSegmentY: number
): boolean => {
  if (current.lineIndex === previous.lineIndex) return false;

  // Line and word modes never merge across lines
  if (mode === 'line' || mode === 'word') return false;

  const prevBottom = previous.y + previous.height;
  const verticalGap = current.y - prevBottom;
  const overlap = overlapRatio(previous.x, previous.x + previous.width, current.x, current.x + current.width);
  const leftDiff = Math.abs(previous.x - current.x);
  const widthRatio = Math.max(previous.width, current.width) / Math.max(1, Math.min(previous.width, current.width));

  if (mode === 'table') {
    return (
      verticalGap >= -4 &&
      verticalGap <= Math.max(8, Math.min(previous.height, current.height) * 0.85) &&
      overlap >= 0.82 &&
      leftDiff <= Math.max(10, pageWidth * 0.015)
    );
  }

  if (mode === 'form') {
    return (
      verticalGap >= -4 &&
      verticalGap <= Math.max(10, previous.height * 1.1) &&
      overlap >= 0.58 &&
      leftDiff <= Math.max(16, pageWidth * 0.03) &&
      widthRatio <= 2.4
    );
  }

  const projectedRegionHeight = (current.y + current.height) - firstSegmentY;

  return (
    verticalGap >= -4 &&
    verticalGap <= Math.max(12, previous.height * 1.35) &&
    (overlap >= 0.35 || leftDiff <= Math.max(18, pageWidth * 0.04)) &&
    widthRatio <= 2.8 &&
    projectedRegionHeight <= pageHeight * 0.34
  );
};

const buildRegion = ({ segments, pageIndex, mode }: RegionBuildInput): TextRegion => {
  const allBlocks = segments.flatMap(segment => segment.blocks);
  const uniqueBlockMap = new Map(allBlocks.map(block => [block.id, block]));
  const uniqueBlocks = Array.from(uniqueBlockMap.values()).sort((a, b) => a.y - b.y || a.x - b.x);

  const { x, y, width, height } = getBBox(uniqueBlocks);
  const groupedByLine = new Map<number, OCRTextBlock[]>();

  uniqueBlocks.forEach(block => {
    const key = segments.find(segment => segment.blocks.some(source => source.id === block.id))?.lineIndex ?? 0;
    const existing = groupedByLine.get(key) ?? [];
    existing.push(block);
    groupedByLine.set(key, existing);
  });

  const lineKeys = Array.from(groupedByLine.keys()).sort((a, b) => a - b);
  const text = lineKeys
    .map(lineKey => (groupedByLine.get(lineKey) ?? []).sort((a, b) => a.x - b.x).map(b => b.text).join(' '))
    .join('\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim();

  const confidence = uniqueBlocks.reduce((sum, block) => sum + block.confidence, 0) / uniqueBlocks.length;
  const idSeed = uniqueBlocks.map(block => block.id).sort().join('|');

  const kind: TextRegionKind = mode === 'table'
    ? 'cell'
    : mode === 'form'
      ? 'field'
      : mode === 'word'
        ? 'word'
        : lineKeys.length > 1
          ? 'paragraph'
          : 'line';

  return {
    id: `region-${pageIndex}-${hashString(idSeed)}`,
    text,
    x,
    y,
    width,
    height,
    pageIndex,
    confidence: Math.round(confidence),
    kind,
    lineCount: Math.max(1, lineKeys.length),
    sourceBlocks: uniqueBlocks,
  };
};

/**
 * Word mode: each individual word block becomes its own region.
 */
function buildWordRegions(blocks: OCRTextBlock[], pageIndex: number): TextRegion[] {
  return blocks
    .filter(b => b.pageIndex === pageIndex && b.text.trim())
    .map(block => ({
      id: `region-${pageIndex}-w-${hashString(block.id)}`,
      text: block.text.trim(),
      x: block.x,
      y: block.y,
      width: block.width,
      height: block.height,
      pageIndex,
      confidence: Math.round(block.confidence),
      kind: 'word' as TextRegionKind,
      lineCount: 1,
      sourceBlocks: [block],
    }));
}

function groupIntoRegions(
  blocks: OCRTextBlock[],
  pageIndex: number,
  requestedMode: TextSegmentationMode
): GroupedResult {
  const pageBlocks = blocks
    .filter(block => block.pageIndex === pageIndex && block.text.trim())
    .sort((a, b) => a.y - b.y || a.x - b.x);

  if (!pageBlocks.length) {
    return { regions: [], modeUsed: requestedMode === 'auto' ? 'line' : (requestedMode === 'word' ? 'word' : requestedMode as ResolvedSegmentationMode) };
  }

  // Word mode: bypass all grouping, each word is its own region
  if (requestedMode === 'word') {
    return { regions: buildWordRegions(blocks, pageIndex), modeUsed: 'word' };
  }

  const minX = Math.min(...pageBlocks.map(b => b.x));
  const maxX = Math.max(...pageBlocks.map(b => b.x + b.width));
  const minY = Math.min(...pageBlocks.map(b => b.y));
  const maxY = Math.max(...pageBlocks.map(b => b.y + b.height));
  const pageWidth = Math.max(1, maxX - minX);
  const pageHeight = Math.max(1, maxY - minY);

  const lines = buildLines(pageBlocks, pageWidth);
  const modeUsed = resolveSegmentationMode(lines, requestedMode, pageWidth);

  // If resolved to word mode
  if (modeUsed === 'word') {
    return { regions: buildWordRegions(blocks, pageIndex), modeUsed: 'word' };
  }

  const allSegments = lines.flatMap(line => line.segments).sort((a, b) => a.y - b.y || a.x - b.x);
  if (!allSegments.length) {
    return { regions: [], modeUsed };
  }

  const groupedSegments: LineSegment[][] = [];

  allSegments.forEach(segment => {
    const currentRegion = groupedSegments[groupedSegments.length - 1];

    if (!currentRegion) {
      groupedSegments.push([segment]);
      return;
    }

    const previousSegment = currentRegion[currentRegion.length - 1];
    const firstSegment = currentRegion[0];

    if (shouldMerge(previousSegment, segment, modeUsed, pageWidth, pageHeight, firstSegment.y)) {
      currentRegion.push(segment);
    } else {
      groupedSegments.push([segment]);
    }
  });

  const regions = groupedSegments
    .map(segments => buildRegion({ segments, pageIndex, mode: modeUsed }))
    .filter(region => region.text.trim().length > 0);

  return { regions, modeUsed };
}

/**
 * Hook that groups word-level text blocks into paragraph/line/word regions.
 */
export function useTextBlocks(
  textBlocks: OCRTextBlock[],
  deletedBlockIds: Set<string>,
  currentPage: number,
  segmentationMode: TextSegmentationMode = 'auto'
) {
  const visibleBlocks = useMemo(
    () => textBlocks.filter(block => !deletedBlockIds.has(block.id)),
    [textBlocks, deletedBlockIds]
  );

  const grouped = useMemo(
    () => groupIntoRegions(visibleBlocks, currentPage, segmentationMode),
    [visibleBlocks, currentPage, segmentationMode]
  );

  return {
    regions: grouped.regions,
    modeUsed: grouped.modeUsed,
    visibleBlocks,
  };
}
