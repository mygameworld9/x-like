# X-Like / Twitter 点赞收集器

A powerful browser extension to capture and sync your liked tweets with dual storage support and bilingual interface.

一个强大的浏览器扩展，可以捕获和同步您点赞的推文，支持双重存储和双语界面。

## ✨ Features / 功能特性

### English
- 🎯 **Automatic Capture**: Automatically saves tweets when you like them
- ☁️ **Dual Storage**: Local storage + optional Supabase cloud sync
- 🌐 **Bilingual Support**: Full support for English and Chinese (中文)
- 📊 **Statistics Dashboard**: View total and daily capture counts
- 🔍 **Smart Selection**: Browse, select, and export specific tweets
- 💾 **JSON Export**: Export all or selected tweets to JSON format
- 🎨 **Modern UI**: Beautiful dark theme interface with Tailwind CSS
- 🔒 **Privacy First**: All data stored locally by default

### 中文
- 🎯 **自动捕获**：点赞推文时自动保存
- ☁️ **双重存储**：本地存储 + 可选的 Supabase 云同步
- 🌐 **双语支持**：完全支持英语和中文界面
- 📊 **统计仪表板**：查看总计和每日捕获数量
- 🔍 **智能选择**：浏览、选择和导出特定推文
- 💾 **JSON 导出**：导出全部或选中的推文为 JSON 格式
- 🎨 **现代界面**：采用 Tailwind CSS 的精美深色主题
- 🔒 **隐私优先**：默认所有数据本地存储

## 📦 Tech Stack / 技术栈

- **Frontend / 前端**: React 18 + TypeScript
- **Styling / 样式**: Tailwind CSS 4
- **Build / 构建**: Vite + esbuild
- **Database / 数据库**: Supabase (optional / 可选)
- **Storage / 存储**: Chrome Extension Storage API
- **i18n / 国际化**: Custom React Context with persistent storage

## 🚀 Installation / 安装步骤

### 1. Clone / 克隆项目

```bash
git clone https://github.com/mygameworld9/x-like.git
cd x-like
```

### 2. Install Dependencies / 安装依赖

```bash
npm install
```

### 3. Configure Supabase (Optional) / 配置 Supabase（可选）

Create database table in Supabase / 在 Supabase 中创建数据库表：

```sql
CREATE TABLE IF NOT EXISTS public.tweets (
    id TEXT PRIMARY KEY,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    author_name TEXT NOT NULL,
    author_handle TEXT NOT NULL,
    tweet_text TEXT NOT NULL,
    tweet_url TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    quoted_tweet JSONB
);

ALTER TABLE public.tweets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" 
ON public.tweets FOR ALL USING (true);

GRANT ALL ON public.tweets TO anon, authenticated;
```

Or execute the SQL in `create_tweets_table.sql` / 或者直接执行 `create_tweets_table.sql` 文件中的 SQL。

### 4. Build Extension / 构建扩展

```bash
npm run build
```

The `dist/` directory will contain all extension files / 构建完成后，`dist/` 目录包含所有扩展文件。

### 5. Load in Chrome / 加载到 Chrome

**English:**
1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist/` directory

**中文：**
1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 启用"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目的 `dist/` 目录

### 6. Configure Extension / 配置扩展

**English:**
1. Click the extension icon
2. Click the settings button
3. Select your language (English/中文)
4. (Optional) Enter your Supabase URL and Anon Key for cloud sync
5. Save settings

**中文：**
1. 点击扩展图标
2. 点击设置按钮
3. 选择您的语言（English/中文）
4. （可选）输入您的 Supabase URL 和匿名密钥以启用云同步
5. 保存设置

## 📖 Usage / 使用方法

**English:**
1. Visit [Twitter/X](https://x.com)
2. Like tweets as usual ❤️
3. Extension automatically captures and saves (locally + Supabase if configured)
4. Click extension icon to view statistics and export data
5. Use language switcher in settings to change interface language

**中文：**
1. 访问 [Twitter/X](https://x.com)
2. 像往常一样点赞推文 ❤️
3. 扩展自动捕获并保存（本地 + Supabase 如已配置）
4. 点击扩展图标查看统计数据并导出
5. 在设置中使用语言切换器更改界面语言

## 📁 Project Structure / 项目结构

```
x-like/
├── components/          # React components / React 组件
│   ├── Settings.jsx    # Settings panel / 设置面板
│   ├── TweetCard.tsx   # Tweet card component / 推文卡片组件
│   └── icons.tsx       # Icon components / 图标组件
├── i18n/               # Internationalization / 国际化
│   ├── LanguageContext.tsx  # Language provider / 语言提供器
│   └── translations.ts      # Translation files / 翻译文件
├── services/           # Services / 服务
│   ├── supabaseService.ts  # Supabase integration / Supabase 集成
│   └── keywordService.ts   # Keyword extraction / 关键词提取
├── background.js       # Background script / 后台脚本
├── content_script.js   # Content script / 内容脚本
├── manifest.json       # Extension manifest / 扩展配置
└── dist/              # Build output / 构建输出
```

## 🛠️ Development / 开发

### Local Development / 本地开发

```bash
# Start Vite dev server (for popup UI) / 启动 Vite 开发服务器
npm run dev

# Build extension / 构建扩展
npm run build

# Build only extension files / 仅构建扩展文件
npm run build:extension
```

### Reload After Changes / 修改后重新加载

**English:**
1. Make code changes
2. Run `npm run build`
3. Click reload button in `chrome://extensions/`
4. **Refresh Twitter/X page** (important!)

**中文：**
1. 修改代码
2. 运行 `npm run build`
3. 在 `chrome://extensions/` 点击刷新按钮
4. **刷新 Twitter/X 页面**（重要！）

## 📊 Data Schema / 数据结构

### TypeScript Interface / TypeScript 接口

```typescript
interface Tweet {
  id: string;
  tweet_text: string;
  tweet_url: string;
  author_name: string;
  author_handle: string;
  captured_at: string;
  quoted_tweet?: {
    author_name: string;
    author_handle: string;
    tweet_text: string;
  };
  tags?: string[];
}
```

### Database Table / 数据库表

| Field / 字段 | Type / 类型 | Description / 说明 |
|------|------|------|
| id | TEXT | Tweet ID (Primary key) / 推文 ID（主键） |
| captured_at | TIMESTAMPTZ | Capture time / 捕获时间 |
| author_name | TEXT | Author name / 作者名称 |
| author_handle | TEXT | Author username / 作者用户名 |
| tweet_text | TEXT | Tweet content / 推文内容 |
| tweet_url | TEXT | Tweet URL / 推文链接 |
| tags | TEXT[] | Auto-extracted tags / 自动提取的标签 |
| quoted_tweet | JSONB | Quoted tweet (if any) / 引用的推文（如果有） |

## ⚠️ Important Notes / 注意事项

**English:**
- Extension only works on `twitter.com` and `x.com` domains
- Must refresh Twitter/X page after reloading extension
- All data stored locally by default, Supabase sync is optional
- Only captures like actions, unliking doesn't remove data
- Language preference is saved automatically

**中文：**
- 扩展仅在 `twitter.com` 和 `x.com` 域名下工作
- 重新加载扩展后必须刷新 Twitter/X 页面
- 默认所有数据本地存储，Supabase 同步为可选
- 只捕获点赞操作，取消点赞不会删除数据
- 语言偏好自动保存

## 🔧 Troubleshooting / 故障排除

### Extension not capturing tweets / 扩展未捕获推文

**English:**
1. Open F12 developer tools
2. Check Console for errors
3. Verify: `[Twitter Like Catcher] Script loaded` and `✓ APIs ready`
4. Ensure you're liking **unliked** tweets

**中文：**
1. 打开 F12 开发者工具
2. 查看 Console 是否有错误
3. 确认看到：`[Twitter Like Catcher] Script loaded` 和 `✓ APIs ready`
4. 确认点击的是**未点赞**的推文

### "Extension context invalidated" error / 错误

**English:** After reloading extension in `chrome://extensions/`, must refresh Twitter/X page.

**中文：** 在 `chrome://extensions/` 重新加载扩展后，必须刷新 Twitter/X 页面。

### Tweets not saved to Supabase / 推文未保存到 Supabase

**English:**
1. Check Supabase URL and Key in extension settings
2. Verify Supabase table is created
3. Check RLS policy allows anonymous access

**中文：**
1. 检查扩展设置中的 Supabase URL 和 Key 是否正确
2. 检查 Supabase 表是否已创建
3. 检查 RLS 策略是否允许匿名访问

### Language not changing / 语言未更改

**English:**
1. Open settings and select language
2. Click Save button
3. Close and reopen extension popup

**中文：**
1. 打开设置并选择语言
2. 点击保存按钮
3. 关闭并重新打开扩展弹窗

## 🔐 Privacy / 隐私

**English:**
- All data stored locally by default
- Cloud sync is entirely optional
- No data sent to third parties
- You control your data

**中文：**
- 默认所有数据本地存储
- 云同步完全可选
- 不会向第三方发送数据
- 您控制自己的数据

## 📄 License / 许可证

MIT License

## 👤 Author / 作者

[@mygameworld9](https://github.com/mygameworld9)

## 🌟 Contributing / 贡献

**English:** Contributions are welcome! Please feel free to submit a Pull Request.

**中文：** 欢迎贡献！请随时提交 Pull Request。

---

**Repository / 仓库**: [https://github.com/mygameworld9/x-like](https://github.com/mygameworld9/x-like)

If you find this project helpful, please consider giving it a star! ⭐

如果您觉得这个项目有帮助，请考虑给它一个星标！⭐
