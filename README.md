<p align="center">
  <img src="apps/web/public/img/hal-ai-logo.jpg" width="150" alt="Hal-AI Logo" />
  <img src="apps/web/public/img/instituto-do-frete.png" width="200" alt="Instituto do Frete Logo" />
</p>

<h1 align="center">iFretes Monorepo</h1>

<p align="center">
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" /></a>
  <a href="https://nestjs.com"><img src="https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" /></a>
  <a href="https://vuejs.org"><img src="https://img.shields.io/badge/vuejs-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D" alt="Vue 3" /></a>
  <a href="https://typescriptlang.org"><img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://vitejs.dev"><img src="https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" /></a>
  <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" /></a>
  <a href="https://mariadb.org/"><img src="https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white" alt="MariaDB" /></a>
  <a href="https://stripe.com/"><img src="https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white" alt="Stripe" /></a>
</p>

---

## 🚀 Overview

iFretes is a modern agentic platform for logistics and freight management, built with a focus on automation, AI integration, and seamless user onboarding.

This monorepo contains the following workspace packages:
- **`apps/api`**: NestJS backend providing the agentic engine and integrations (Stripe, HalAI API).
- **`apps/web`**: Vue 3 + Vite frontend with premium aesthetics and dynamic onboarding.
- **`packages/contracts`**: Shared TypeScript definitions and API contracts.

## 🛠️ Tech Stack

- **Backend**: NestJS, Kysely (ORM), MariaDB, Redis.
- **Frontend**: Vue 3, Pinia, Vanilla CSS (Premium Design), Vite.
- **Integrations**: Stripe (Payments & Connect Transfers), HalAI API (Agentic Core).
- **Infrastrucutre**: Docker Compose, PNPM Workspaces, Turbo Repo.

## 📦 Getting Started

### Prerequisites
- Node.js >= 18
- PNPM >= 8
- Docker & Docker Compose

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
4. Start the infrastructure (MariaDB, Redis):
   ```bash
   docker compose up -d
   ```

### Development
Start all services in development mode:
```bash
pnpm dev
```
Or start specific apps:
```bash
pnpm --filter @ifretes/api dev
pnpm --filter @ifretes/web dev
```

## 💳 Stripe Integration
The platform uses Stripe for automated billing:
- **Setup Fee**: R$ 2000.00 (Channel/Activation).
- **Monthly Fee**: R$ 200.00 (PAWEB).
- **Revenue Share**: 25% automatic transfer to IBTRC connected account (`acct_1T9nE8DJrvK6XYe5`).

## 🛡️ License
Proprietary - Hal-AI & Instituto do Frete.
