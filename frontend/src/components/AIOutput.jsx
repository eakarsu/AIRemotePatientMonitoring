import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function AIOutput({ content, title }) {
  if (!content) return null;

  return (
    <div className="ai-output">
      <div className="ai-output-header">
        <span>🤖</span>
        <span>{title || 'AI Analysis Result'}</span>
      </div>
      <div className="ai-output-content">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
