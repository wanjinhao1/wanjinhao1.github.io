import { useEffect } from 'react';
import { CommandOutput } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface OutputProps {
  output: CommandOutput;
  onOpenBlog?: (id: string) => void;
  onOpenProject?: (id: string) => void;
}

export const Output = ({ output, onOpenBlog, onOpenProject }: OutputProps) => {
  // Handle blog-detail type - trigger modal and show message
  if (output.type === 'blog-detail') {
    useEffect(() => {
      if (output.content) {
        onOpenBlog?.(output.content);
      }
    }, [output.content, onOpenBlog]);

    return (
      <div className="output-wrapper">
        {output.command && (
          <div className="output-command-prompt">
            <span className="prompt-symbol">C:\USERS\GUEST&gt;</span>
            <span className="command-text">{output.command}</span>
          </div>
        )}
        <div className="output output-success">
          <pre>Opening blog: {output.content}...</pre>
        </div>
      </div>
    );
  }

  // Handle project-detail type - trigger modal and show message
  if (output.type === 'project-detail') {
    useEffect(() => {
      if (output.content) {
        onOpenProject?.(output.content);
      }
    }, [output.content, onOpenProject]);

    return (
      <div className="output-wrapper">
        {output.command && (
          <div className="output-command-prompt">
            <span className="prompt-symbol">C:\USERS\GUEST&gt;</span>
            <span className="command-text">{output.command}</span>
          </div>
        )}
        <div className="output output-success">
          <pre>Opening project: {output.content}...</pre>
        </div>
      </div>
    );
  }

  // Don't render anything for guestbook type (handled by modal)
  if (output.type === 'guestbook') {
    return (
      <div className="output-wrapper">
        {output.command && (
          <div className="output-command-prompt">
            <span className="prompt-symbol">C:\USERS\GUEST&gt;</span>
            <span className="command-text">{output.command}</span>
          </div>
        )}
        <div className="output output-success">
          <pre>Opening guestbook...</pre>
        </div>
      </div>
    );
  }

  const getTypeClass = () => {
    switch (output.type) {
      case 'success':
        return 'output-success';
      case 'error':
        return 'output-error';
      case 'info':
        return 'output-info';
      case 'easter-egg':
        return 'output-easter-egg';
      default:
        return 'output-text';
    }
  };

  return (
    <div className="output-wrapper">
      {output.command && (
        <div className="output-command-prompt">
          <span className="prompt-symbol">C:\USERS\GUEST&gt;</span>
          <span className="command-text">{output.command}</span>
        </div>
      )}
      <div className={`output ${getTypeClass()}`}>
        {output.type === 'markdown' ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Handle custom links like /blog/hello-world or /project/dos-terminal
              a: ({ href, children }) => {
                if (href?.startsWith('/blog/')) {
                  const blogId = href.replace('/blog/', '');
                  return (
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onOpenBlog?.(blogId);
                      }}
                    >
                      {children}
                    </a>
                  );
                }
                if (href?.startsWith('/project/')) {
                  const projectId = href.replace('/project/', '');
                  return (
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onOpenProject?.(projectId);
                      }}
                    >
                      {children}
                    </a>
                  );
                }
                return <a href={href}>{children}</a>;
              },
            }}
          >
            {output.content}
          </ReactMarkdown>
        ) : (
          <pre>{output.content}</pre>
        )}
      </div>
    </div>
  );
};
