import { useState, useEffect, useRef, KeyboardEvent } from 'react';

interface CommandInputProps {
  onExecute: (command: string) => void;
  history: string[];
  historyIndex: number;
  setHistoryIndex: (index: number) => void;
  onTypingChange?: (isTyping: boolean) => void;
}

export const CommandInput = ({
  onExecute,
  history,
  historyIndex,
  setHistoryIndex,
  onTypingChange,
}: CommandInputProps) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // 保持输入框聚焦
  useEffect(() => {
    const handleClick = () => {
      inputRef.current?.focus();
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // 处理历史命令浏览
  useEffect(() => {
    if (historyIndex >= 0 && historyIndex < history.length) {
      setInput(history[historyIndex]);
    } else if (historyIndex === -1) {
      setInput('');
    }
  }, [historyIndex, history]);

  // 通知输入状态变化
  useEffect(() => {
    if (input.length > 0) {
      onTypingChange?.(true);
      // 清除之前的定时器
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } else if (input.length === 0) {
      onTypingChange?.(false);
    }
  }, [input, onTypingChange]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const command = input.trim();
      if (command) {
        onExecute(command);
        setInput('');
        setHistoryIndex(-1);
        onTypingChange?.(false);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHistoryIndex(Math.min(historyIndex + 1, history.length - 1));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHistoryIndex(Math.max(historyIndex - 1, -1));
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      onExecute('/clear');
    }
  };

  return (
    <div className="command-input">
      <span className="prompt">C:\USERS\GUEST&gt;</span>
      {/* Hidden input for capturing keyboard input */}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="input-field"
        autoComplete="off"
        spellCheck={false}
        autoFocus
        style={{
          position: 'absolute',
          opacity: 0,
          top: 0,
          left: 0,
          width: '1px',
          height: '1px',
          padding: 0,
          border: 'none',
        }}
      />
      {/* Display text with cursor */}
      <span className="input-display">
        {input}
        <span ref={cursorRef} className="cursor">▋</span>
      </span>
    </div>
  );
};
