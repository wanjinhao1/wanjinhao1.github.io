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

    // Add to history
    setHistory((prev) => {
      const newHistory = [...prev, trimmedInput];
      setHistoryIndex(newHistory.length);
      return newHistory;
    });

    // Parse command
    const parts = trimmedInput.split(/\s+/);
    const commandName = parts[0].replace(/^\//, '');
    const args = parts.slice(1);

    // Find command
    const command = Object.values(commands).find(
      (cmd) => cmd.name === commandName
    );

    if (!command) {
      const errorOutput: CommandOutput = {
        id: crypto.randomUUID(),
        type: 'error',
        content: `Unknown command: ${trimmedInput}\nType /help to see available commands`,
        timestamp: new Date(),
        command: trimmedInput,
      };
      setOutputs((prev) => [...prev, errorOutput]);
      return [errorOutput];
    }

    // Execute command
    const result = await command.handler(args);
    const newOutputs = Array.isArray(result) ? result : [result];

    // Handle clear command
    if (newOutputs.some((o) => o.id === 'clear')) {
      setOutputs([]);
      return [];
    }

    // Add command to each output
    const outputsWithCommand = newOutputs.map((o) => ({
      ...o,
      command: trimmedInput,
    }));

    setOutputs((prev) => [...prev, ...outputsWithCommand]);
    return outputsWithCommand;
  }, []);

  return {
    outputs,
    history,
    historyIndex,
    setHistoryIndex,
    executeCommand,
  };
};
