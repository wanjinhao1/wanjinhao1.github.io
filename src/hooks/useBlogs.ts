import { useState } from 'react';
import { BlogMeta } from '../types';

// Blog list configuration
const BLOG_LIST: BlogMeta[] = [
  {
    id: 'hello-world',
    title: 'Hello World - My First Blog Post',
    date: '2024-01-15',
    summary: 'Welcome to my blog! This is the first article introducing the origin of this website.',
    filename: 'hello-world.md',
  },
  {
    id: 'react-vite-guide',
    title: 'Building Modern Frontend Applications with React + Vite',
    date: '2024-01-20',
    summary: 'Sharing experience using Vite and React to build high-performance applications.',
    filename: 'react-vite-guide.md',
  },
  {
    id: 'dos-terminal-design',
    title: 'Designing a DOS Terminal Style Website',
    date: '2024-01-25',
    summary: 'How to design and implement a retro-style terminal interface.',
    filename: 'dos-terminal-design.md',
  },
];

export const useBlogs = () => {
  const [blogs] = useState<BlogMeta[]>(BLOG_LIST);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get blog list
  const getBlogList = (): BlogMeta[] => {
    return blogs;
  };

  // Get single blog
  const getBlog = async (id: string): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      const blog = blogs.find((b) => b.id === id);
      if (!blog) {
        setError('Blog not found');
        return null;
      }

      const response = await fetch(`/blogs/${blog.filename}`);
      if (!response.ok) {
        throw new Error('Failed to load');
      }

      const content = await response.text();
      return content;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
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
