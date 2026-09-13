# ClientLink（客户一页通）

面向设计师、独立开发者、顾问与小工作室的轻量级客户门户。客户通过 Magic Link 查看进度、上传文件、留言沟通——无需注册账号。

## 🌟 特性

- ✅ **Magic Link 分享** - 一键生成客户链接，微信直接打开
- ✅ **进度时间线** - 实时更新项目进展，客户心中有数
- ✅ **文件管理** - 双向上传下载，集中管理项目资料
- ✅ **留言沟通** - 实时留言，告别散乱的微信消息
- ✅ **免费试用** - 免费 1 个进行中项目
- ✅ **Pro 订阅** - ¥68/月 或 ¥688/年，最多 50 个项目

## 🛠 技术栈

- **前端/全栈**: Next.js 15+ (App Router) + TypeScript + Tailwind CSS
- **后端/数据**: Supabase (Auth + Postgres + Storage + RLS)
- **部署**: Vercel
- **包管理**: npm

## 📋 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/Lt-wei/clientlink.git
cd clientlink
```

### 2. 安装依赖

```bash
npm install
```

### 3. 设置 Supabase

#### 3.1 创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com) 并创建一个新项目
2. 记下项目的 URL 和 anon key

#### 3.2 运行数据库迁移

在 Supabase 项目的 SQL Editor 中，执行 `supabase/migrations/20260913000001_initial_schema.sql` 文件中的 SQL 语句。

这将创建：
- 所有必需的表（profiles, projects, project_links, progress_updates, files, messages, subscriptions）
- RLS 策略
- 自动触发器

#### 3.3 创建 Storage Bucket

1. 在 Supabase Dashboard 中，进入 Storage 部分
2. 创建一个名为 `project-files` 的 public bucket
3. 设置以下 RLS 策略：

**上传策略（允许认证用户和通过 API 验证的客户上传）**：
- Policy name: `Allow authenticated uploads`
- Target roles: `authenticated`
- Policy definition: `true`

**下载策略（允许所有人下载）**：
- Policy name: `Allow public downloads`
- Target roles: `public`
- Policy definition: `true`

> 注意：客户端通过服务端 API 路由进行上传/下载，API 会验证 Magic Link token。

### 4. 配置环境变量

复制 `.env.example` 到 `.env.local` 并填写您的配置：

```bash
cp .env.example .env.local
```

编辑 `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**获取 Supabase 密钥的位置**：
- 在 Supabase Dashboard > Settings > API
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Project API keys > anon public
- `SUPABASE_SERVICE_ROLE_KEY`: Project API keys > service_role (注意保密！)

### 5. 运行开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 6. 测试完整流程

1. **注册/登录**：访问 `/login`，输入邮箱，查收登录链接
2. **创建项目**：登录后创建第一个项目
3. **生成 Magic Link**：在项目详情页生成客户链接
4. **客户访问**：在隐身窗口打开客户链接，测试上传文件和留言
5. **管理项目**：更新进度、上传文件、回复留言

## 🚀 部署到 Vercel

### 方式一：通过 Vercel Dashboard

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "New Project"
3. 导入您的 GitHub 仓库
4. 配置环境变量（从 `.env.local` 复制）
5. 点击 "Deploy"

### 方式二：通过 CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel
```

**重要**：在 Vercel 项目设置中，添加以下环境变量：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`（设置为您的 Vercel 域名，如 `https://your-app.vercel.app`）

## 📁 项目结构

```
clientlink/
├── app/                        # Next.js App Router
│   ├── (app)/                 # 需要认证的页面
│   │   └── app/
│   │       ├── page.tsx       # 仪表盘
│   │       ├── billing/       # 订阅管理
│   │       └── projects/      # 项目管理
│   │           ├── new/       # 创建项目
│   │           └── [id]/      # 项目详情
│   ├── (auth)/                # 认证相关
│   │   └── login/
│   ├── p/[token]/             # 客户门户（无需登录）
│   ├── api/                   # API 路由
│   │   ├── auth/              # 认证回调
│   │   └── client/            # 客户端 API
│   ├── layout.tsx             # 根布局
│   └── page.tsx               # 落地页
├── components/                # 可复用组件（如需）
├── lib/                       # 工具函数
│   ├── supabase/              # Supabase 客户端
│   ├── types.ts               # TypeScript 类型
│   └── utils.ts               # 通用工具
├── supabase/
│   └── migrations/            # 数据库迁移
├── docs/                      # 产品文档
├── public/                    # 静态资源
├── .env.example               # 环境变量模板
├── .env.local                 # 本地环境变量（不提交）
├── middleware.ts              # Next.js 中间件
├── next.config.ts             # Next.js 配置
├── package.json               # 依赖
├── tailwind.config.ts         # Tailwind 配置
└── tsconfig.json              # TypeScript 配置
```

## 🔒 安全说明

1. **Magic Link Token**：使用 SHA-256 哈希存储，无法反推原始 token
2. **RLS 策略**：Supabase Row Level Security 确保数据隔离
3. **Service Role Key**：仅在服务端使用，永不暴露给前端
4. **文件隔离**：每个项目的文件存储在独立路径下

## 💳 支付集成（待实现）

当前版本的支付功能为占位实现。要接入真实支付：

1. 选择支付提供商（Stripe / Lemon Squeezy / 国内支付）
2. 创建订阅产品和价格
3. 实现 webhook 端点 `/api/webhooks/payment`
4. 更新 `profiles.plan` 和 `subscriptions` 表

详见 `docs/05-development-plan.md` 的第 8 节。

## 📖 文档

- [用户分析](./docs/01-user-analysis.md) - 目标用户画像与需求
- [产品调研](./docs/02-product-research.md) - 竞品分析
- [营销方案](./docs/03-marketing-plan.md) - 推广策略
- [产品设计](./docs/04-product-design.md) - 功能设计与交互
- [开发方案](./docs/05-development-plan.md) - 技术实现

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙋 FAQ

### Q: 客户需要注册账号吗？
A: 不需要！客户只需点击 Magic Link 即可访问项目，非常适合在微信中分享。

### Q: 免费版有什么限制？
A: 免费版可以创建 1 个进行中项目。已完成或归档的项目不占名额。

### Q: 如何切换到生产环境？
A: 在 Vercel 部署后，确保环境变量中的 `NEXT_PUBLIC_APP_URL` 设置为生产域名即可。

### Q: Supabase 配置失败怎么办？
A: 确保您正确运行了迁移脚本，并创建了 `project-files` storage bucket。检查 RLS 策略是否启用。

### Q: 如何测试 Magic Link？
A: 在项目详情页生成链接后，复制 URL 在隐身/无痕窗口中打开，即可模拟客户视角。

---

**Made with ❤️ for freelancers and small studios**

GitHub: [Lt-wei](https://github.com/Lt-wei)
