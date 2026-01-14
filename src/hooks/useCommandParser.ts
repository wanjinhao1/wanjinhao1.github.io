import { useState, useCallback } from 'react';
import { commands } from '../commands';
import { CommandOutput } from '../types';

export const useCommandParser = () => {
  const [outputs, setOutputs] = useState<CommandOutput[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const executeCommand = useCallback(async (input: string): Promise<CommandOutput[]> => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return [];

    // 添加到历史
    setHistory((prev) => {
      const newHistory = [...prev, trimmedInput];
      setHistoryIndex(newHistory.length);
      return newHistory;
    });

    // 解析命令
    const parts = trimmedInput.split(/\s+/);
    const commandName = parts[0].replace(/^\//, '');
    const args = parts.slice(1);

    // 查找命令
    const command = Object.values(commands).find(
      (cmd) => cmd.name === commandName
    );

    if (!command) {
      const errorOutput: CommandOutput = {
        id: crypto.randomUUID(),
        type: 'error',
        content: `未知命令: ${trimmedInput}\n输入 /help 查看可用命令`,
        timestamp: new Date(),
      };
      setOutputs((prev) => [...prev, errorOutput]);
      return [errorOutput];
    }

    // 执行命令
    const result = await command.handler(args);
    const newOutputs = Array.isArray(result) ? result : [result];

    // 处理清屏命令
    if (newOutputs.some((o) => o.id === 'clear')) {
      setOutputs([]);
      return [];
    }

    setOutputs((prev) => [...prev, ...newOutputs]);
    return newOutputs;
  }, []);

  const clearOutputs = useCallback(() => {
    setOutputs([]);
  }, []);

  return {
    outputs,
    history,
    historyIndex,
    setHistoryIndex,
    executeCommand,
    clearOutputs,
  };
};
