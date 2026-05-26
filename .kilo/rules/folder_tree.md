
## Placement Restrictions

- **API calls**: Must reside **ONLY** in `src/apis/` or `src/services/`
- **Business logic**: Must reside **ONLY** in `src/services/` or `src/store/`
- **UI components**:
  - Page-specific components: `src/pages/` or `src/layouts/`
  - Reusable/shared components: `src/components/`
  - Do **NOT** place pages or layouts inside `src/components/`
- **Constants**: Must reside **ONLY** in `src/constants/`
- **Types/Interfaces**: Must reside **ONLY** in `src/types/` (component-local props may be colocated)
- **Validation schemas**: Must reside **ONLY** in `src/validations/` (using Zod)
- **Custom hooks**: Must reside **ONLY** in `src/hooks/`
- **Utilities**: Must reside **ONLY** in `src/utils/` or `src/services/`

## Technology Requirements

| Concern        | Path                  | Library / Format         |
|----------------|-----------------------|--------------------------|
| Routing        | `src/routes/`         | TanStack Router          |
| State Mgmt     | `src/store/`          | Zustand                  |
| Validation     | `src/validations/`    | Zod                      |
| API Client     | `src/apis/`           | Axios instances          |
| i18n           | `src/locales/`        | i18next                  |

## Import Structure

- Use the `@/` path alias (maps to `src/`) for all internal imports
- Follow import order:
  1. External packages (`react`, `react-dom`, …)
  2. `@/` absolute imports
  3. Relative imports (only when necessary)
- Component importing rules:
  - Base/shared components → `@/components/common/`
  - Layout components → `@/components/layout/`
  - Never import from `@/pages/` or `@/layouts/` inside `@/components/`
- Services must import from `@/apis/` and `@/utils/`; components import from `@/services/` only
- Global types → `@/types/`; component-local types may be colocated

## Prohibited Practices

- ❌ API calls directly in component event handlers
- ❌ Business logic embedded in `useEffect` without a service layer
- ❌ Reusable components created inside `src/pages/`
- ❌ Global state stored with `useState` instead of Zustand
- ❌ Hardcoded API endpoints outside of `src/apis/`
- ❌ Using `any` instead of TypeScript interfaces from `src/types/`
- ❌ Inline validation logic in components (use Zod instead)
- ❌ CSS/syle imports that bypass existing styling conventions
- ❌ Duplicate utility functions that already exist in `src/utils/`
- ❌ Bypassing the Zustand store in favor of prop drilling
- ❌ Skipping directory hierarchy (e.g., putting helpers in `src/components/`)
- ❌ Adding business logic to layout components
- ❌ Page-specific API calls placed inside shared components

## Validation & Enforcement

- New file suggestions must state the exact target directory from the approved structure
- Code reviews must verify placement before approvals are granted
- When refactoring, existing code must be moved to the correct directory following these rules
- When placement is uncertain, consult this file before writing
- Violations are flagged during review with a direct reference to the correct directory

---
*Rules designed to enforce a scalable, predictable codebase aligned with TanStack Router + Zustand + Zod best practices.*
EOF