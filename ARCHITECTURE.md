# Twitter Like Catcher V2.0 - 项目架构介绍

## 项目概述

**Twitter Like Catcher** 是一款基于Chrome扩展的智能推文收集工具，能够自动捕获用户在Twitter上点赞的推文，并将其同步到云端数据库。该工具特别适合开发者、内容创作者和社交媒体爱好者，帮助他们收集有价值的内容并进行分类管理。

## 系统架构设计

### 技术栈

**前端技术栈:**
- React 18.2.0 + React-DOM 19.2.0
- TypeScript 5.8.2 (类型安全)
- Vite 6.2.0 (构建工具)
- TailwindCSS (样式框架)

**后端与云服务:**
- Supabase (实时数据库与认证)
- Chrome Extension API (浏览器集成)

**开发工具:**
- Node.js 运行时
- npm/yarn 包管理
- TypeScript 编译器

### 架构图

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Twitter网页   │    │ Chrome扩展程序  │    │  Supabase云端   │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ 内容脚本    │ │◄──►│ │ 后台服务    │ │◄──►│ │ 数据库表    │ │
│ │ (捕获点赞)  │ │    │ │ (数据处理)  │ │    │ │ (tweets)    │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│                 │    │ │ 弹窗界面    │ │    │ │ 认证服务    │ │
│                 │    │ │ (React UI)  │ │    │ │ (用户管理)  │ │
│                 │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 核心功能模块详解

### 1. 内容脚本模块 (content_script.ts)

**职责:** 在Twitter页面中监听页面交互，捕获用户点赞行为

**核心功能:**
- 监听点赞按钮点击事件
- 提取推文元数据（ID、作者、内容、URL）
- 支持引用推文的嵌套提取
- 向后台服务发送捕获数据

**技术实现:**
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

### 2. 后台服务模块 (background.ts)

**职责:** 处理数据存储、云端同步和消息路由

**核心功能:**
- 接收内容脚本发送的推文数据
- 调用关键词分析服务
- 与Supabase数据库交互
- 管理扩展图标状态和通知

**技术实现:**
```typescript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TWEET_LIKED') {
    const tweetWithTags = analyzeTweet(message.payload);
    await addTweet(tweetWithTags);
    // 更新扩展图标状态
    chrome.action.setBadgeText({ text: '✓' });
  }
});
```

### 3. 用户界面模块 (App.tsx)

**职责:** 提供美观的弹窗界面，展示已捕获的推文

**核心功能:**
- 显示推文列表（支持分页）
- 实时刷新数据
- 错误处理与加载状态
- 响应式设计

**技术特点:**
- React函数组件 + Hooks
- TypeScript类型安全
- TailwindCSS现代化样式
- 组件化设计（TweetCard、Spinner等）

### 4. 云端同步模块 (supabaseService.ts)

**职责:** 管理与Supabase数据库的连接和数据操作

**核心功能:**
- 推文数据的增删改查
- 实时数据同步
- 错误处理与重试机制

**数据库设计:**
```sql
-- tweets 表结构
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

### 5. 智能分析模块 (keywordService.ts)

**职责:** 基于内容关键词为推文自动添加标签

**标签分类体系:**
- react: ['react', 'reactjs', 'nextjs', 'remix']
- typescript: ['typescript', 'ts']
- ai: ['ai', 'artificial intelligence', 'machine learning', 'llm', 'gemini']
- webdev: ['web development', 'frontend', 'backend', 'css']
- design: ['ui/ux', 'design system', 'figma', 'tailwindcss']
- database: ['database', 'sql', 'postgres', 'supabase']
- opensource: ['open source', 'oss']

## 数据流设计

### 1. 推文捕获流程
```
用户点赞 → 内容脚本监听 → 提取推文数据 → 发送消息 → 后台处理 → 关键词分析 → 云端存储
```

### 2. 数据展示流程
```
用户打开弹窗 → 请求最近推文 → 云端查询 → 返回数据 → 前端渲染 → 用户查看
```

## 代码结构

```
twitter-like-catcher-(cloud-sync)/
├── src/
│   ├── components/     # React组件
│   │   ├── TweetCard.tsx    # 推文卡片组件
│   │   ├── Spinner.tsx      # 加载指示器
│   │   └── icons.tsx        # 图标组件
│   ├── services/       # 业务服务
│   │   ├── supabaseService.ts    # Supabase服务
│   │   └── keywordService.ts     # 关键词分析服务
│   ├── types.ts        # TypeScript类型定义
│   ├── App.tsx         # 主应用组件
│   ├── background.ts   # 后台服务
│   └── content_script.ts # 内容脚本
├── supabase/           # 数据库迁移文件
├── manifest.json       # 扩展配置
├── package.json        # 依赖配置
└── tsconfig.json       # TypeScript配置
```

## 项目亮点与优势

### 1. 技术优势
- **现代化技术栈** - 使用React 18、TypeScript、Vite等最新技术
- **类型安全** - 完整的TypeScript类型定义
- **模块化设计** - 清晰的代码组织和职责分离
- **云端集成** - 无缝集成Supabase提供实时同步

### 2. 用户体验
- **无侵入式** - 不影响正常的Twitter使用体验
- **即时反馈** - 点赞后立即捕获，扩展图标显示状态
- **智能分类** - 自动标签系统帮助快速查找相关内容
- **跨设备同步** - 数据云端存储，支持多设备访问

### 3. 扩展性
- **可配置的关键词系统** - 支持自定义标签和关键词
- **模块化架构** - 易于添加新功能和集成
- **开放API** - 可以扩展到其他社交媒体平台

## 技术挑战与解决方案

### 1. Twitter DOM结构变化
**挑战:** Twitter经常更新DOM结构，可能导致选择器失效
**解决方案:** 使用多种选择器策略，定期更新选择器

### 2. 数据同步冲突
**挑战:** 多设备同时操作可能导致数据冲突
**解决方案:** 使用Supabase的upsert操作和时间戳管理

### 3. 浏览器兼容性
**挑战:** 不同浏览器对Chrome API的支持差异
**解决方案:** 使用标准Chrome Extension API，提供降级方案

## 未来扩展方向

1. **多平台支持** - 扩展到Instagram、Facebook等其他社交平台
2. **AI内容分析** - 集成更高级的自然语言处理功能
3. **团队协作** - 支持团队共享和协作标签
4. **数据分析** - 提供用户行为分析和内容趋势报告
