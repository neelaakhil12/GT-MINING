export const isListItem = (line) => {
  const trimmed = line.trim();
  return (
    /^\(?\d+[\.\)]\s+/.test(trimmed) ||
    /^[a-zA-Z][\.\)]\s+/.test(trimmed) ||
    /^[\u2022\u25CB\u25CF\u25E6\u2219\u2043\u25AA\u25AB\u2013\u2014\-\*\+]\s+/.test(trimmed)
  );
};

export const cleanListSpacing = (raw) => {
  if (!raw) return '';
  const text = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = text.split('\n');
  const cleaned = [];
  let prevWasListItem = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '') {
      let nextIsListItem = false;
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].trim() !== '') {
          nextIsListItem = isListItem(lines[j]);
          break;
        }
      }

      if (prevWasListItem && nextIsListItem) {
        continue;
      }

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
