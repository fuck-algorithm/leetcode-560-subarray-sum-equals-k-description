# 项目设置指南

## 环境要求

- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0 或 **yarn**: >= 1.22.0
- **操作系统**: macOS, Linux, Windows

## 安装步骤

### 1. 克隆仓库

```bash
git clone <repository-url>
cd leetcode-560-subarray-sum-equals-k-description
```

### 2. 安装依赖

```bash
npm install
```

或使用 yarn:

```bash
yarn install
```

### 3. 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:3000 打开

## 项目脚本说明

### 开发相关

```bash
# 启动开发服务器（热重载）
npm run dev

# TypeScript类型检查
npm run type-check

# ESLint代码检查
npm run lint
```

### 构建相关

```bash
# 生产环境构建
npm run build

# 构建产物将生成在 dist/ 目录
```

### 测试相关

```bash
# 运行所有测试
npm test

# 监听模式运行测试
npm run test:watch

# 生成测试覆盖率报告
npm run test:coverage

# 覆盖率报告将生成在 coverage/ 目录
```

### Storybook（组件开发）

```bash
# 启动 Storybook
npm run storybook

# 构建 Storybook 静态文件
npm run build-storybook
```

## 项目配置文件说明

### TypeScript 配置 (`tsconfig.json`)

- 启用严格模式
- 配置路径别名（@/ 指向 src/）
- JSX 使用 React 17+ 的自动运行时

### Webpack 配置 (`webpack.config.js`)

- 开发服务器端口：3000
- 代码分割策略：
  - 算法模块异步加载
  - 可视化组件按需加载
- 支持 SVG 作为 React 组件导入

### Jest 配置 (`jest.config.js`)

- 测试环境：jsdom
- 覆盖率目标：80%
- 路径别名与 TypeScript 保持一致

### TailwindCSS 配置 (`tailwind.config.js`)

- 扫描所有 src 目录下的文件
- 自定义颜色主题
- 自定义动画效果

## 常见问题

### 1. 端口被占用

如果 3000 端口被占用，修改 `webpack.config.js`:

```javascript
devServer: {
  port: 3001, // 修改为其他端口
  // ...
}
```

### 2. 依赖安装失败

尝试清除缓存后重新安装：

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### 3. TypeScript 类型错误

确保安装了所有类型定义包：

```bash
npm install --save-dev @types/react @types/react-dom @types/d3 @types/jest
```

### 4. 构建速度慢

启用持久化缓存（Webpack 5 默认开启）：

```javascript
// webpack.config.js
module.exports = {
  cache: {
    type: 'filesystem',
  },
  // ...
};
```

### 5. 内存不足错误

增加 Node.js 内存限制：

```bash
# Linux/macOS
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# Windows
set NODE_OPTIONS=--max-old-space-size=4096
npm run build
```

## 开发工作流

### 1. 创建新功能分支

```bash
git checkout -b feature/your-feature-name
```

### 2. 开发新组件

```bash
# 创建组件文件
src/components/YourComponent.tsx

# 创建测试文件
src/components/__tests__/YourComponent.test.tsx

# 创建 Storybook 故事
src/components/YourComponent.stories.tsx
```

### 3. 运行测试

```bash
# 运行相关测试
npm test -- YourComponent

# 确保测试通过
npm run test:coverage
```

### 4. 提交代码

```bash
# 检查代码质量
npm run lint
npm run type-check

# 提交代码
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
```

## 调试技巧

### Chrome DevTools

1. 打开浏览器开发者工具（F12）
2. 在 Sources 标签页中设置断点
3. 使用 Console 查看日志输出

### React DevTools

安装 React DevTools 浏览器扩展：
- [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

### Redux DevTools

安装 Redux DevTools 浏览器扩展：
- [Chrome](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

### VS Code 调试配置

创建 `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome against localhost",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

## 性能优化建议

### 1. 使用 React.memo 优化组件渲染

```typescript
export const MyComponent = React.memo(({ data }) => {
  // Component logic
});
```

### 2. 使用 useMemo 和 useCallback

```typescript
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

### 3. 代码分割

```typescript
const LazyComponent = React.lazy(() => import('./LazyComponent'));

<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
```

### 4. 监控性能

```typescript
// 使用 Performance API
const startTime = performance.now();
// ... 执行操作
const endTime = performance.now();
console.log(`Operation took ${endTime - startTime}ms`);
```

## 生产环境部署

### 1. 构建优化

```bash
# 生产环境构建
npm run build

# 分析打包体积
npm run build -- --analyze
```

### 2. 静态文件托管

构建完成后，将 `dist/` 目录部署到：

- **Netlify**: 拖放 dist 目录到 Netlify
- **Vercel**: `vercel --prod`
- **GitHub Pages**: 配置 GitHub Actions 自动部署
- **AWS S3**: 上传 dist 目录到 S3 bucket

### 3. 环境变量

创建 `.env.production`:

```bash
REACT_APP_API_URL=https://api.production.com
REACT_APP_ANALYTICS_ID=your-analytics-id
```

## 贡献规范

- 遵循 [Conventional Commits](https://www.conventionalcommits.org/)
- 提交前运行 `npm run lint` 和 `npm test`
- 保持测试覆盖率 >= 80%
- 编写清晰的提交信息

## 获取帮助

- 查看 [README.md](README.md) 了解项目概述
- 查看 [问题跟踪](issues) 报告 bug 或请求功能
- 查阅各组件的 Storybook 文档

---

祝你开发愉快！🚀
