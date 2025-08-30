## 欢迎使用您的新 SaaS 应用！🎉
<a href="https://www.producthunt.com/products/open-saas?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-open&#0045;saas&#0045;2" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=991058&theme=neutral&t=1753776395137" alt="Open&#0032;SaaS - The&#0032;open&#0045;source&#0032;SaaS&#0032;boilerplate&#0032;with&#0032;superpowers&#0033; | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

> 🌏 **多语言支持**: [English](README.md) | [中文](README.zh.md)

https://github.com/user-attachments/assets/3856276b-23e9-455e-a564-b5f26f4f0e98

您决定使用 Open SaaS 模板构建 SaaS 应用。这是一个很棒的选择！

这个模板具有以下特点：

1. 完全开源
2. 完全免费使用和分发
3. 开箱即用，包含大量功能！
4. 尽可能使用免费、开源的服务

🧑‍💻 在这里查看实际效果：[OpenSaaS.sh](https://opensaas.sh)  
📚 查看文档：[Open SaaS 文档](https://docs.opensaas.sh)

## 包含什么内容？

该模板基于一些非常强大的工具和框架构建，包括：

- 🐝 [Wasp](https://wasp.sh) - 一个具有超强功能的全栈 React、NodeJS、Prisma 框架
- 🚀 [Astro](https://starlight.astro.build/) - Astro 的轻量级 "Starlight" 模板，用于文档和博客
- 💸 [Stripe](https://stripe.com) 或 [Lemon Squeezy](https://lemonsqueezy.com/)（Polar.sh 和 Paddle 即将推出！）- 用于产品和支付
- 💅 [ShadCN UI](https://tailwindcss.com) - 用于组件和样式（还有管理仪表板！）
- 🤖 [AI-Ready](https://docs.opensaas.sh/) - 完整的 Cursor 规则集和 llms-full.txt，用于 AI 辅助编程
- 📈 [Plausible](https://plausible.io) 或 [Google](https://analytics.google.com/) Analytics
- 🤖 [OpenAI](https://openai.com) - OpenAI API 与函数调用示例
- 📦 [AWS S3](https://aws.amazon.com/s3/) - 用于文件上传
- 📧 [SendGrid](https://sendgrid.com)、[MailGun](https://mailgun.com) 或 SMTP - 用于邮件发送
- 🧪 [Playwright](https://playwright.dev) - 使用 Playwright 进行端到端测试

因为我们使用 Wasp 作为全栈框架，我们可以利用其许多功能来快速构建 SaaS 应用，包括：

- 🔐 [全栈身份验证](https://wasp.sh/docs/auth/overview) - 几行代码即可实现邮箱验证 + 社交登录。
- ⛑ [端到端类型安全](https://wasp.sh/docs/data-model/operations/overview) - 为后端函数添加类型，前端自动获得推断类型，无需安装或配置任何第三方库。还有类型安全的链接！
- 🤖 [任务](https://wasp.sh/docs/advanced/jobs) - 通过在配置文件中定义函数，简单地在后台运行 cron 任务或设置队列。
- 🚀 [一键部署](https://wasp.sh/docs/advanced/deployment/overview) - 通过 CLI 轻松将数据库、服务器和客户端一键部署到 [Railway](https://railway.app) 或 [Fly.io](https://fly.io)。或手动部署到您选择的其他托管服务。

如果您遇到问题或需要帮助，还可以访问 Wasp 的多元化、乐于助人的社区。
- 🤝 [Wasp Discord](https://discord.gg/aCamt5wCpS)

## 开始使用

### 简单说明

首先，要在 macOS、Linux 或 Windows with WSL 上安装最新版本的 [Wasp](https://wasp.sh/)，请运行以下命令：
```bash
curl -sSL https://get.wasp.sh/installer.sh | sh
```

然后，使用以下命令创建一个新的 SaaS 应用：

```bash
wasp new -t saas
```

这将创建一个 **Open SaaS 模板的干净副本**到一个新目录中，您可以立即开始构建您的 SaaS 应用！

### 详细说明

有关开始使用和使用此模板所需了解的一切，请查看 [Open SaaS 文档](https://docs.opensaas.sh)。

我们详细记录了所有内容，包括安装说明、拉取模板更新、服务集成指南、SEO、部署等。🚀

## 获取帮助和提供反馈

有两种方式可以获取帮助或提供反馈（我们总是尽量快速回复！）：
1. [提交问题](https://github.com/wasp-lang/open-saas/issues)
2. [Wasp Discord](https://discord.gg/aCamt5wCpS) -- 请将问题发送到 #🙋questions 论坛频道

## 贡献

请注意，我们已尝试将 SaaS 应用的核心功能尽可能多地包含在此模板中，但可能仍有一些缺失的功能。

我们总是需要一些帮助来完善细节：欢迎贡献！查看 [CONTRIBUTING.md](/CONTRIBUTING.md) 了解更多详情。
