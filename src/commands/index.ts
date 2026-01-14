import { Command } from '../types';
import { ABOUT_CONTENT, CONTACT_CONTENT, HELP_CONTENT, PROJECTS_CONTENT, SKILLS_CONTENT, WELCOME_CONTENT } from '../content';

export const commands: Record<string, Command> = {
  '/': {
    name: '/',
    description: '显示欢迎信息',
    handler: () => ({
      id: crypto.randomUUID(),
      type: 'markdown',
      content: WELCOME_CONTENT,
      timestamp: new Date(),
    }),
  },
  about: {
    name: 'about',
    description: '关于我',
    handler: () => ({
      id: crypto.randomUUID(),
      type: 'markdown',
      content: ABOUT_CONTENT,
      timestamp: new Date(),
    }),
  },
  blog: {
    name: 'blog',
    description: '博客列表或查看博客',
    handler: async (args) => {
      const blogId = args[0];
      if (blogId) {
        try {
          const response = await fetch(`/blogs/${blogId}.md`);
          if (!response.ok) {
            return {
              id: crypto.randomUUID(),
              type: 'error',
              content: `找不到博客: ${blogId}`,
              timestamp: new Date(),
            };
          }
          const content = await response.text();
          return {
            id: crypto.randomUUID(),
            type: 'markdown',
            content,
            timestamp: new Date(),
          };
        } catch (error) {
          return {
            id: crypto.randomUUID(),
            type: 'error',
            content: `加载博客失败: ${error}`,
            timestamp: new Date(),
          };
        }
      }
      // 返回博客列表
      return {
        id: crypto.randomUUID(),
        type: 'blog-list',
        content: '',
        timestamp: new Date(),
      };
    },
  },
  projects: {
    name: 'projects',
    description: '项目展示',
    handler: () => ({
      id: crypto.randomUUID(),
      type: 'markdown',
      content: PROJECTS_CONTENT,
      timestamp: new Date(),
    }),
  },
  skills: {
    name: 'skills',
    description: '技能栈',
    handler: () => ({
      id: crypto.randomUUID(),
      type: 'markdown',
      content: SKILLS_CONTENT,
      timestamp: new Date(),
    }),
  },
  contact: {
    name: 'contact',
    description: '联系方式',
    handler: () => ({
      id: crypto.randomUUID(),
      type: 'markdown',
      content: CONTACT_CONTENT,
      timestamp: new Date(),
    }),
  },
  help: {
    name: 'help',
    description: '帮助信息',
    handler: () => ({
      id: crypto.randomUUID(),
      type: 'markdown',
      content: HELP_CONTENT,
      timestamp: new Date(),
    }),
  },
  clear: {
    name: 'clear',
    description: '清屏',
    handler: () => ({
      id: 'clear',
      type: 'text',
      content: '__CLEAR__',
      timestamp: new Date(),
    }),
  },
};
