import { useEffect } from 'react';

interface MenuBarProps {
  onCommand: (command: string) => void;
}

export const MenuBar = ({ onCommand }: MenuBarProps) => {
  const menuItems = [
    { label: '首页', command: '/' },
    { label: '关于', command: '/about' },
    { label: '博客', command: '/blog' },
    { label: '项目', command: '/projects' },
    { label: '技能', command: '/skills' },
    { label: '联系', command: '/contact' },
    { label: '帮助', command: '/help' },
  ];

  // 快捷键支持
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
