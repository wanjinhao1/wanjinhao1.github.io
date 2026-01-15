import { CommandOutput } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface OutputProps {
  output: CommandOutput;
  onOpenBlog?: (id: string) => void;
}

export const Output = ({ output, onOpenBlog }: OutputProps) => {
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

  if (output.type === 'blog-list') {
    return <BlogListOutput onOpenBlog={onOpenBlog} />;
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
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{output.content}</ReactMarkdown>
        ) : (
          <pre>{output.content}</pre>
        )}
      </div>
    </div>
  );
};

const BlogListOutput = ({ onOpenBlog }: { onOpenBlog?: (id: string) => void }) => {
  const blogs = [
    {
      id: 'hello-world',
      title: 'Hello World - My First Blog Post',
      date: '2024-01-15',
      summary: 'Welcome to my blog! This is the first article introducing the origin of this website.',
    },
    {
      id: 'react-vite-guide',
      title: 'Building Modern Frontend Applications with React + Vite',
      date: '2024-01-20',
      summary: 'Sharing experience using Vite and React to build high-performance applications.',
    },
    {
      id: 'dos-terminal-design',
      title: 'Designing a DOS Terminal Style Website',
      date: '2024-01-25',
      summary: 'How to design and implement a retro-style terminal interface.',
    },
  ];

  return (
    <div className="output-wrapper">
      <div className="output-command-prompt">
        <span className="prompt-symbol">C:\USERS\GUEST&gt;</span>
        <span className="command-text">/blog</span>
      </div>
      <div className="output output-text">
        <pre>
          {`# Blog List`}

{'\n'}
{blogs.map((blog, index) => (
  <span key={blog.id}>
{`[${index + 1}] ${blog.title}`}
{'\n'}
{`    Date: ${blog.date}`}
{'\n'}
{`    Summary: ${blog.summary}`}
{'\n'}
{`    `}
    <button
      className="blog-link-btn"
      onClick={() => onOpenBlog?.(blog.id)}
    >
      [Open: /blog {blog.id}]
    </button>
{'\n\n'}
  </span>
))}
        </pre>
      </div>
    </div>
  );
};
