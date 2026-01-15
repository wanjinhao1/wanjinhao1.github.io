# Building Modern Frontend Applications with React + Vite

*Published: 2024-01-20*

## Introduction

Vite is a next-generation front-end build tool known for its lightning-fast dev server startup and hot module replacement. This article shares my experience using Vite with React to build high-performance applications.

## Why Vite?

### Pain Points with Traditional Build Tools

Traditional build tools (like Webpack) need to bundle the entire application before starting development mode, resulting in slow startup:

```
Traditional: Startup takes 30s - 2min
Hot Update:  Takes 1-5s
```

### Vite's Advantages

Vite leverages the browser's native ES module support:

```
Vite:       Startup takes 1-3s
Hot Update: Milliseconds
```

## Project Initialization

```bash
# Create Vite + React + TypeScript project
npm create vite@latest my-app -- --template react-ts

# Enter project directory
cd my-app

# Install dependencies
npm install

# Start dev server
npm run dev
```

## Core Configuration

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

## Best Practices

### 1. Lazy Loading Components

Use `React.lazy` and `Suspense` for code splitting:

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

### 2. TypeScript Types

Leverage TypeScript's type system:

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

### 3. State Management

For small apps, `useReducer` or Context API is sufficient:

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

## Deploy to GitHub Pages

```bash
# Install gh-pages
npm install -D gh-pages

# Add deploy script in package.json
npm run deploy
```

## Summary

Vite + React is an excellent combination for modern front-end development, significantly improving both development experience and application performance.

- **Dev Experience** - Fast startup, instant HMR
- **Build Speed** - Efficient bundling with Rollup
- **Ecosystem** - Rich plugin system

---

*Happy Coding! 🚀*
