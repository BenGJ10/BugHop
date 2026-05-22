<div align="center">

<h1 align="center">
  <img src="app/icon.svg" alt="BugHop Logo" width="40" valign="middle" />
  <a href="https://bug-hop.vercel.app/">BugHop Frontend Gateway</a>
</h1>

### Relational API Gateway, Secure Webhook Proxy & SaaS Dashboard

The user-facing dashboard, tenant management system, and secure cryptographic webhook router for the **BugHop** autonomous AI code review ecosystem.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.1_App_Router-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Clerk Auth](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=flat-square&logo=clerk&logoColor=white)](https://clerk.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-7.4-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Liveblocks](https://img.shields.io/badge/Liveblocks-Real--time-000000?style=flat-square&logo=liveblocks&logoColor=white)](https://liveblocks.io/)

[Overview](#overview) · [Problem Statement](#problem-statement) · [Features](#features) · [Technology Stack](#technology-stack) · [Gateway Orchestration](#gateway-orchestration) · [Getting Started](#getting-started) · [Limitations & Future Scope](#limitations--future-scope)

</div>

---

## Overview

**BugHop Frontend** serves as the **API Gateway and Control Center** for the BugHop autonomous AI engineering system. Built on **Next.js 16 (App Router)** and **TypeScript**, it handles user authentication, session security, cryptographic signature validation for incoming GitHub Webhook events, subscription billing gating, and the relational state storage of repository configurations and PR logs.

While the FastAPI backend is completely stateless and handles vector searches, tree-sitter AST crawls, and LLM orchestration, the frontend gateway orchestrates the PostgreSQL database via **Prisma ORM** and maintains real-time WebSocket state via **Liveblocks** for seamless collaborative code audits.

### Checkout the live application over here: **[BugHop Dashboard](https://bug-hop.vercel.app/)**

---

## Problem Statement

Modern software engineering teams want autonomous agents that review code and fix bugs directly on their repositories. However, deploying stateless AI agents into production environments introduces critical platform hurdles:

<div align="center">

| Gatekeeper Requirement | Solution Provided by Frontend |
|---|---|
| **Cryptographic Webhook Routing** | Signature validation via Octokit shielding private workers from bad actors |
| **Relational Configuration & Rules** | Structured storage for installations, repository tracking, and coding standards |
| **Multi-Tenant Session Security** | Enterprise-grade RBAC and authentication powered by Clerk |
| **Monetization & Billing Control** | Secure subscription management and usage limits via Razorpay |
| **Real-time Collaboration & Feed** | Live multiplayer connection and status logs synchronized via Liveblocks |

</div>

Without a secure relational gateway, workers are exposed to raw external webhooks, lack a persistent historical record of logs, and cannot store customized development rules per organization.

---

## Features

### Cryptographic Webhook Validation
* **Octokit Verification**: Validates incoming GitHub App payloads utilizing `@octokit/webhooks` against a secure `WEBHOOK_SECRET` before passing them onwards.
* **Backend Isolation**: Safely proxy-forwards verified payloads to the FastAPI worker, permitting the worker to remain inside a private, secure virtual network.

### Relational State Storage (Prisma ORM)
* **Structured Workspace Mapping**: Records installations, repository configurations, user permissions, and billing plans.
* **Unified Audit Logs**: Keeps structured historical records for all automated PRs created, issues processed, and code reviews handled.

### SaaS billing & Razorpay Gating
* **Feature Gating**: Enforces active subscription controls on repository indexing limits and monthly automated pull request counts.
* **Secure Payment Hooks**: Seamlessly processes subscription events via secure Razorpay webhook events to sync payment statuses locally.

### Real-Time Liveblocks Sync
* **Multiplayer Dashboards**: Powers real-time collaborative code reviews, live indexing bars, and instant agent status feeds.
* **WebSocket Feeds**: Connects engineers synchronously to show backend diagnostic logs without standard HTTP polling overhead.

---

## Technology Stack

| Component | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Core React meta-framework with server-side rendering and API routes |
| **Language** | TypeScript | Type-safe development environment |
| **Authentication** | Clerk (`@clerk/nextjs`) | Enterprise multi-tenant authentication and team workspaces |
| **Database & ORM** | Prisma + PostgreSQL | Relational DB modeling, migrations, and query generation |
| **Real-time Sync** | Liveblocks | Synchronized real-time multiplayer states and status logs |
| **Styling** | Tailwind CSS v4 + shadcn/ui | Premium, high-performance visual dashboard system |
| **Animations** | Motion (Framer Motion) | Micro-interactions and transition animations |
| **Billing Integration** | Razorpay SDK | SaaS monetization and recurring billing cycles |
| **Table Utilities** | TanStack Table | High-performance, filterable log and repository lists |
| **Charts & Analytics**| Recharts | Dynamic analytical displays for monthly pull request runs |

---

## Gateway Orchestration

To maintain a stateless backend, Next.js exposes a series of internal REST endpoints that the FastAPI worker queries and writes to during codebase crawls and PR generation:

### Webhook Dispatch Flow
1. GitHub triggers a webhook event (e.g. `issues.labeled`).
2. Next.js `/api/webhooks/github` cryptographically verifies the signature.
3. Next.js creates or updates the workspace record in PostgreSQL.
4. Next.js forwards `{ event, payload }` to the FastAPI backend `/webhook` endpoint.

### Backend State Sync APIs
* `GET /api/rules/by-installation/{installation_id}`: Allows the FastAPI backend to fetch team guidelines.
* `POST /api/indexing/update`: Allows the FastAPI worker to change repository index states (`INDEXING`, `COMPLETED`, `FAILED`).
* `POST /api/logs/review`, `/api/logs/issue`, `/api/logs/pr`: Allows the worker to save audit logs to the relational DB in real-time.

---

## Getting Started

### 1. Navigate to the frontend directory
```bash
cd frontend
```

### 2. Configure Environment Properties
Create a local `.env` file using the boilerplate template:
```bash
cp .env.example .env
```
Provide the necessary credentials for Clerk, Liveblocks, Razorpay, and database links.

### 3. Initialize Prisma & Database Migrations
Prisma parses the schema files and applies them directly to your target PostgreSQL database:
```bash
npx prisma db push
```

### 4. Install Dependencies
Using npm (or your preferred package manager):
```bash
npm install
```

### 5. Start the Next.js Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view your local interactive BugHop Gateway and Dashboard.

---

## Limitations & Future Scope

### Current Limitations
- **External Auth Dependencies**: Deeply coupled with Clerk. Local offline deployments require replacing Clerk calls with custom JWT cookie solutions.
- **Next.js Serverless Gateway Bounding**: Highly parallel webhook bursts are processed within Next.js API route limits; heavy scale setups might experience connection pools bottlenecks under extreme database loads.
- **Relational Sync Latency**: If the Next.js database queries experience network latency, there may be slight delays in updating the real-time indexing status shown to the user.

### Future Scope
- **Standalone Session JWT Module**: Custom lightweight cookie session layer to decouple from third-party auth platforms (Clerk) for absolute on-premise deployments.
- **Direct Workspace Code Terminal**: Integrated client-side code viewer showcasing live syntax highlights and local diff previews prior to merge.
- **Alternative Payment Adapters**: Expand billing capability to support global providers like Stripe alongside Razorpay.
