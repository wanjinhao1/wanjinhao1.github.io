import { useEffect, useState } from 'react';

interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  timestamp: string;
}

interface GuestbookModalProps {
  isOpen: boolean;
  userName: string;
  onClose: () => void;
}

// 预设的留言数据
const initialMessages: GuestbookEntry[] = [
  {
    id: '1',
    name: 'Alice',
    message: 'Cool DOS-style website! Reminds me of the good old days.',
    timestamp: '2024-01-15 10:30',
  },
  {
    id: '2',
    name: 'Bob',
    message: 'Love the retro aesthetic! The CRT effects are amazing.',
    timestamp: '2024-01-16 14:22',
  },
  {
    id: '3',
    name: 'Charlie',
    message: 'This is so creative! Where did you get the inspiration?',
    timestamp: '2024-01-18 09:15',
  },
];

// 从 localStorage 加载留言
const loadMessages = (): GuestbookEntry[] => {
  try {
    const stored = localStorage.getItem('guestbook-messages');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load messages:', e);
  }
  return initialMessages;
};

// 保存留言到 localStorage
const saveMessages = (messages: GuestbookEntry[]) => {
  try {
    localStorage.setItem('guestbook-messages', JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save messages:', e);
  }
};

export const GuestbookModal = ({ isOpen, userName, onClose }: GuestbookModalProps) => {
  const [messages, setMessages] = useState<GuestbookEntry[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSigned, setIsSigned] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMessages(loadMessages());
      setNewMessage('');
      setIsSigned(false);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!newMessage.trim()) return;

    const entry: GuestbookEntry = {
      id: Date.now().toString(),
      name: userName,
      message: newMessage.trim(),
      timestamp: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    };

    const updatedMessages = [entry, ...messages];
    setMessages(updatedMessages);
    saveMessages(updatedMessages);
    setNewMessage('');
    setIsSigned(true);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="guestbook-browser" onClick={(e) => e.stopPropagation()}>
        {/* Title Bar */}
        <div className="guestbook-titlebar">
          <div className="guestbook-titlebar-left">
            <button className="guestbook-control guestbook-close" onClick={onClose}>✕</button>
            <button className="guestbook-control guestbook-maximize">□</button>
            <button className="guestbook-control guestbook-minimize">−</button>
          </div>
          <div className="guestbook-titlebar-title">
            📝 Guestbook - Netscape Navigator
          </div>
          <div className="guestbook-titlebar-right"></div>
        </div>

        {/* Menu Bar */}
        <div className="guestbook-menu">
          <span className="guestbook-menu-item">File</span>
          <span className="guestbook-menu-item">Edit</span>
          <span className="guestbook-menu-item">View</span>
          <span className="guestbook-menu-item">Go</span>
          <span className="guestbook-menu-item">Bookmarks</span>
          <span className="guestbook-menu-item">Options</span>
          <span className="guestbook-menu-item">Directory</span>
          <span className="guestbook-menu-item">Window</span>
          <span className="guestbook-menu-item">Help</span>
        </div>

        {/* Navigation Toolbar */}
        <div className="guestbook-toolbar">
          <button className="guestbook-nav-btn">Home</button>
          <button className="guestbook-nav-btn">Reload</button>
          <button className="guestbook-nav-btn">Print</button>
          <button className="guestbook-nav-btn">Find</button>
          <div className="guestbook-toolbar-spacer"></div>
          <span className="guestbook-logo">N</span>
        </div>

        {/* URL Bar */}
        <div className="guestbook-urlbar">
          <span className="guestbook-url-label">Location:</span>
          <input
            className="guestbook-url-input"
            value={`http://wanjinhao.github.io/guestbook.html`}
            readOnly
          />
        </div>

        {/* Content Area */}
        <div className="guestbook-content">
          <div className="guestbook-document">
            <div className="guestbook-doc-header">
              <h1 className="guestbook-doc-title">📝 Guestbook</h1>
              <p className="guestbook-doc-subtitle">Leave a message for future visitors!</p>
              <hr className="guestbook-doc-hr" />
            </div>

            {/* Sign In Section */}
            <div className="guestbook-signin">
              <p className="guestbook-welcome">
                <strong>Signed in as:</strong> <span className="guestbook-username">{userName}</span>
              </p>
            </div>

            {/* New Message Form */}
            <div className="guestbook-form">
              <label className="guestbook-label">Your Message:</label>
              <textarea
                className="guestbook-textarea"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={3}
                maxLength={500}
              />
              <div className="guestbook-form-footer">
                <span className="guestbook-char-count">{newMessage.length}/500</span>
                <button className="guestbook-submit-btn" onClick={handleSubmit}>
                  Sign Guestbook
                </button>
              </div>
              {isSigned && (
                <p className="guestbook-success">✓ Message added successfully!</p>
              )}
            </div>

            <hr className="guestbook-doc-hr" />

            {/* Messages List */}
            <div className="guestbook-messages">
              <h2 className="guestbook-messages-title">Recent Messages ({messages.length})</h2>
              {messages.length === 0 ? (
                <p className="guestbook-empty">No messages yet. Be the first to sign!</p>
              ) : (
                <div className="guestbook-message-list">
                  {messages.map((msg) => (
                    <div key={msg.id} className="guestbook-message-entry">
                      <div className="guestbook-message-header">
                        <span className="guestbook-message-name">{msg.name}</span>
                        <span className="guestbook-message-time">{msg.timestamp}</span>
                      </div>
                      <p className="guestbook-message-text">{msg.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="guestbook-statusbar">
          <span>Document: Done</span>
          <span>{messages.length} entries</span>
        </div>
      </div>
    </div>
  );
};
