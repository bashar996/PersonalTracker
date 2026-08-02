// Minimal markdown: bold/italic/code/link spans, plus h1-h3/li/ordered-li/paragraph blocks.
function parseInline(text) {
  const spans = [];
  const re = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|(\[(.+?)\]\((.+?)\))/g;
  let last = 0, mm;
  while ((mm = re.exec(text))) {
    if (mm.index > last) spans.push({ text: text.slice(last, mm.index) });
    if (mm[2] !== undefined) spans.push({ text: mm[2], bold: true });
    else if (mm[4] !== undefined) spans.push({ text: mm[4], italic: true });
    else if (mm[6] !== undefined) spans.push({ text: mm[6], code: true });
    else if (mm[8] !== undefined) spans.push({ text: mm[8], link: true });
    last = re.lastIndex;
  }
  if (last < text.length) spans.push({ text: text.slice(last) });
  if (spans.length === 0) spans.push({ text: '' });
  return spans;
}

export function parseMd(text) {
  if (!text) return [];
  const blocks = [];
  let olCount = 0;
  (text || '').split('\n').forEach((line) => {
    let m;
    if (/^\s*$/.test(line)) { blocks.push({ type: 'br' }); olCount = 0; return; }
    if ((m = /^###\s+(.*)/.exec(line))) { blocks.push({ type: 'h3', spans: parseInline(m[1]) }); olCount = 0; return; }
    if ((m = /^##\s+(.*)/.exec(line))) { blocks.push({ type: 'h2', spans: parseInline(m[1]) }); olCount = 0; return; }
    if ((m = /^#\s+(.*)/.exec(line))) { blocks.push({ type: 'h1', spans: parseInline(m[1]) }); olCount = 0; return; }
    if ((m = /^[-*]\s+(.*)/.exec(line))) { blocks.push({ type: 'li', spans: parseInline(m[1]) }); olCount = 0; return; }
    if ((m = /^\d+\.\s+(.*)/.exec(line))) { olCount++; blocks.push({ type: 'lio', marker: olCount + '.', spans: parseInline(m[1]) }); return; }
    olCount = 0;
    blocks.push({ type: 'p', spans: parseInline(line) });
  });
  return blocks;
}

export function spanClassName(s) {
  const cls = [];
  if (s.bold) cls.push('md-bold');
  if (s.italic) cls.push('md-italic');
  if (s.code) cls.push('md-code');
  if (s.link) cls.push('md-link');
  return cls.join(' ');
}
