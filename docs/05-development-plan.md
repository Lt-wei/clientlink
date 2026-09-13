# ClientLink 开发方案

| 字段 | 内容 |
|------|------|
| 文档版本 | v1.0 |
| 日期 | 2026-09-13 |
| 作者 | New Bot |
| 项目 | ClientLink |

---

## 1. 目标与约束

- **目标**：2–4 周内上线可演示、可收费的 MVP（支付可分阶段接入）。
- **约束**：单人/超小团队；技术栈锁定 **Next.js + Tailwind + Supabase + Vercel**；仓库归属 GitHub 用户 **Lt-wei**。
- **原则**：先闭环（链接→进度→文件→留言→限额），再通知与品牌化。

---

## 2. 技术栈落地

| 层 | 选型 | 用途 |
|----|------|------|
| 前端/全栈 | Next.js（App Router） | 营销页、服务方 App、客户页、Route Handlers |
| UI | Tailwind CSS + 简洁组件（如 shadcn/ui） | 快速、一致、移动端友好 |
| 后端/数据 | Supabase（Postgres + Auth + Storage + RLS） | 用户、项目、文件元数据、权限 |
| 文件 | Supabase Storage | 项目文件桶；路径按 project_id 隔离 |
| 部署 | Vercel | Preview + Production；环境变量分离 |
| 邮件 | Resend / Supabase Auth 邮件 / 其他 | 登录链、客户邀请（可第二阶段） |
| 支付 | 见第 8 节分阶段 | 订阅月/年 |

可选：Sentry（错误）、Vercel Analytics（基础流量）。

---

## 3. 数据模型（草案）

### 3.1 表：`profiles`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | 同 auth.users.id |
| display_name | text | 服务方显示名 |
| plan | text | `free` \| `pro` |
| plan_expires_at | timestamptz | 可空 |
| created_at | timestamptz | |

### 3.2 表：`projects`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | |
| owner_id | uuid FK | profiles.id |
| name | text | |
| client_name | text | |
| client_email | text | 可空 |
| status | text | 枚举见产品设计 |
| is_archived | boolean | 默认 false |
| created_at / updated_at | timestamptz | |

进行中计数：`owner_id` 下 `is_archived = false` 且 `status` 非终态。

### 3.3 表：`project_links`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | |
| project_id | uuid FK | |
| token_hash | text | 只存哈希，不存明文 |
| expires_at | timestamptz | 可空=不过期 |
| revoked_at | timestamptz | 可空 |
| created_at | timestamptz | |

### 3.4 表：`progress_updates`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | |
| project_id | uuid FK | |
| title | text | |
| body | text | 可空 |
| visible_to_client | boolean | 默认 true |
| created_by | uuid | owner |
| created_at | timestamptz | |

### 3.5 表：`files`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | |
| project_id | uuid FK | |
| storage_path | text | |
| file_name | text | |
| file_size | int | |
| uploaded_by_role | text | `owner` \| `client` |
| created_at | timestamptz | |

### 3.6 表：`messages`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | |
| project_id | uuid FK | |
| author_role | text | `owner` \| `client` |
| author_id | uuid | client 可空 |
| body | text | |
| created_at | timestamptz | |

### 3.7 表：`subscriptions`（支付接入后）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid PK | |
| owner_id | uuid FK | |
| provider | text | |
| provider_customer_id | text | |
| provider_sub_id | text | |
| status | text | |
| current_period_end | timestamptz | |

### 3.8 RLS 要点

- Owner：仅 CRUD 自己的项目及子资源。
- Client：通过 **服务端** 校验 magic token 后，以受控 API 读写该项目的可见进度、文件、留言；避免把宽权限策略直接暴露给匿名角色。
- Storage：上传策略与 `project_id` 前缀绑定；下载用签名 URL 或受控路由。

---

## 4. 关键路由规划（示意）

| 路径 | 说明 |
|------|------|
| `/` | 落地页 |
| `/pricing` | 可与落地合并 |
| `/login` | 服务方登录 |
| `/app` | 仪表盘 |
| `/app/projects/new` | 新建 |
| `/app/projects/[id]` | 项目详情 |
| `/app/billing` | 订阅 |
| `/p/[token]` | 客户一页通 |
| `/api/...` | 链接校验、上传、webhook |

---

## 5. 里程碑

### M0：工程骨架（约 2–3 天）

- [ ] 创建 Next.js 项目 + Tailwind + 基础布局  
- [ ] 接通 Supabase 项目（dev）  
- [ ] Auth 登录闭环  
- [ ] Vercel 预览部署跑通  
- [ ] GitHub 仓库在 Lt-wei 账号下，README 指向文档

### M1：项目与 Magic link（约 4–5 天）

- [ ] projects CRUD + 状态  
- [ ] 生成/吊销 link（token 哈希存储）  
- [ ] `/p/[token]` 只读展示项目名与状态  
- [ ] 免费限额：进行中 &gt; 1 时拦截新建

### M2：进度 / 文件 / 留言（约 5–7 天）

- [ ] 进度时间线 CRUD（Owner）与客户可见列表  
- [ ] Storage 上传下载 + files 表  
- [ ] 留言双向  
- [ ] 客户页移动端走查  

### M3：计费准备与打磨（约 3–5 天）

- [ ] Billing 页 UI + plan 字段  
- [ ] 支付 Provider 测试模式（见第 8 节）  
- [ ] 空状态、错误态、基础限流  
- [ ] 隐私政策 / 用户协议页（简版）  
- [ ] 种子用户试用与 Bug 修复  

### M4：上线（1–2 天）

- [ ] 生产环境变量、域名、备份策略确认  
- [ ] 监控与错误上报  
- [ ] 发布营销配合（见营销方案）  

**合计日历**：紧凑 2 周可砍到 M2+硬编码 Pro；完整含支付约 3–4 周。

---

## 6. 环境变量（清单）

| 变量 | 环境 | 说明 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 全部 | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 全部 | 匿名密钥 |
| `SUPABASE_SERVICE_ROLE_KEY` | 仅服务端 | 慎用；magic link 校验等 |
| `NEXT_PUBLIC_APP_URL` | 全部 | 如 `https://clientlink.xxx` |
| `TOKEN_SECRET` 或等价 | 服务端 | 若需额外签名 |
| `RESEND_API_KEY` | 服务端 | 邮件（可选阶段） |
| `PAYMENT_PROVIDER_*` | 服务端 | 视 Stripe/Lemon/国内渠道 |
| `PAYMENT_WEBHOOK_SECRET` | 服务端 | Webhook 验签 |

本地用 `.env.local`；Vercel 分 Preview / Production；**永远不要**把 service role 提交进 Git。

---

## 7. 部署与分支

| 项 | 建议 |
|----|------|
| 托管 | Vercel 绑定 GitHub Lt-wei/clientlink（仓库名可自定） |
| 分支 | `main` 生产；`dev` 或功能分支 → Preview |
| DB 迁移 | Supabase Migrations 入库；生产迁移有检查清单 |
| Storage | 生产桶与策略单独确认 |
| 回滚 | Vercel 瞬时回滚前端；DB 迁移需向前兼容 |

---

## 8. 收款接入阶段

### 阶段 A（可先上线）

- Plan 字段手动改库 / 内部 Admin 脚本发放 Pro。  
- Paywall UI 完整，按钮「联系升级」或「提交意向」。  
- **目的**：先验证需求，不堵发布。

### 阶段 B（正式订阅）

可选其一（按团队熟悉度与中国收款便利性）：

| 方案 | 适合 | 备注 |
|------|------|------|
| Stripe | 国际卡、出海 | 国内个人收款有门槛 |
| Lemon Squeezy 等 | 税务代收类 | 看当前政策与费率 |
| 国内：微信/支付宝订阅或第三方（如虎皮椒等） | 人民币用户 | 需合规与企业资质；实现 webhook → 更新 `profiles.plan` |

年付 ¥688、月付 ¥68：在 Provider 建两个 Price；成功/取消/过期均以 webhook 为准。

### 阶段 C

- 客户门户内升级入口优化、发票信息、失败重试邮件。  
- 早鸟码、兑换码表。

---

## 9. 测试计划

### 9.1 手工清单（每次预发）

- 注册登录、建项目、复制链接、隐身窗口打开客户页  
- 客户上传与留言，Owner 刷新可见  
- 吊销链接后 401/失效页  
- 免费用户第二项目拦截  
- 归档后可再建  
- iPhone Safari + 微信内置浏览器打开客户链  

### 9.2 自动化（有余力）

- 关键关键路径 Playwright 冒烟  
- RLS 与 token 校验的单元/集成测试  
- Webhook 签名校验测试  

### 9.3 安全检查

- 枚举 token 不可行（长度与熵）  
- 横向越权：用户 A 不能读 B 的 project_id  
- 上传类型与大小限制；存储路径不泄露其他项目  

---

## 10. 工程规范（轻量）

- TypeScript 严格模式；关键路径有类型。  
- 目录按 `app/`、`components/`、`lib/supabase/`、`lib/billing/` 分隔。  
- Commit 信息简明；Release 打 tag（如 `v0.1.0-mvp`）。  
- 文档以 `/workspace/clientlink-docs` 为本，仓库内可放链接副本。

---

## 11. 风险（工程）

| 风险 | 缓解 |
|------|------|
| RLS 配错导致数据泄露 | 客户通道走服务端校验；预发用双账号渗透式自测 |
| 微信内置浏览器兼容 | 真机测；避免依赖冷门 API |
| 支付资质拖延 | 阶段 A 手动开通，不挡 MVP |
| 范围蔓延 | 对照《04》不做清单；冰盒制 |

---

## 12. 交付物清单

- [ ] 生产可用 URL  
- [ ] Supabase 生产项目与迁移  
- [ ] 环境变量表（给运维/本人）  
- [ ] 种子账号与演示项目  
- [ ] 本开发方案执行情况的简短复盘（上线后一周）  

---

## 13. 总结

技术路径成熟、无研究型难题；胜负在 **范围控制与上线速度**。按 M0→M3 推进，支付可阶段 A 先行，用真实用户催阶段 B。GitHub：**Lt-wei**；栈：**Next.js + Tailwind + Supabase + Vercel**；定价与限额在应用层强制执行，不信任前端。

---

*ClientLink 开发方案 · v1.0 · 2026-09-13*
