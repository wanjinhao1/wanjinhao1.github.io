import { Command } from '../types';
import { ABOUT_CONTENT, PUBLICATIONS_CONTENT, HELP_CONTENT, PROJECTS_CONTENT, SKILLS_CONTENT, WELCOME_CONTENT, BLOG_LIST_CONTENT } from '../content';

export const commands: Record<string, Command> = {
  '/': {
    name: '/',
    description: 'Clear screen and show welcome',
    handler: () => [
      {
        id: 'clear',
        type: 'text',
        content: '__CLEAR__',
        timestamp: new Date(),
      },
      {
        id: crypto.randomUUID(),
        type: 'markdown',
        content: WELCOME_CONTENT,
        timestamp: new Date(),
      },
    ],
  },
  about: {
    name: 'about',
    description: 'About me',
    handler: () => ({
      id: crypto.randomUUID(),
      type: 'markdown',
      content: ABOUT_CONTENT,
      timestamp: new Date(),
    }),
  },
  publications: {
    name: 'publications',
    description: 'My publications',
    handler: () => ({
      id: crypto.randomUUID(),
      type: 'markdown',
      content: PUBLICATIONS_CONTENT,
      timestamp: new Date(),
    }),
  },
  blog: {
    name: 'blog',
    description: 'View blog list or specific blog',
    handler: async (args) => {
      const blogId = args[0];
      if (blogId) {
        try {
          const response = await fetch(`/blogs/${blogId}.md`);
          if (!response.ok) {
            return {
              id: crypto.randomUUID(),
              type: 'error',
              content: `Blog not found: ${blogId}`,
              timestamp: new Date(),
            };
          }
          const content = await response.text();
          return {
            id: crypto.randomUUID(),
            type: 'blog-detail',
            content: blogId,
            markdownContent: content,
            timestamp: new Date(),
          };
        } catch (error) {
          return {
            id: crypto.randomUUID(),
            type: 'error',
            content: `Failed to load blog: ${error}`,
            timestamp: new Date(),
          };
        }
      }
      // Return blog list
      return {
        id: crypto.randomUUID(),
        type: 'markdown',
        content: BLOG_LIST_CONTENT,
        timestamp: new Date(),
      };
    },
  },
  project: {
    name: 'project',
    description: 'View project details',
    handler: async (args) => {
      const projectId = args[0];
      if (projectId) {
        try {
          const response = await fetch(`/projects/${projectId}.md`);
          if (!response.ok) {
            return {
              id: crypto.randomUUID(),
              type: 'error',
              content: `Project not found: ${projectId}`,
              timestamp: new Date(),
            };
          }
          const content = await response.text();
          return {
            id: crypto.randomUUID(),
            type: 'project-detail',
            content: projectId,
            markdownContent: content,
            timestamp: new Date(),
          };
        } catch (error) {
          return {
            id: crypto.randomUUID(),
            type: 'error',
            content: `Failed to load project: ${error}`,
            timestamp: new Date(),
          };
        }
      }
      // Return projects list
      return {
        id: crypto.randomUUID(),
        type: 'markdown',
        content: PROJECTS_CONTENT,
        timestamp: new Date(),
      };
    },
  },
  projects: {
    name: 'projects',
    description: 'Projects showcase',
    handler: () => ({
      id: crypto.randomUUID(),
      type: 'markdown',
      content: PROJECTS_CONTENT,
      timestamp: new Date(),
    }),
  },
  skills: {
    name: 'skills',
    description: 'Skills stack',
    handler: () => ({
      id: crypto.randomUUID(),
      type: 'markdown',
      content: SKILLS_CONTENT,
      timestamp: new Date(),
    }),
  },
  help: {
    name: 'help',
    description: 'Show help information',
    handler: () => ({
      id: crypto.randomUUID(),
      type: 'markdown',
      content: HELP_CONTENT,
      timestamp: new Date(),
    }),
  },
  clear: {
    name: 'clear',
    description: 'Clear screen',
    handler: () => ({
      id: 'clear',
      type: 'text',
      content: '__CLEAR__',
      timestamp: new Date(),
    }),
  },
  su: {
    name: 'su',
    description: 'Sign guestbook (usage: su <name>)',
    handler: (args) => {
      const name = args[0]?.toLowerCase();

      // Easter egg: special names
      if (name === 'yufan' || name === 'fanyu') {
        return {
          id: crypto.randomUUID(),
          type: 'easter-egg',
          content: 'Darling, will you marry me?',
          timestamp: new Date(),
        };
      }

      // Guestbook mode
      const userName = args[0] || 'Anonymous';
      return {
        id: crypto.randomUUID(),
        type: 'guestbook',
        content: userName,
        timestamp: new Date(),
      };
    },
  },
};
