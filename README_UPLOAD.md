# 上传到 GitHub 的步骤

## 方法 1: 使用命令行（推荐）

### 1. 初始化 Git 仓库（如果还没有）
```bash
git init
git add .
git commit -m "Initial commit: Twitter Like Catcher V2"
```

### 2. 在 GitHub 创建仓库
1. 访问 https://github.com/new
2. 仓库名: `twitter-like-catcher`
3. 描述: `Chrome extension to capture and sync liked tweets to Supabase`
4. 选择 Public 或 Private
5. **不要**勾选 "Initialize with README"
6. 点击 "Create repository"

### 3. 连接并推送
```bash
git remote add origin https://github.com/mygameworld9/twitter-like-catcher.git
git branch -M main
git push -u origin main
```

### 4. 使用 Personal Access Token 验证
当提示输入密码时：
- Username: mygameworld9
- Password: 粘贴你的 token (ghp_...)

## 方法 2: 使用 GitHub Desktop（最简单）

### 1. 下载 GitHub Desktop
https://desktop.github.com/

### 2. 登录你的账号

### 3. 添加仓库
- File → Add Local Repository
- 选择这个文件夹
- 如果提示 "not a git repository"，点击 "Create a repository"

### 4. 发布到 GitHub
- 点击 "Publish repository"
- 填写仓库名和描述
- 点击 "Publish"

## 安全提示

⚠️ **重要**: 你的 GitHub token 已经暴露在对话中，建议：

1. 立即撤销这个 token:
   - 访问 https://github.com/settings/tokens
   - 找到你的 token
   - 点击 "Delete"

2. 创建新的 token（仅给需要的权限）:
   - Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token
   - 只勾选 "repo" 权限
   - 保存 token（只显示一次）

3. 永远不要在公开场合分享你的 token！

## 项目信息

- **名称**: Twitter Like Catcher V2
- **描述**: Chrome extension that automatically captures liked tweets and syncs them to Supabase
- **技术栈**: React, Vite, Supabase, Chrome Extension Manifest V3
