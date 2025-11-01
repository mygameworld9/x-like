# 调试指南

## 如何测试扩展是否正常工作

### 1. 检查扩展是否加载
1. 打开 `chrome://extensions/`
2. 确认扩展已启用
3. 点击刷新按钮重新加载扩展

### 2. 检查 Content Script 是否注入
1. 打开 Twitter/X 网站 (https://twitter.com 或 https://x.com)
2. 按 F12 打开开发者工具
3. 在 Console 标签中应该看到：`Twitter Like Catcher content script loaded.`

### 3. 测试点赞捕获
1. 在 Twitter/X 上找一条未点赞的推文
2. 点击红心（点赞）按钮
3. 在 Console 中查看日志：
   ```
   Like button clicked, testid: like
   Found tweet article, extracting data...
   Sending liked tweet to background script: {id: "...", ...}
   Message sent successfully: {success: true}
   ```

### 4. 测试书签捕获
1. 在 Twitter/X 上找一条未收藏的推文
2. 点击书签按钮
3. 在 Console 中查看日志：
   ```
   Bookmark button clicked, testid: bookmark
   Found tweet article for bookmark, extracting data...
   Sending bookmarked tweet to background script: {id: "...", ...}
   Message sent successfully: {success: true}
   ```

### 5. 检查 Background Script
1. 在 `chrome://extensions/` 页面
2. 点击扩展的 "Service Worker" 链接
3. 查看是否有错误日志

### 6. 检查 Supabase
1. 打开 Supabase 项目
2. 进入 Table Editor
3. 查看 `tweets` 表是否有新数据

## 常见问题

### 问题 1: Console 中没有看到 "Twitter Like Catcher content script loaded"
**原因**: Content script 没有注入
**解决**:
- 确保在 twitter.com 或 x.com 域名下
- 重新加载扩展
- 刷新网页

### 问题 2: 点击点赞按钮没有任何日志
**原因**: 
- 可能使用的是新版 Twitter UI，data-testid 可能不同
- 推文已经被点赞（testid 会是 "unlike"）

**调试**:
1. 右键点击点赞按钮 -> 检查元素
2. 查看按钮的 `data-testid` 属性
3. 如果不是 "like" 或 "unlike"，需要更新代码

### 问题 3: "Could not extract all required tweet data"
**原因**: 推文数据提取失败
**调试**:
1. 查看 Console 中的警告日志，会显示哪些字段缺失
2. 右键点击推文 -> 检查元素
3. 查看 DOM 结构是否与代码中的选择器匹配

### 问题 4: Supabase 表中没有数据
**检查**:
1. 确认 Supabase URL 和 Key 配置正确（点击扩展图标 -> Settings）
2. 查看 Background script 日志是否有错误
3. 确认 RLS 策略已正确设置
