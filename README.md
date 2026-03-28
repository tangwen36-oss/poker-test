# Poker H5

Vite + React + Tailwind 的德州扑克测试 H5，前端静态页面由 Vercel 托管，`/api/*` 由 Vercel Node.js Serverless Functions 提供。

## 本地开发

1. 安装依赖：`npm install`
2. 复制环境变量模板：`cp .env.example .env`
3. 填入 Supabase 和 ZPay 配置
4. 前端开发：`npm run dev`
5. 联调前后端：`vercel dev`

本项目的 Vite 本地开发服务器会把 `/api` 代理到 `http://localhost:3001`，用于对接 `vercel dev`。

## 必需环境变量

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ZPAY_PID`
- `ZPAY_KEY`
- `ZPAY_NOTIFY_URL`
- `ZPAY_RETURN_URL`

不要把真实密钥提交到仓库，`.env` 已被 `.gitignore` 忽略。

## Vercel 部署

1. 将项目推到 GitHub
2. 在 Vercel 中关联该 GitHub 仓库到当前项目
3. 确认现有项目中的环境变量完整保留
4. 推送新 commit 后，Vercel 会自动触发构建和部署

## 数据库

Supabase 初始化 SQL 在 `supabase/migration.sql`。
