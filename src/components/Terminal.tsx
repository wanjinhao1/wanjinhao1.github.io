import { useEffect, useRef } from 'react';
import { useCommandParser } from '../hooks/useCommandParser';
import { CommandInput } from './CommandInput';
import { Output } from './Output';
import { MenuBar } from './MenuBar';
import { CRTOverlay } from './CRTOverlay';

export const Terminal = () => {
  const { outputs, history, historyIndex, setHistoryIndex, executeCommand } = useCommandParser();
  const outputEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [outputs]);

  // 初始显示欢迎信息
  useEffect(() => {
    executeCommand('/');
  }, []);

  return (
    <div className="terminal">
      <CRTOverlay />
      <MenuBar onCommand={executeCommand} />

      <div className="screen">
        <div className="outputs">
          {outputs.map((output) => (
            <Output key={output.id} output={output} />
          ))}
          <div ref={outputEndRef} />
        </div>

        <CommandInput
          onExecute={executeCommand}
          history={history}
          historyIndex={historyIndex}
          setHistoryIndex={setHistoryIndex}
        />
      </div>

      <div className="status-bar">
        <span>F1=帮助 | F2=博客 | F3=关于</span>
        <span>CPU: 486DX | RAM: 640K</span>
      </div>
    </div>
  );
};
