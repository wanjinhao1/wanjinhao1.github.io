import { useEffect } from 'react';

interface MenuBarProps {
  onCommand: (command: string) => void;
}

export const MenuBar = ({ onCommand }: MenuBarProps) => {
  const menuItems = [
    { label: 'Home', command: '/' },
    { label: 'About', command: '/about' },
    { label: 'Blog', command: '/blog' },
    { label: 'Projects', command: '/projects' },
    { label: 'Skills', command: '/skills' },
    { label: 'Contact', command: '/contact' },
    { label: 'Help', command: '/help' },
  ];

  // Keyboard shortcuts support
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case 'F1':
          e.preventDefault();
          onCommand('/help');
          break;
        case 'F2':
          e.preventDefault();
          onCommand('/blog');
          break;
        case 'F3':
          e.preventDefault();
          onCommand('/about');
          break;
        case 'F4':
          e.preventDefault();
          onCommand('/projects');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onCommand]);

  return (
    <div className="menu-bar">
      {menuItems.map((item) => (
        <button
          key={item.command}
          className="menu-item"
          onClick={() => onCommand(item.command)}
        >
          [{item.label}]
        </button>
      ))}
    </div>
  );
};
