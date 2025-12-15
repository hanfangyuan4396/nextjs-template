# 测试集成需求文档

## 需求描述

为当前 Next.js 16（App Router）+ React 19 + TypeScript + Prisma（SQLite）项目集成一套“分层、可维护、可在 CI 稳定运行”的测试体系，覆盖：

- 后端逻辑单元测试（尽量纯函数/可注入依赖）
- 接口测试（Route Handler / API 层的集成测试）
- 组件测试（以用户行为为中心）
- 少量 E2E 测试（覆盖关键主流程）

用户已调研并倾向使用以下主流工具链：

- Vitest
- React Testing Library
- @testing-library/user-event
- happy-dom
- MSW
- Playwright

## 需求目标

- **分层清晰**：不同测试层级职责明确，避免重复验证同一行为。
- **最佳实践**：以行为/输出为导向，减少对实现细节（内部 state、私有函数、Next 内部机制）的依赖。
- **运行稳定且快速**：本地开发可快速反馈；CI 中可稳定复现。
- **环境可控**：测试数据库、网络请求、时间等可被隔离与控制。
- **可扩展**：后续新增 API、业务逻辑、组件时有统一的测试模板与约定。

## 框架选型确认（建议结论）

整体上，你给出的组合对本项目是**合适**的：

- **Vitest**：适合作为单元/集成/组件测试的主框架，速度快，生态成熟。
- **React Testing Library + user-event**：组件测试最佳实践组合，强调用户行为而非实现细节。
- **happy-dom**：作为 Vitest 的 DOM 环境，适合常规组件交互测试；本项目将**仅使用 happy-dom**，不引入 jsdom 分流以降低复杂度。
- **MSW**：用于 mock `fetch`/HTTP 请求，适合测试 `src/service/*` 及依赖接口的组件。
- **Playwright**：适合少量关键链路的 E2E（可在真实浏览器中验证）。

需要注意的边界/约束：

- **接口测试与 MSW 的边界**：对后端 Route Handler（`src/app/api/**/route.ts`）的集成测试建议使用真实的 Prisma + 测试数据库，不要用 MSW（否则会变成“对 mock 的测试”）。
- **Next.js 运行时差异**：Route Handler 可能依赖 Next 特定对象（`NextResponse` 等）。建议将核心业务逻辑抽到 service 层，Route Handler 仅做参数解析/校验/调用与响应拼装，从而提升可测性。

## 技术方案（可选）

### 测试分层与覆盖范围

- **后端逻辑单元测试（Unit / Server Logic）**
  - 范围：纯逻辑、校验、转换、权限判断等（建议从 `route.ts` 中抽到独立模块）
  - 示例对象：
    - `src/lib/auth.ts`（JWT role 解析逻辑）
    - 未来新增的 `src/server/*` 或 `src/app/api/**/service.ts`
  - 技术点：Vitest + 依赖注入/Mock（如 mock Prisma 或抽象 repository）

- **接口测试（API / Integration）**
  - 范围：直接测试 Route Handler（首期仅覆盖 `src/app/api/students/route.ts` 的 `GET/POST`），验证：
    - 请求参数解析（query/body）
    - 业务校验（缺字段返回 400）
    - 数据库读写与约束（如 `student_id` 唯一）
    - 响应格式（统一 `ApiResponse`）
  - 数据库策略（已确认）：使用独立的 SQLite 测试 DB（`prisma/test.db`），并通过 **migration** 初始化结构（更贴近生产）。

- **组件测试（Component / UI）**
  - 范围：组件交互、状态切换、表单校验、列表渲染、错误提示等
  - 原则：以用户行为驱动（click/type/submit），尽量不测实现细节
  - 对外部依赖：
    - 对 `src/service/*` 的 HTTP 调用，优先用 MSW mock（更贴近真实网络边界）
    - 对纯工具函数/formatters，可直接 unit test

- **E2E 测试（Playwright）**
  - 范围（已确认）：仅覆盖 2 条关键路径
    - 分页展示
    - 新增学生成功/失败（唯一约束提示）
  - 原则：E2E 只覆盖“系统级信心”，其它细节用组件/接口测试承担，避免 E2E 过多导致不稳定与耗时。

### 目录结构与命名约定（建议）

- **单元/接口/组件测试（Vitest）（已确认）**
  - `tests/unit/**`：纯逻辑/工具函数等单元测试
  - `tests/integration/**`：接口测试（Route Handler + Prisma + test.db + migrations）
  - `tests/components/**`：组件测试（RTL + user-event + MSW + happy-dom）

- **E2E（Playwright）**
  - `tests/e2e/**/*.spec.ts`

### 配置与脚本（建议）

- **Vitest**
  - 提供 `vitest.config.ts`
  - 支持 TS path alias（当前项目 `@/*` -> `src/*`）
  - 按测试类型区分环境：
    - UI/组件测试：`happy-dom` + `@testing-library/jest-dom` + MSW
    - 纯 Node 测试（如 API 集成/工具函数）：`node`

- **MSW**
  - 提供通用 handler 与 `setupServer`（Node 环境）
  - 组件测试默认启用；API 集成测试默认不启用（避免 mock 掩盖真实问题）

- **NPM scripts（示例）**
  - `test`: 运行 Vitest
  - `test:watch`: watch 模式
  - `test:coverage`: 打印覆盖率报告（不设置阈值）
  - `test:e2e`: Playwright
  - `test:e2e:ui`: Playwright UI

### CI（建议）

- 在 GitHub Actions 中分两类 job：
  - **unit/integration/components**：直接跑 Vitest（速度快，作为 PR 必跑）
  - **e2e**（已确认）：PR **必跑**，需要安装 Playwright 浏览器依赖
## 已确认决策（本需求的约束条件）

- **数据库与迁移**：接受使用 `prisma/test.db` 作为测试数据库；结构初始化与演进通过 **migration** 完成（更贴近生产），不使用 `db push` 路线。
- **覆盖率**：不设置覆盖率阈值；测试完成后可打印覆盖率报告用于观察趋势。
- **DOM 环境**：组件测试仅使用 **happy-dom**，不引入 jsdom 分流策略。
- **E2E 覆盖范围**：仅覆盖“分页展示”和“新增学生成功/失败（唯一约束提示）”两条路径。
- **接口测试范围**：当前仅有 `students` API，首期只补全它的接口测试即可。
- **目录结构**：使用 `tests/unit|integration|components/**`。
- **CI 策略**：E2E（Playwright）在 PR 中**必跑**。

## 可测试性评估：`students-management` 是否需要改造

- **结论**：当前页面已经具备良好的可测试性，**不需要为了测试额外改造**。
- **现状依据**：
  - 页面数据读取/写入已通过 `src/service/students.ts`（`listStudents` / `createStudent`）走统一 HTTP 封装；
  - UI 侧的分页状态、加载态、表单校验等逻辑位于客户端组件中，适合用 RTL（组件测试）+ Playwright（少量 E2E）覆盖；
  - 接口侧的校验与唯一约束（`student_id`）已在 `src/app/api/students/route.ts` 体现，适合用 Prisma + test.db + migrations 做集成测试覆盖。
- **关于“Route Handler 抽 service 层”**：
  - 当前 `students` 的 `route.ts` 体量较小，可以先保持现状；
  - 若后续 API 复杂度上升（更多校验/权限/事务/跨表查询），再考虑将可复用业务逻辑抽到 `src/server/*` 或 `src/app/api/**/service.ts`，并给该层加单元测试。


