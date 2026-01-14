# DOS 终端风格网页设计思路

*发布日期: 2024-01-25*

## 设计理念

创建一个 DOS 风格的网页不仅仅是关于外观，更是关于**交互方式**的重新思考。

## 核心元素

### 1. 配色方案

经典的绿色终端配色：

```css
:root {
  --bg-color: #0a0a0a;      /* 深黑背景 */
  --text-color: #00ff00;    /* 亮绿文字 */
  --dim-color: #008800;     /* 暗绿装饰 */
}
```

### 2. 字体选择

等宽字体是必须的：

```css
font-family: 'Courier New', 'Consolas', monospace;
```

### 3. CRT 效果

添加扫描线和发光效果增强复古感：

```css
/* 扫描线 */
background: repeating-linear-gradient(
  0deg,
  rgba(0, 0, 0, 0.15),
  rgba(0, 0, 0, 0.15) 1px,
  transparent 1px,
  transparent 2px
);

/* 文字发光 */
text-shadow: 0 0 4px rgba(0, 255, 0, 0.3);
```

## 交互设计

### 命令解析器

实现一个简单的命令系统：

```typescript
const commands = {
  '/about': '关于页面',
  '/blog': '博客列表',
  '/help': '帮助信息'
};

function executeCommand(input) {
  const command = input.trim().toLowerCase();
  return commands[command] || '未知命令';
}
```

### 历史记录

支持上下箭头浏览历史命令：

```typescript
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      // 获取上一条命令
    } else if (e.key === 'ArrowDown') {
      // 获取下一条命令
    }
  };
}, []);
```

## 内容渲染

### Markdown 支持

使用 `react-markdown` 渲染 Markdown 内容：

```tsx
import ReactMarkdown from 'react-markdown';

<ReactMarkdown>{content}</ReactMarkdown>
```

### 自定义 Markdown 样式

让 Markdown 内容融入终端风格：

```css
.output h1 {
  text-decoration: underline;
  text-decoration-color: var(--dim-color);
}

.output a {
  text-decoration-style: dashed;
}
```

## 可访问性考虑

虽然是复古风格，但仍需保证可访问性：

1. **键盘导航** - 所有功能都可通过键盘访问
2. **ARIA 标签** - 为装饰性元素添加 `aria-hidden`
3. **对比度** - 确保文字清晰可读

## 性能优化

- 使用 React.memo 避免不必要的重渲染
- 命令输出虚拟滚动（大量输出时）
- Markdown 内容缓存

## 总结

创建复古风格的网页需要在**美学**和**可用性**之间找到平衡。关键在于：

- 保持简单的交互
- 注重细节效果
- 不牺牲可用性

---

*希望这篇文章对你有所启发！*
