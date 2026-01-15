import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface IE6BrowserModalProps {
  isOpen: boolean;
  projectId: string | null;
  onClose: () => void;
}

interface ProjectData {
  title: string;
  date: string;
  tech: string;
  status: string;
  content: string;
}

export const IE6BrowserModal = ({ isOpen, projectId, onClose }: IE6BrowserModalProps) => {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && projectId) {
      setLoading(true);
      setError(null);
      fetch(`/projects/${projectId}.md`)
        .then((res) => {
          if (!res.ok) throw new Error('Project not found');
          return res.text();
        })
        .then((text) => {
          // Parse frontmatter
          const frontmatterMatch = text.match(/^---\n([\s\S]*?)\n---/);
          const frontmatter: any = {};

          if (frontmatterMatch) {
            const lines = frontmatterMatch[1].split('\n');
            lines.forEach((line) => {
              const match = line.match(/^(\w+):\s*(.*)$/);
              if (match) {
                frontmatter[match[1]] = match[2];
              }
            });
          }

          const content = text.replace(/^---\n[\s\S]*?\n---\n?/, '');

          setProject({
            title: frontmatter.title || 'Project',
            date: frontmatter.date || '',
            tech: frontmatter.tech || '',
            status: frontmatter.status || '',
            content,
          });
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  return (
    <div className="ie6-modal-overlay" onClick={onClose}>
      <div className="ie6-browser" onClick={(e) => e.stopPropagation()}>
        {/* Title Bar - Windows XP style */}
        <div className="ie6-titlebar">
          <div className="ie6-titlebar-left">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Crect fill='%230066cc' width='16' height='16' rx='2'/%3E%3Ctext x='8' y='12' text-anchor='middle' fill='white' font-size='10' font-family='Arial'%3Ee%3C/text%3E%3C/svg%3E" alt="" className="ie6-icon" />
            <span className="ie6-title">{project?.title || 'Project'} - Microsoft Internet Explorer</span>
          </div>
          <div className="ie6-titlebar-right">
            <button className="ie6-control ie6-minimize">_</button>
            <button className="ie6-control ie6-maximize">□</button>
            <button className="ie6-control ie6-close" onClick={onClose}>×</button>
          </div>
        </div>

        {/* Menu Bar */}
        <div className="ie6-menubar">
          <span className="ie6-menu-item">File</span>
          <span className="ie6-menu-item">Edit</span>
          <span className="ie6-menu-item">View</span>
          <span className="ie6-menu-item">Favorites</span>
          <span className="ie6-menu-item">Tools</span>
          <span className="ie6-menu-item">Help</span>
        </div>

        {/* Toolbar */}
        <div className="ie6-toolbar">
          <button className="ie6-toolbar-btn">← Back</button>
          <button className="ie6-toolbar-btn">→ Forward</button>
          <button className="ie6-toolbar-btn">Stop</button>
          <button className="ie6-toolbar-btn">⟳ Refresh</button>
          <button className="ie6-toolbar-btn">🏠 Home</button>
          <div className="ie6-toolbar-separator"></div>
          <button className="ie6-toolbar-btn">📁</button>
          <div className="ie6-toolbar-spacer"></div>
          <span className="ie6-toolbar-text">Links</span>
        </div>

        {/* Address Bar */}
        <div className="ie6-addressbar">
          <span className="ie6-address-label">Address</span>
          <input
            className="ie6-address-input"
            value={`https://wanjinhao1.github.io/projects/${projectId}`}
            readOnly
          />
          <button className="ie6-go-btn">Go</button>
        </div>

        {/* Content Area */}
        <div className="ie6-content">
          <div className="ie6-document">
            {loading && (
              <div className="ie6-loading">
                <p>Opening project...</p>
              </div>
            )}

            {error && (
              <div className="ie6-error">
                <p>Cannot find server or DNS Error</p>
                <p>{error}</p>
              </div>
            )}

            {project && !loading && !error && (
              <>
                <div className="ie6-doc-header">
                  <h1 className="ie6-doc-title">{project.title}</h1>
                  <div className="ie6-doc-meta">
                    <span>📅 {project.date}</span>
                    {project.tech && <span> | 🔧 {project.tech}</span>}
                    {project.status && <span> | 📊 {project.status}</span>}
                  </div>
                </div>
                <hr className="ie6-doc-hr" />
                <div className="ie6-doc-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {project.content}
                  </ReactMarkdown>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="ie6-statusbar">
          <span className="ie6-status-icon">⚠</span>
          <span className="ie6-status-text">Done, but with errors on page.</span>
          <span className="ie6-status-zone">Internet</span>
        </div>
      </div>
    </div>
  );
};
