# Twitter Like Catcher V2.0 - 开发者指南

## 概述

本指南为开发者提供Twitter Like Catcher项目的完整开发文档，包括环境搭建、代码结构、开发流程和部署说明。

## 开发环境要求

### 必需软件

- **Node.js** 18+ (推荐使用最新LTS版本)
- **npm** 8+ 或 **yarn** 1.22+
- **Chrome浏览器** (用于测试和调试)
- **Git** (版本控制)
- **Supabase账户** (云端数据库服务)

### 开发工具推荐

- **VS Code** (代码编辑器)
- **TypeScript** 5.8.2+
- **Vite** 6.2.0+ (构建工具)
- **React Developer Tools** (浏览器扩展)
- **Chrome DevTools** (调试工具)

## 项目初始化

### 1. 克隆项目

```bash
# 克隆仓库
git clone <repository-url>
cd twitter-like-catcher-(cloud-sync)

# 安装依赖
npm install
```

**如果遇到依赖冲突错误：**
```bash
# 方法1：使用 --legacy-peer-deps
npm install --legacy-peer-deps

# 方法2：使用 yarn（推荐）
npm install -g yarn
yarn install

# 方法3：清理缓存后重试
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 2. 环境配置

```bash
# 复制环境变量模板
cp .env.example .env.local
```

编辑 `.env.local` 文件，配置Supabase连接信息：

```env
# Supabase 配置
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# 开发环境配置 (可选)
VITE_PORT=3000
VITE_HOST=localhost
```

### 3. Supabase 设置

1. **创建 Supabase 项目**
   - 访问 [supabase.com](https://supabase.com)
   - 创建新项目并获取项目URL和API密钥

2. **数据库表创建**
   - 使用提供的SQL迁移文件创建tweets表
   - 或手动执行以下SQL：

```sql
CREATE TABLE tweets (
  id VARCHAR PRIMARY KEY,
  author_name VARCHAR NOT NULL,
  author_handle VARCHAR NOT NULL,
  tweet_text TEXT NOT NULL,
  tweet_url VARCHAR NOT NULL,
  tags VARCHAR[],
  quoted_tweet JSONB,
  captured_at TIMESTAMP DEFAULT NOW()
);
```

3. **权限配置**
   - 确保anon角色有读写权限
   - 配置RLS（Row Level Security）策略

## 代码结构详解

### 项目目录结构

```
twitter-like-catcher-(cloud-sync)/
├── src/
│   ├── components/           # React组件
│   │   ├── TweetCard.tsx     # 推文卡片组件
│   │   ├── Spinner.tsx       # 加载指示器
│   │   └── icons.tsx         # SVG图标组件
│   ├── services/             # 业务服务层
│   │   ├── supabaseService.ts    # Supabase数据库服务
│   │   └── keywordService.ts     # 关键词分析服务
│   ├── types.ts              # TypeScript类型定义
│   ├── App.tsx               # 主应用组件
│   ├── background.ts         # 后台服务脚本
│   └── content_script.ts     # 内容脚本
├── public/                   # 静态资源
├── supabase/                 # 数据库迁移
│   └── migrations/
│       └── 20251019_create_tweets_table.sql
├── manifest.json             # Chrome扩展配置
├── package.json              # 依赖和脚本配置
├── tsconfig.json             # TypeScript配置
├── vite.config.ts            # Vite构建配置
└── .env.example              # 环境变量模板
```

### 核心模块说明

#### 1. 类型定义 (types.ts)

```typescript
export interface Tweet {
  id: string;
  captured_at: string;
  author_name: string;
  author_handle: string;
  tweet_text: string;
  tweet_url: string;
  tags?: string[];
  quoted_tweet?: QuotedTweet;
}

export type TweetForStorage = Omit<Tweet, 'captured_at'>;
```

#### 2. 内容脚本 (content_script.ts)

**主要职责：**
- 监听Twitter页面的点赞事件
- 提取推文数据
- 发送消息给后台服务

**关键实现：**
```typescript
// 监听点赞事件
document.body.addEventListener('click', (event) => {
  const likeButton = target.closest('[data-testid="like"]');
  if (likeButton) {
    const tweetData = extractTweetData(tweetArticle);
    chrome.runtime.sendMessage({ 
      type: 'TWEET_LIKED', 
      payload: tweetData 
    });
  }
});
```

#### 3. 后台服务 (background.ts)

**主要职责：**
- 处理消息事件
- 调用服务层方法
- 管理扩展状态

**关键实现：**
```typescript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TWEET_LIKED') {
    const tweetWithTags = analyzeTweet(message.payload);
    await addTweet(tweetWithTags);
    chrome.action.setBadgeText({ text: '✓' });
  }
});
```

#### 4. Supabase服务 (supabaseService.ts)

**主要方法：**
- `addTweet()` - 添加或更新推文
- `getRecentTweets()` - 获取最近推文

**错误处理：**
```typescript
export const addTweet = async (tweet: TweetForStorage) => {
  const { data, error } = await supabase
    .from('tweets')
    .upsert(tweet, { onConflict: 'id' });

  if (error) {
    console.error('Supabase error:', error.message);
    throw new Error(`Failed to save tweet: ${error.message}`);
  }
  
  return data;
};
```

#### 5. 关键词服务 (keywordService.ts)

**标签系统：**
```typescript
const KEYWORD_MAP: Record<string, string[]> = {
  'react': ['react', 'reactjs', 'nextjs', 'remix'],
  'typescript': ['typescript', 'ts'],
  // ... 更多标签
};

export const analyzeTweet = (tweet: TweetForStorage): TweetForStorage => {
  const content = (tweet.tweet_text + ' ' + (tweet.quoted_tweet?.tweet_text || '')).toLowerCase();
  const tags = new Set<string>();

  for (const [tag, keywords] of Object.entries(KEYWORD_MAP)) {
    for (const keyword of keywords) {
      if (content.includes(keyword.toLowerCase())) {
        tags.add(tag);
        break;
      }
    }
  }

  return { ...tweet, tags: Array.from(tags) };
};
```

## 开发流程

### 1. 本地开发

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 2. Chrome扩展加载

1. **开发模式加载**
   - 打开 `chrome://extensions/`
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择 `dist` 目录

2. **热重载配置**
   - Vite会自动监听文件变化
   - 修改代码后需要手动刷新扩展

### 3. 调试技巧

#### 内容脚本调试
```javascript
// 在Twitter页面按F12打开开发者工具
// 查看Console标签页
console.log("Content script loaded");
```

#### 后台服务调试
1. 右键点击扩展图标
2. 选择"管理扩展程序"
3. 点击"背景页"链接查看日志

#### 消息传递调试
```typescript
// 在content_script.ts中
chrome.runtime.sendMessage({ type: 'TEST' }, (response) => {
  console.log('Response from background:', response);
});

// 在background.ts中
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TEST') {
    sendResponse({ success: true, data: 'Hello from background' });
  }
});
```

## 测试策略

### 1. 单元测试

**测试文件结构：**
```
src/
├── __tests__/
│   ├── services/
│   │   ├── supabaseService.test.ts
│   │   └── keywordService.test.ts
│   └── components/
│       └── TweetCard.test.tsx
```

**示例测试：**
```typescript
// keywordService.test.ts
import { analyzeTweet } from '../keywordService';

describe('analyzeTweet', () => {
  it('should add react tag for react-related content', () => {
    const tweet = {
      id: '1',
      author_name: 'Test',
      author_handle: 'test',
      tweet_text: 'Just learned React hooks!',
      tweet_url: 'https://twitter.com/test/status/1'
    };

    const result = analyzeTweet(tweet);
    expect(result.tags).toContain('react');
  });
});
```

### 2. 集成测试

**测试场景：**
- 推文捕获流程
- 数据同步功能
- 错误处理机制

### 3. E2E测试

**测试工具推荐：**
- **Puppeteer** - 浏览器自动化
- **Cypress** - 端到端测试

## 构建与部署

### 1. 生产构建

```bash
# 构建生产版本（包括Chrome扩展文件）
npm run build

# 仅构建Chrome扩展文件
npm run build:extension

# 预览生产版本
npm run preview
```

### 2. Chrome Web Store发布

1. **准备发布材料**
   - 扩展图标 (128x128, 48x48, 16x16)
   - 截图和演示视频
   - 详细描述和关键词

2. **打包扩展**
   ```bash
   # 压缩dist目录
   zip -r twitter-like-catcher.zip dist/
   ```

3. **发布流程**
   - 访问 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - 支付5美元开发者注册费
   - 上传扩展包
   - 填写应用信息
   - 提交审核

### 3. 环境变量管理

**生产环境配置：**
```env
# .env.production
SUPABASE_URL=production_supabase_url
SUPABASE_ANON_KEY=production_anon_key
```

**构建时注入：**
```javascript
// vite.config.ts
export default defineConfig({
  define: {
    'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL),
    'process.env.SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY)
  }
});
```

## 代码规范

### 1. TypeScript规范

- 使用严格模式 (`"strict": true`)
- 禁用any类型 (`"noImplicitAny": true`)
- 强制返回类型注解
- 使用接口而非类型别名

### 2. React最佳实践

- 使用函数组件和Hooks
- 避免内联样式
- 合理使用useCallback和useMemo
- 错误边界处理

### 3. Git提交规范

```bash
# 功能开发
feat: add tweet filtering by tags

# 修复bug
fix: resolve supabase connection timeout

# 文档更新
docs: update development guide

# 代码重构
refactor: simplify keyword matching algorithm

# 性能优化
perf: optimize tweet extraction performance
```

## 常见问题与解决方案

### 1. 开发环境问题

#### TypeScript类型错误
**问题：** `chrome is not defined`
**解决方案：**
```typescript
// 在文件顶部添加声明
declare const chrome: any;
```

#### Vite构建失败
**问题：** `Module not found: Error: Can't resolve 'fs'`
**解决方案：**
```javascript
// vite.config.ts
export default defineConfig({
  define: {
    global: 'globalThis'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

### 2. Chrome扩展问题

#### 权限错误
**问题：** `Missing host permission for the URL`
**解决方案：** 检查manifest.json中的host_permissions配置

#### JSX语法错误
**问题：** `The JSX syntax extension is not currently enabled`
**解决方案：** 已将所有.js文件重命名为.jsx文件，并更新了manifest.json中的引用

#### Chrome扩展文件加载错误
**问题：** `无法为脚本加载 JavaScript"content_script.js"`
**解决方案：** 更新manifest.json中的文件引用，将.js改为.jsx

#### 内容脚本不加载
**问题：** 内容脚本未在Twitter页面执行
**解决方案：**
- 检查matches配置是否正确
- 确认扩展已正确加载
- 查看Chrome扩展管理页面是否有错误

### 3. Supabase集成问题

#### 连接失败
**问题：** `Network request failed`
**解决方案：**
- 检查网络连接
- 确认Supabase URL和Key正确
- 验证CORS配置

#### 权限错误
**问题：** `New row violates row-level security policy`
**解决方案：**
- 检查RLS策略配置
- 确保anon角色有适当权限
- 临时禁用RLS进行测试

## 性能优化

### 1. 构建优化

```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  }
});
```

### 2. 运行时优化

- **防抖处理** - 避免频繁的DOM查询
- **缓存机制** - 本地缓存减少网络请求
- **错误重试** - 网络失败时的重试策略

### 3. 内存管理

- 及时清理事件监听器
- 避免内存泄漏
- 合理使用异步操作

## 安全考虑

### 1. 数据安全

- **API密钥保护** - 不要硬编码在源码中
- **输入验证** - 验证所有外部输入
- **CORS配置** - 正确配置跨域策略

### 2. 用户隐私

- **最小权限原则** - 只请求必要的权限
- **数据加密** - 敏感数据加密存储
- **隐私政策** - 明确数据使用政策

### 3. 扩展安全

- **内容安全策略** - 防止XSS攻击
- **权限最小化** - 只申请必要的Chrome权限
- **代码审计** - 定期检查安全漏洞

## 贡献指南

### 1. 开发流程

1. Fork项目仓库
2. 创建功能分支 (`git checkout -b feature/your-feature`)
3. 提交更改 (`git commit -m 'Add some feature'`)
4. 推送到分支 (`git push origin feature/your-feature`)
5. 创建Pull Request

### 2. 代码要求

- 通过所有测试
- 遵循代码规范
- 包含适当的文档
- 提供测试用例

### 3. 问题报告

**提交Issue时请包含：**
- 详细的错误描述
- 复现步骤
- 浏览器和系统信息
- 相关日志信息

## 更新日志

### 版本管理

使用语义化版本控制 (Semantic Versioning)：
- **主版本号** - 重大架构变更
- **次版本号** - 新功能添加
- **修订号** - Bug修复和优化

### 发布流程

1. 创建发布分支
2. 更新版本号和CHANGELOG
3. 创建Git标签
4. 构建生产版本
5. 发布到Chrome Web Store

---

**感谢您为Twitter Like Catcher项目做贡献！**
