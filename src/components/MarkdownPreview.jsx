import React from 'react';
import { parseMd, spanClassName } from '../lib/markdown';

function Spans({ spans }) {
  return spans.map((s, i) => <span key={i} className={spanClassName(s)}>{s.text}</span>);
}

export default function MarkdownPreview({ text, emptyLabel, className }) {
  if (!text) {
    return <div className={className}><div className="md-empty">{emptyLabel}</div></div>;
  }
  const blocks = parseMd(text);
  return (
    <div className={className}>
      {blocks.map((b, i) => {
        if (b.type === 'br') return <div className="md-br" key={i} />;
        if (b.type === 'h1') return <div className="md-h1" key={i}><Spans spans={b.spans} /></div>;
        if (b.type === 'h2') return <div className="md-h2" key={i}><Spans spans={b.spans} /></div>;
        if (b.type === 'h3') return <div className="md-h3" key={i}><Spans spans={b.spans} /></div>;
        if (b.type === 'li') return <div className="md-li" key={i}><span className="md-bullet">•</span><span><Spans spans={b.spans} /></span></div>;
        if (b.type === 'lio') return <div className="md-li" key={i}><span className="md-bullet md-marker">{b.marker}</span><span><Spans spans={b.spans} /></span></div>;
        return <div className="md-p" key={i}><Spans spans={b.spans} /></div>;
      })}
    </div>
  );
}
