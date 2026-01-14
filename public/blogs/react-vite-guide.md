# 使用 React + Vite 构建现代前端应用

*发布日期: 2024-01-20*

## 简介

Vite 是新一代的前端构建工具，以其极速的开发服务器启动和热更新而闻名。本文将分享使用 Vite 和 React 构建高性能前端应用的经验。

## 为什么选择 Vite？

### 传统构建工具的痛点

传统构建工具（如 Webpack）在开发模式下需要先打包整个应用，导致启动缓慢：

```
传统工具: 启动需要 30秒 - 2分钟
热更新:   需要 1-5秒
```

### Vite 的优势

Vite 利用浏览器原生 ES 模块支持，实现了：

```
Vite:     启动需要 1-3秒
热更新:   毫秒级
```

## 项目初始化

```bash
# 创建 Vite + React + TypeScript 项目
npm create vite@latest my-app -- --template react-ts

# 进入项目目录
cd my-app

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 核心配置

### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
})
```

## 最佳实践

### 1. 组件懒加载

使用 `React.lazy` 和 `Suspense` 实现代码分割：

```typescript
const Home = React.lazy(() => import('./pages/Home'));
const About = React.lazy(() => import('./pages/About'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Suspense>
  );
}
```

### 2. 使用 TypeScript 类型

充分利用 TypeScript 的类型系统：

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const UserProfile = ({ user }: { user: User }) => {
  return <div>{user.name}</div>;
};
```

### 3. 状态管理

对于小型应用，使用 `useReducer` 或 Context API 就足够了：

```typescript
const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    default:
      return state;
  }
}
```

## 部署到 GitHub Pages

```bash
# 安装 gh-pages
npm install -D gh-pages

# 在 package.json 添加部署脚本
npm run deploy
```

## 总结

Vite + React 是现代前端开发的优秀组合，能够显著提升开发体验和应用性能。

- **开发体验** - 快速启动，即时热更新
- **构建速度** - 使用 Rollup 进行高效打包
- **生态系统** - 完整的插件系统

---

*Happy Coding! 🚀*
