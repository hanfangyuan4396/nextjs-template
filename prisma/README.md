# Prisma 使用说明（SQLite）

本项目使用 **Prisma ORM** 管理数据库结构（schema）与迁移（migrations），数据库连接通过环境变量 `DATABASE_URL` 指定。

## 基本概念
- **`prisma/schema.prisma`**：唯一的“结构真相来源”。你改表结构/字段/索引/枚举，都改这里。
- **Migration（迁移）**：一组可回放的 SQL 变更，存放在 `prisma/migrations/*/migration.sql`，用于把数据库从旧结构升级到新结构。
- **Prisma Client**：根据 schema 生成的 TypeScript 客户端（`@prisma/client`），你的代码通过它读写数据库。

## 环境变量
- **DATABASE_URL**：SQLite 一般形如 `file:./dev.db`
  - 本项目示例见 `.env.example`
  - CI/生产环境请用部署平台的环境变量注入，不要把真实 `.env` 提交到仓库

## 常用命令速查

### `npx prisma migrate dev`
**干嘛的**：在本地开发使用。基于 `schema.prisma` 生成新的迁移文件，并把迁移应用到本地数据库；默认也会执行 `prisma generate`。  
**什么时候用**：
- 你在开发机上改了 `schema.prisma`，希望“生成迁移 + 更新本地库结构”时用
- 团队协作时，确保结构变更以 migration 形式沉淀到仓库
**注意**：
- 会创建 `prisma/migrations/xxxx_name/` 并记录变更
- 适合“可追踪、可回放”的结构演进

示例：

```bash
npx prisma migrate dev --name add_student_table
```

### `npx prisma migrate deploy`
**干嘛的**：在非交互环境（CI/生产）应用“已存在的迁移”。不会尝试根据 schema 生成新迁移。  
**什么时候用**：
- 部署时，把仓库里 `prisma/migrations/` 的迁移按顺序应用到目标数据库
**注意**：
- **只应用迁移**，不创建迁移；常用于发布流水线

示例：

```bash
npx prisma migrate deploy
```

### `npx prisma migrate reset`
**干嘛的**：删除并重建数据库，然后从头应用迁移（开发环境常用）。  
**什么时候用**：
- 本地库乱了、想从干净状态重来
- 你接受“数据会被清空”的前提下快速对齐结构
**注意**：
- 会清空数据；默认也会跑 generate/seed（若配置）

示例：

```bash
npx prisma migrate reset
```

### `npx prisma generate`
**干嘛的**：根据 `schema.prisma` 生成 Prisma Client（`node_modules/@prisma/client`）。  
**什么时候用**：
- 修改了 schema（尤其是字段/模型/枚举）后，出现类型不一致或 IDE 提示不对时
- CI/构建流程需要确保 client 已生成（有些场景会在 `postinstall` 或 build 前执行）
**注意**：
- `migrate dev` 默认会自动执行；单独执行多用于“只想更新 client，不动数据库”的情况

示例：

```bash
npx prisma generate
```

### `npx prisma db push`
**干嘛的**：把 `schema.prisma` 的结构“直接同步”到数据库（不生成 migration）。  
**什么时候用**：
- 快速原型/个人实验
- 你明确不需要迁移历史（不推荐用于团队正式环境）
**注意**：
- **不会产生可回放的迁移文件**，因此不适合生产可审计/可回滚的结构演进
- 对某些变更可能需要重建表或丢数据风险，务必谨慎

示例：

```bash
npx prisma db push
```

### `npx prisma studio`
**干嘛的**：打开一个可视化界面浏览/编辑数据库数据。  
**什么时候用**：
- 本地调试数据、验证写入是否正确

示例：

```bash
npx prisma studio
```

### `npx prisma db pull`
**干嘛的**：从已有数据库“反向生成” schema（用于接手存量库）。  
**什么时候用**：
- 你有一套现成数据库结构，想先导入到 Prisma 再开始维护
**注意**：
- 反向生成后仍需要人工整理/补充关系、命名等

示例：

```bash
npx prisma db pull
```

## 推荐工作流（团队/生产友好）
1. 修改 `prisma/schema.prisma`
2. 本地执行 `npx prisma migrate dev --name xxx` 生成迁移并更新本地数据库
3. 提交 `prisma/migrations/*` 与 `schema.prisma`
4. 部署时执行 `npx prisma migrate deploy` 应用迁移
