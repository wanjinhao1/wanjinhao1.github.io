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
import { IE6BrowserModal } from './IE6BrowserModal';

export const Terminal = () => {
  const { outputs, history, historyIndex, setHistoryIndex, executeCommand } = useCommandParser();
  const outputEndRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentBlogId, setCurrentBlogId] = useState<string | null>(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [guestbookOpen, setGuestbookOpen] = useState(false);
  const [guestbookUserName, setGuestbookUserName] = useState('');
  const [snowActive, setSnowActive] = useState(true);
  const [snowHighDensity, setSnowHighDensity] = useState(false);

  // Auto scroll to bottom
  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [outputs]);

  // Show welcome message on load with high density snow
  useEffect(() => {
    setSnowHighDensity(true);
    setSnowActive(true);
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

  // Handle typing state
  const handleTypingChange = useCallback((isTyping: boolean) => {
    setSnowActive(!isTyping);
  }, []);

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

    // Check if it's a project detail command
    if (commandName === 'project' && args[0]) {
      setCurrentProjectId(args[0]);
      setProjectModalOpen(true);
    }

    // Check if it's the / command - enable high density snow
    if (commandName === '/' || trimmedCommand === '/') {
      setSnowHighDensity(true);
      setSnowActive(true);
    } else {
      setSnowHighDensity(false);
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
      <DigitalSnow active={snowActive} highDensity={snowHighDensity} />
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
              onOpenProject={(id) => {
                setCurrentProjectId(id);
                setProjectModalOpen(true);
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
          onTypingChange={handleTypingChange}
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

      <IE6BrowserModal
        isOpen={projectModalOpen}
        projectId={currentProjectId}
        onClose={() => setProjectModalOpen(false)}
      />

      <GuestbookModal
        isOpen={guestbookOpen}
        userName={guestbookUserName}
        onClose={() => setGuestbookOpen(false)}
      />
    </div>
  );
};
