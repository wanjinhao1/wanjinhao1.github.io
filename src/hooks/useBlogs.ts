import { useState } from 'react';
import { BlogMeta } from '../types';

// 博客列表配置
const BLOG_LIST: BlogMeta[] = [
  {
    id: 'hello-world',
    title: 'Hello World - 我的第一篇博客',
    date: '2024-01-15',
    summary: '欢迎来到我的博客！这是第一篇文章，介绍了这个网站的由来。',
    filename: 'hello-world.md',
  },
  {
    id: 'react-vite-guide',
    title: '使用 React + Vite 构建现代前端应用',
    date: '2024-01-20',
    summary: '分享使用 Vite 和 React 构建高性能前端应用的经验。',
    filename: 'react-vite-guide.md',
  },
  {
    id: 'dos-terminal-design',
    title: 'DOS 终端风格网页设计思路',
    date: '2024-01-25',
    summary: '如何设计和实现一个复古风格的终端界面。',
    filename: 'dos-terminal-design.md',
  },
];

export const useBlogs = () => {
  const [blogs] = useState<BlogMeta[]>(BLOG_LIST);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取博客列表
  const getBlogList = (): BlogMeta[] => {
    return blogs;
  };

  // 获取单个博客
  const getBlog = async (id: string): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      const blog = blogs.find((b) => b.id === id);
      if (!blog) {
        setError('博客不存在');
        return null;
      }

      const response = await fetch(`/blogs/${blog.filename}`);
      if (!response.ok) {
        throw new Error('加载失败');
      }

      const content = await response.text();
      return content;
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    blogs,
    loading,
    error,
    getBlogList,
    getBlog,
  };
};
