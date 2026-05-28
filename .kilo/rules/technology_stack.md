# Technology Stack for Admissions System

## Overview

This document describes the core technologies used in the Admissions System project.

## Technology Requirements

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| **React**  | 19      | UI library |
| **TypeScript** | —   | Statically-typed language |
| **Vite**   | 8       | Build tool & development server |
| **pnpm**   | —       | Package manager |

### Routing & Navigation

| Technology | Purpose |
|------------|---------|
| **TanStack Router** | Routing and navigation management |

### Server State & Data

| Technology | Purpose |
|------------|---------|
| **TanStack Query** | Server state management, caching & data synchronization |
| **Axios** | HTTP client (API calls) |

### UI & Forms

| Technology | Purpose |
|------------|---------|
| **Ant Design** | UI component library |
| **React Hook Form** | Form management and validation |

### State & Validation

| Technology | Purpose |
|------------|---------|
| **Zustand** | Lightweight state management |
| **Zod** | Schema validation (form data & API) |

### Code Quality

| Technology | Purpose |
|------------|---------|
| **ESLint** | Linting and code quality checks |
| **Prettier** | Automatic code formatting |
| **Husky** | Git hooks (auto-run lint/format before commit) |
| **lint-staged** | Run lint-staged on changed files during commit |
| **React Compiler** | Performance optimization via `babel-plugin-react-compiler` |

## Library Responsibilities

- **TanStack Router** is the sole routing mechanism; all routes are defined and managed through its config.
- **Zustand** is the sole global state solution; `useState` must not be used for shared/global state.
- **Zod** is the sole schema validation tool; inline validation logic in components is prohibited.
- **Axios** instances are the sole HTTP client; all API calls must go through `src/apis/` only.

## Tooling Notes

- **pnpm** is the enforced package manager; install dependencies with `pnpm install`.
- **Prettier** formatting is enforced via Husky pre-commit hook — never skip formatting before committing.
- **React Compiler** (`babel-plugin-react-compiler`) is enabled for automatic memoization and performance optimization.

---
*Technology stack document for the Admissions System project.*
