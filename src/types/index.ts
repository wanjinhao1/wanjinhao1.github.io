export type OutputType = 'text' | 'markdown' | 'success' | 'error' | 'info' | 'blog-list' | 'blog-detail' | 'project-detail' | 'easter-egg' | 'guestbook';

export interface CommandOutput {
  id: string;
  type: OutputType;
  content: string;
  timestamp: Date;
  command?: string;
  markdownContent?: string;
}

export interface Command {
  name: string;
  description: string;
  handler: (args: string[]) => CommandOutput | CommandOutput[] | Promise<CommandOutput | CommandOutput[]>;
}

export interface BlogMeta {
  id: string;
  title: string;
  date: string;
  summary: string;
  filename: string;
}

export interface Blog extends BlogMeta {
  content: string;
}
