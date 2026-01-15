import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface NetscapeBrowserModalProps {
  isOpen: boolean;
  blogId: string | null;
  onClose: () => void;
}

const blogMeta: Record<string, { title: string; date: string }> = {
  'hello-world': { title: 'Hello World - My First Blog Post', date: '2024-01-15' },
  'react-vite-guide': { title: 'Building Modern Frontend Applications with React + Vite', date: '2024-01-20' },
  'dos-terminal-design': { title: 'Designing a DOS Terminal Style Website', date: '2024-01-25' },
};

export const NetscapeBrowserModal = ({ isOpen, blogId, onClose }: NetscapeBrowserModalProps) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen && blogId) {
      // Reset state when opening a new blog
      setContent('');
      setLoading(true);
      setError('');
      fetch(`/blogs/${blogId}.md`)
        .then((res) => {
          if (!res.ok) throw new Error('Blog not found');
          return res.text();
        })
        .then((text) => setContent(text))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      // Clear content when modal closes
      setContent('');
      setError('');
    }
  }, [isOpen, blogId]);

  if (!isOpen || !blogId) return null;

  const meta = blogMeta[blogId] || { title: 'Blog Post', date: '' };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="netscape-browser" onClick={(e) => e.stopPropagation()}>
        {/* Title Bar */}
        <div className="netscape-titlebar">
          <div className="netscape-titlebar-left">
            <button className="netscape-control netscape-close" onClick={onClose}>✕</button>
            <button className="netscape-control netscape-maximize">□</button>
            <button className="netscape-control netscape-minimize">−</button>
          </div>
          <div className="netscape-titlebar-title">
            📄 {meta.title} - Netscape Navigator
          </div>
          <div className="netscape-titlebar-right"></div>
        </div>

        {/* Menu Bar */}
        <div className="netscape-menu">
          <span className="netscape-menu-item">File</span>
          <span className="netscape-menu-item">Edit</span>
          <span className="netscape-menu-item">View</span>
          <span className="netscape-menu-item">Go</span>
          <span className="netscape-menu-item">Bookmarks</span>
          <span className="netscape-menu-item">Options</span>
          <span className="netscape-menu-item">Directory</span>
          <span className="netscape-menu-item">Window</span>
          <span className="netscape-menu-item">Help</span>
        </div>

        {/* Navigation Toolbar */}
        <div className="netscape-toolbar">
          <button className="netscape-nav-btn">Back</button>
          <button className="netscape-nav-btn">Forward</button>
          <button className="netscape-nav-btn">Home</button>
          <button className="netscape-nav-btn">Reload</button>
          <button className="netscape-nav-btn">Images</button>
          <button className="netscape-nav-btn">Open</button>
          <button className="netscape-nav-btn">Print</button>
          <button className="netscape-nav-btn">Find</button>
          <div className="netscape-toolbar-spacer"></div>
          <span className="netscape-logo">N</span>
        </div>

        {/* URL Bar */}
        <div className="netscape-urlbar">
          <span className="netscape-url-label">Location:</span>
          <input
            className="netscape-url-input"
            value={`http://wanjinhao.github.io/blogs/${blogId}.html`}
            readOnly
          />
        </div>

        {/* Content Area */}
        <div className="netscape-content">
          {loading && <div className="netscape-loading">Loading...</div>}
          {error && <div className="netscape-error">Error: {error}</div>}
          {!loading && !error && (
            <div className="netscape-document">
              <div className="netscape-doc-header">
                <h1 className="netscape-doc-title">{meta.title}</h1>
                <p className="netscape-doc-date">Published: {meta.date}</p>
                <hr className="netscape-doc-hr" />
              </div>
              <div className="netscape-doc-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="netscape-statusbar">
          <span>Document: Done</span>
          <span>{content.length} bytes</span>
        </div>
      </div>
    </div>
  );
};
