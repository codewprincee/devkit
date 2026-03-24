import type { LogLevel, LogLine } from '@/types';

const LEVEL_PATTERNS: Array<{ level: LogLevel; pattern: RegExp }> = [
  { level: 'error', pattern: /\b(?:ERROR|FATAL|CRITICAL|SEVERE|ERR)\b/i },
  { level: 'warn', pattern: /\b(?:WARN|WARNING)\b/i },
  { level: 'info', pattern: /\b(?:INFO|NOTICE)\b/i },
  { level: 'debug', pattern: /\b(?:DEBUG|DBG)\b/i },
  { level: 'trace', pattern: /\b(?:TRACE|VERBOSE)\b/i },
];

const TIMESTAMP_PATTERN =
  /^(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)/;

const ISO_TIMESTAMP =
  /\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/;

/**
 * Detect the log level from a raw text line.
 */
export function detectLevel(text: string): LogLevel {
  for (const { level, pattern } of LEVEL_PATTERNS) {
    if (pattern.test(text)) {
      return level;
    }
  }
  return 'unknown';
}

/**
 * Try to extract a leading timestamp from a log line.
 */
export function extractTimestamp(text: string): string | undefined {
  const match = text.match(TIMESTAMP_PATTERN);
  if (match) return match[1];

  const isoMatch = text.match(ISO_TIMESTAMP);
  if (isoMatch) return isoMatch[0];

  return undefined;
}

/**
 * Check whether a string is valid JSON.
 * Handles lines that are pure JSON as well as lines
 * with a prefix (timestamp, level) followed by a JSON object/array.
 */
export function detectJson(text: string): { isJson: boolean; jsonData?: unknown } {
  const trimmed = text.trim();

  // Try the whole line first
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      return { isJson: true, jsonData: parsed };
    } catch {
      // not valid JSON
    }
  }

  // Try to find JSON embedded after a prefix (common in structured logs)
  const jsonStart = trimmed.indexOf('{');
  if (jsonStart > 0) {
    const candidate = trimmed.slice(jsonStart);
    try {
      const parsed = JSON.parse(candidate);
      return { isJson: true, jsonData: parsed };
    } catch {
      // not valid JSON
    }
  }

  const arrayStart = trimmed.indexOf('[');
  if (arrayStart > 0) {
    const candidate = trimmed.slice(arrayStart);
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed)) {
        return { isJson: true, jsonData: parsed };
      }
    } catch {
      // not valid JSON
    }
  }

  return { isJson: false };
}

/**
 * Parse an array of raw text lines into structured LogLine objects.
 */
export function parseLogLines(rawLines: string[], startId: number = 0): LogLine[] {
  return rawLines.map((text, index) => {
    const level = detectLevel(text);
    const timestamp = extractTimestamp(text);
    const { isJson, jsonData } = detectJson(text);

    return {
      id: startId + index,
      text,
      level,
      timestamp,
      isJson,
      jsonData,
      bookmarked: false,
    };
  });
}

/**
 * Filter log lines by a search query.
 * Supports plain text and regex modes.
 */
export function filterLines(
  lines: LogLine[],
  query: string,
  isRegex: boolean
): { filtered: LogLine[]; matchCount: number } {
  if (!query.trim()) {
    return { filtered: lines, matchCount: 0 };
  }

  try {
    if (isRegex) {
      const regex = new RegExp(query, 'i');
      const filtered = lines.filter((line) => regex.test(line.text));
      return { filtered, matchCount: filtered.length };
    }

    const lowerQuery = query.toLowerCase();
    const filtered = lines.filter((line) =>
      line.text.toLowerCase().includes(lowerQuery)
    );
    return { filtered, matchCount: filtered.length };
  } catch {
    // Invalid regex -- return all lines with zero matches
    return { filtered: lines, matchCount: 0 };
  }
}

/**
 * Filter log lines by one or more log levels.
 */
export function filterByLevel(lines: LogLine[], levels: LogLevel[]): LogLine[] {
  if (levels.length === 0) return lines;
  const levelSet = new Set(levels);
  return lines.filter((line) => levelSet.has(line.level));
}
