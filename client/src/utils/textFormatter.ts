/**
 * Utility to clean unwanted double blank lines between bullet points or numbered lists
 * when copying from ChatGPT, Gemini, Word, or web pages into textareas.
 */

export const isListItem = (line: string): boolean => {
  const trimmed = line.trim();
  // Matches:
  // 1. or 1) or (1) or a. or I.
  // •, ○, ●, ◦, ∙, ⁃, ▪, ▫, –, —, -, *, +, etc.
  return (
    /^\(?\d+[\.\)]\s+/.test(trimmed) ||
    /^[a-zA-Z][\.\)]\s+/.test(trimmed) ||
    /^[\u2022\u25CB\u25CF\u25E6\u2219\u2043\u25AA\u25AB\u2013\u2014\-\*\+]\s+/.test(trimmed)
  );
};

export const cleanListSpacing = (raw: string): string => {
  if (!raw) return '';
  // Normalize Windows/Mac line endings
  const text = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const lines = text.split('\n');
  const cleaned: string[] = [];
  let prevWasListItem = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '') {
      // Look ahead to check if the next non-empty line is also a list item
      let nextIsListItem = false;
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].trim() !== '') {
          nextIsListItem = isListItem(lines[j]);
          break;
        }
      }

      // If this blank line is between two list items, omit it so they sit together cleanly!
      if (prevWasListItem && nextIsListItem) {
        continue;
      }

      // If not between list items, allow at most one blank line for paragraph separation
      if (cleaned.length > 0 && cleaned[cleaned.length - 1].trim() === '') {
        continue;
      }

      cleaned.push('');
      prevWasListItem = false;
    } else {
      cleaned.push(line);
      prevWasListItem = isListItem(line);
    }
  }

  return cleaned.join('\n');
};

/**
 * Format raw lines into clean numbered points (1. 2. 3.)
 */
export const formatAsNumberedList = (raw: string): string => {
  if (!raw) return '';
  const cleaned = cleanListSpacing(raw);
  const lines = cleaned.split('\n');
  let num = 1;
  return lines
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      // Strip any existing bullets or numbers
      const content = trimmed
        .replace(/^\(?\d+[\.\)]\s*/, '')
        .replace(/^[\u2022\u25CB\u25CF\u25E6\u2219\u2043\u25AA\u25AB\u2013\u2014\-\*\+]\s*/, '');
      const res = `${num}. ${content}`;
      num++;
      return res;
    })
    .join('\n');
};

/**
 * Format raw lines into clean bullet points (• Point)
 */
export const formatAsBulletList = (raw: string): string => {
  if (!raw) return '';
  const cleaned = cleanListSpacing(raw);
  const lines = cleaned.split('\n');
  return lines
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      // Strip any existing bullets or numbers
      const content = trimmed
        .replace(/^\(?\d+[\.\)]\s*/, '')
        .replace(/^[\u2022\u25CB\u25CF\u25E6\u2219\u2043\u25AA\u25AB\u2013\u2014\-\*\+]\s*/, '');
      return `• ${content}`;
    })
    .join('\n');
};
