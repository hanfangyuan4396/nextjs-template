# Repository Guidelines

## 项目结构与模块组织
应用代码位于 `src/`。其中 `src/app/` 存放 App Router 页面与 API 路由，`src/components/` 存放通用组件与鉴权包装组件，`src/service/` 存放服务层逻辑，`src/lib/` 存放 Prisma、认证与工具函数，`src/i18n/` 存放国际化配置与文案。静态资源位于 `public/`。数据库 schema、迁移与本地 SQLite 文件位于 `prisma/`。测试按层次放在 `tests/unit/`、`tests/integration/`、`tests/components/` 与 `tests/e2e/`。

## 构建、测试与开发命令
本仓库统一使用 `npm`。

- `npm run dev`：启动 Next.js 本地开发服务。
- `npm run build`：生成生产构建。
- `npm run start`：本地启动生产构建结果。
- `npm run lint`：运行 ESLint 检查。
- `npm run lint:fix`：自动修复可安全处理的 ESLint 问题。
- `npm test`：运行 Vitest，一次执行单元、集成和组件测试。
- `npm run test:coverage`：运行 Vitest 并生成 V8 覆盖率报告。
- `npm run test:e2e`：运行 Playwright 端到端测试，并使用预置数据启动应用。

## 代码风格与命名约定
使用 TypeScript，遵循现有代码风格：2 空格缩进、保留分号、使用双引号。React 组件使用 PascalCase，函数与变量使用 camelCase，路由目录与组件文件名使用 kebab-case，例如 `locale-switcher.tsx`。基础 UI 组件集中放在 `src/components/ui/`，内部模块优先使用 `@/` 别名导入。代码规范由 `eslint.config.mjs` 统一约束，基于 Next.js core-web-vitals 与 TypeScript 规则集。

## 测试规范
测试文件命名为 `*.test.ts` 或 `*.test.tsx`，并放入对应的 `tests/` 子目录。Vitest 在 `node` 环境下运行单元测试与集成测试，在 `happy-dom` 环境下运行组件测试。Playwright 用例位于 `tests/e2e/`，依赖 `tests/e2e/reset-and-seed.mjs` 以及 Prisma 的 E2E 数据库。涉及功能变更时，提交前至少运行 `npm run test:coverage`。

## 提交与 Pull Request 规范
近期提交遵循 Conventional Commits，例如 `feat(test): ...`、`chore(tests): ...`、`chore(ci): ...`。提交标题应简短，并尽量带上作用域。提交 Pull Request 时请附上变更摘要、已执行的测试命令、关联 Issue；如涉及界面改动，请补充截图。若变更影响 Prisma、环境变量或部署流程，需要在描述中明确说明。

## 重要，必须遵守的规则
- 请使用中文回答我的提问
- 循序渐进写代码，实现一部分代码停下来总结一下你的代码，方便我及时review
- 对于前端代码，要执行lint、test、build命令，确保代码质量

## 拆分与验证流程（前端）
- 拆分思路：先识别 UI 区块与逻辑边界，UI 抽成独立组件，业务/状态逻辑抽成 hooks
- 拆分过程：先抽 UI 组件，再抽 hooks；组件保持 props 清晰、逻辑不外泄；对话框类组件可拆为“壳 + 表单”
- 测试补充：为新组件/新 hooks 增加最小可用的单测（渲染态/关键行为），必要时补环境标记（如 happy-dom）
- 质量保障：每次拆分后立即运行 `npm run lint`、`npm run test`、`npm run build`
- 问题修复：出现 error/warning 时优先修复（类型、依赖数组、测试环境、构建类型兼容等），确保三项命令全绿
