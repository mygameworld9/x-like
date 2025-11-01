# Twitter Like Catcher V2

一个 Chrome 扩展，自动捕获你在 Twitter/X 上点赞的推文，并同步到 Supabase 数据库。

## 功能特性

- ✅ 自动捕获点赞的推文
- ✅ 自动展开"显示更多"获取完整内容
- ✅ 实时同步到 Supabase
- ✅ 自动提取推文标签（react、ai、webdev 等）
- ✅ 支持引用推文
- ✅ 扩展图标显示成功/失败状态

## 技术栈

- **前端**: React + TypeScript + Tailwind CSS
- **构建工具**: Vite + esbuild
- **数据库**: Supabase (PostgreSQL)
- **扩展**: Chrome Extension Manifest V3

## 安装步骤

### 1. 克隆项目

```bash
git clone https://github.com/mygameworld9/twitter-like-catcher.git
cd twitter-like-catcher
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置 Supabase

在 Supabase 中创建数据库表：

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

或者直接执行 `create_tweets_table.sql` 文件中的 SQL。

### 4. 构建扩展

```bash
npm run build
```

构建完成后，`dist/` 目录包含所有扩展文件。

### 5. 加载到 Chrome

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 启用"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目的 `dist/` 目录

### 6. 配置扩展

1. 点击扩展图标
2. 点击设置按钮
3. 输入你的 Supabase URL 和 Anon Key
4. 保存配置

## 使用方法

1. 访问 [Twitter/X](https://x.com)
2. 像往常一样点赞推文 ❤️
3. 扩展会自动捕获并保存到 Supabase
4. 扩展图标会显示绿色 ✓（成功）或红色 ERR（失败）

## 项目结构

```
twitter-like-catcher/
├── components/          # React 组件
├── services/           # Supabase 和关键词服务
├── background.js       # 后台脚本（处理推文保存）
├── content_script.js   # 内容脚本（捕获点赞）
├── manifest.json       # 扩展配置
├── create_tweets_table.sql  # 数据库表结构
└── dist/              # 构建输出目录（不提交到 Git）
```

## 开发

### 本地开发

```bash
# 启动 Vite 开发服务器（用于 popup UI）
npm run dev

# 构建扩展
npm run build
```

### 修改后重新加载

1. 修改代码
2. 运行 `npm run build`
3. 在 `chrome://extensions/` 点击扩展的刷新按钮
4. **刷新 Twitter/X 页面**（重要！）

## 数据库表结构

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 推文 ID（主键） |
| captured_at | TIMESTAMPTZ | 捕获时间 |
| author_name | TEXT | 作者名称 |
| author_handle | TEXT | 作者用户名 |
| tweet_text | TEXT | 推文内容 |
| tweet_url | TEXT | 推文链接 |
| tags | TEXT[] | 自动提取的标签 |
| quoted_tweet | JSONB | 引用的推文（如果有） |

## 注意事项

- ⚠️ 扩展只在 `twitter.com` 和 `x.com` 域名下工作
- ⚠️ 每次重新加载扩展后，必须刷新 Twitter/X 页面
- ⚠️ Supabase 凭据存储在 Chrome 的 sync storage 中
- ⚠️ 只捕获点赞操作，取消点赞不会删除数据

## 故障排除

### 扩展没有捕获推文

1. 打开 F12 开发者工具
2. 查看 Console 是否有错误
3. 确认看到：`[Twitter Like Catcher] Script loaded` 和 `✓ APIs ready`
4. 确认点击的是**未点赞**的推文

### "Extension context invalidated" 错误

在 `chrome://extensions/` 重新加载扩展后，必须刷新 Twitter/X 页面。

### 推文没有保存到 Supabase

1. 检查扩展设置中的 Supabase URL 和 Key 是否正确
2. 检查 Supabase 表是否已创建
3. 检查 RLS 策略是否允许匿名访问

## License

MIT

## 作者

[@mygameworld9](https://github.com/mygameworld9)
