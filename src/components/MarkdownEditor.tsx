import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css'; // You can change theme
import {
  Bold,
  Italic,
  Code,
  Heading,
  List,
  ListOrdered,
  Link,
  Image as ImageIcon,
  Eye,
  Edit
} from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: number;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  height = 300
}) => {
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  const insertAtCursor = (before: string, after: string = '') => {
    const textarea = document.getElementById('markdown-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const updated = value.substring(0, start) + before + selected + after + value.substring(end);

    onChange(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + before.length + selected.length + after.length;
    }, 0);
  };

  const toolbarButtons = [
    { icon: <Bold size={16} />, label: 'Bold', onClick: () => insertAtCursor('**', '**') },
    { icon: <Italic size={16} />, label: 'Italic', onClick: () => insertAtCursor('_', '_') },
    { icon: <Code size={16} />, label: 'Inline Code', onClick: () => insertAtCursor('`', '`') },
    { icon: <Heading size={16} />, label: 'Heading', onClick: () => insertAtCursor('## ') },
    { icon: <List size={16} />, label: 'Bullet List', onClick: () => insertAtCursor('- ') },
    { icon: <ListOrdered size={16} />, label: 'Numbered List', onClick: () => insertAtCursor('1. ') },
    { icon: <Link size={16} />, label: 'Link', onClick: () => insertAtCursor('[text](url)') },
    { icon: <ImageIcon size={16} />, label: 'Image', onClick: () => insertAtCursor('![alt](image-url)') }
  ];

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden shadow-sm bg-white">
      {/* Header Tabs */}
      <div className="flex items-center justify-between border-b border-gray-300 bg-gray-50 px-4 py-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setViewMode('edit')}
            className={`text-sm font-medium flex items-center gap-1 px-3 py-1 rounded-md ${
              viewMode === 'edit'
                ? 'bg-white text-red-600 border border-red-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Edit className="w-4 h-4" /> Edit
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`text-sm font-medium flex items-center gap-1 px-3 py-1 rounded-md ${
              viewMode === 'preview'
                ? 'bg-white text-red-600 border border-red-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Eye className="w-4 h-4" /> Preview
          </button>
        </div>
        <span className="text-xs text-gray-500 hidden sm:inline">
          GoQnA - A place to share knowledge, ask freely, and grow together.
        </span>
      </div>

      {/* Toolbar */}
      {viewMode === 'edit' && (
        <div className="flex flex-wrap gap-2 border-b border-gray-300 px-3 py-2 bg-gray-50">
          {toolbarButtons.map((btn, idx) => (
            <button
              key={idx}
              type="button"
              title={btn.label}
              onClick={btn.onClick}
              className="text-gray-600 hover:text-red-600"
            >
              {btn.icon}
            </button>
          ))}
        </div>
      )}

      {/* Editor / Preview */}
      <div className="p-3" style={{ minHeight: `${height}px` }}>
        {viewMode === 'edit' ? (
          <textarea
            id="markdown-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-full resize-none border-none outline-none focus:ring-0 text-sm"
            placeholder="Write your question in Markdown..."
            style={{ minHeight: `${height}px` }}
          />
        ) : (
          <div className="prose max-w-none text-sm">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {value || '*Nothing to preview*'}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 border-t border-gray-300">
        <div className="flex items-center gap-2">
          <Code className="w-3 h-3" />
          Supports GitHub-flavored Markdown (GFM), syntax highlighting, and image embedding.
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditor;
