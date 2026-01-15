import { useEffect, useRef, useState, useCallback } from 'react';
import { useCommandParser } from '../hooks/useCommandParser';
import { CommandOutput } from '../types';
import { CommandInput } from './CommandInput';
import { Output } from './Output';
import { MenuBar } from './MenuBar';
import { CRTOverlay } from './CRTOverlay';
import { NetscapeBrowserModal } from './NetscapeBrowserModal';
import { GuestbookModal } from './GuestbookModal';
import { DigitalSnow } from './DigitalSnow';

export const Terminal = () => {
  const { outputs, history, historyIndex, setHistoryIndex, executeCommand } = useCommandParser();
  const outputEndRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentBlogId, setCurrentBlogId] = useState<string | null>(null);
  const [guestbookOpen, setGuestbookOpen] = useState(false);
  const [guestbookUserName, setGuestbookUserName] = useState('');

  // Auto scroll to bottom
  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [outputs]);

  // Show welcome message on load
  useEffect(() => {
    executeCommand('/');
  }, []);

  // Watch for guestbook or easter-egg outputs
  useEffect(() => {
    if (outputs.length > 0) {
      const lastOutput = outputs[outputs.length - 1];
      if (lastOutput.type === 'guestbook') {
        setGuestbookUserName(lastOutput.content);
        setGuestbookOpen(true);
      }
    }
  }, [outputs]);

  // Execute command with modal support
  const handleExecuteCommand = useCallback(async (command: string) => {
    const trimmedCommand = command.trim();
    const parts = trimmedCommand.split(/\s+/);
    const commandName = parts[0].replace(/^\//, '');
    const args = parts.slice(1);

    // Check if it's a blog detail command
    if (commandName === 'blog' && args[0]) {
      setCurrentBlogId(args[0]);
      setModalOpen(true);
    }

    const result = await executeCommand(command);

    // Check if the result contains a guestbook output
    const resultArray = Array.isArray(result) ? result : [result];
    const guestbookOutput = resultArray.find((o: CommandOutput) => o.type === 'guestbook');
    if (guestbookOutput) {
      setGuestbookUserName(guestbookOutput.content);
      setGuestbookOpen(true);
    }
  }, [executeCommand]);

  return (
    <div className="terminal">
      <CRTOverlay />
      <DigitalSnow />
      <MenuBar onCommand={handleExecuteCommand} />

      <div className="screen">
        <div className="outputs">
          {outputs.map((output) => (
            <Output
              key={output.id}
              output={output}
              onOpenBlog={(id) => {
                setCurrentBlogId(id);
                setModalOpen(true);
              }}
            />
          ))}
          <div ref={outputEndRef} />
        </div>

        <CommandInput
          onExecute={handleExecuteCommand}
          history={history}
          historyIndex={historyIndex}
          setHistoryIndex={setHistoryIndex}
        />
      </div>

      <div className="status-bar">
        <span>F1=Help | F2=Blog | F3=About | F4=Projects</span>
        <span>CPU: 486DX | RAM: 640K</span>
      </div>

      <NetscapeBrowserModal
        isOpen={modalOpen}
        blogId={currentBlogId}
        onClose={() => setModalOpen(false)}
      />

      <GuestbookModal
        isOpen={guestbookOpen}
        userName={guestbookUserName}
        onClose={() => setGuestbookOpen(false)}
      />
    </div>
  );
};
