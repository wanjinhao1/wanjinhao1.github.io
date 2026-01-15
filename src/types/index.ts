export type OutputType = 'text' | 'markdown' | 'success' | 'error' | 'info' | 'blog-list' | 'easter-egg' | 'guestbook';

export interface CommandOutput {
  id: string;
  type: OutputType;
  content: string;
  timestamp: Date;
  command?: string;
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
