import { CommandOutput } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface OutputProps {
  output: CommandOutput;
}

export const Output = ({ output }: OutputProps) => {
  if (output.type === 'blog-list') {
    return <BlogListOutput />;
  }

  const getTypeClass = () => {
    switch (output.type) {
      case 'success':
        return 'output-success';
      case 'error':
        return 'output-error';
      case 'info':
        return 'output-info';
      default:
        return 'output-text';
    }
  };

  return (
    <div className={`output ${getTypeClass()}`}>
      {output.type === 'markdown' ? (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{output.content}</ReactMarkdown>
      ) : (
        <pre>{output.content}</pre>
      )}
    </div>
  );
};

const BlogListOutput = () => {
  const blogs = [
    {
      id: 'hello-world',
      title: 'Hello World - 我的第一篇博客',
      date: '2024-01-15',
      summary: '欢迎来到我的博客！这是第一篇文章，介绍了这个网站的由来。',
    },
    {
      id: 'react-vite-guide',
      title: '使用 React + Vite 构建现代前端应用',
      date: '2024-01-20',
      summary: '分享使用 Vite 和 React 构建高性能前端应用的经验。',
    },
    {
      id: 'dos-terminal-design',
      title: 'DOS 终端风格网页设计思路',
      date: '2024-01-25',
      summary: '如何设计和实现一个复古风格的终端界面。',
    },
  ];

  return (
    <div className="output output-text">
      <pre>
        {`# 博客列表`}

{'\n'}
{blogs.map((blog, index) => (
  <span key={blog.id}>
{`[${index + 1}] ${blog.title}`}
{'\n'}
{`    日期: ${blog.date}`}
{'\n'}
{`    摘要: ${blog.summary}`}
{'\n'}
{`    命令: /blog ${blog.id}`}
{'\n\n'}
  </span>
))}
      </pre>
    </div>
  );
};
