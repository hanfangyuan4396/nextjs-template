# nextjs-template

# 项目说明

本前端项目基于 Next.js 16 (App Router) 与 TypeScript

## 启动方式

### 源码启动

适用于本地直接使用 Node.js 和 `npm` 启动项目。

#### 开发模式

在项目根目录执行：

```bash
npm install
npm run dev
```

启动后默认访问 `http://localhost:3000`。

#### 生产模式

在项目根目录执行：

```bash
npm install
npm run build
npm run start
```

如需在提交前检查前端代码质量，可额外执行：

```bash
npm run lint
npm run test
```

### Docker Compose 启动

项目提供了 `docker/docker-compose.yaml` 和 `docker/nextjs-template-service.sh`，可用于在服务器或本地以容器方式启动服务。

#### 启动前准备

在项目根目录执行以下命令：

```bash
cp docker/.env.example docker/.env
mkdir -p docker/volumes
touch docker/volumes/app.db
cd docker
./nextjs-template-service.sh start
```

#### 说明

- `docker/.env` 由 `docker/.env.example` 复制而来，可按实际部署环境补充变量。
- SQLite 数据库文件挂载为 `docker/volumes/app.db`，用于持久化 Prisma 数据。
- 默认会将容器内 `3000` 端口映射到宿主机 `3001` 端口。
- 如需停止服务，可在 `docker/` 目录执行 `./nextjs-template-service.sh stop`。
- 如需查看日志，可在 `docker/` 目录执行 `./nextjs-template-service.sh logs`。

## GitHub Actions 变量与 Secrets 表

| 名称 | 类型 | 作用范围 / Workflow | 是否必填 | 默认值 | 说明 |
|---|---|---|---|---|---|
| `ALIYUN_REGISTRY_USER` | Secret | `build-push.yaml` | 是 | 无 | 阿里云镜像仓库登录用户名。 |
| `ALIYUN_REGISTRY_PWD` | Secret | `build-push.yaml` | 是 | 无 | 阿里云镜像仓库登录密码 / Access Key。 |
| `ALIYUN_REGISTRY` | Variable | `build-push.yaml` | 否 | `registry.cn-hangzhou.aliyuncs.com` | 镜像仓库地址（含 region）。 |
| `PROJ_WEB_IMAGE_NAME` | Variable | `build-push.yaml` | 否 | `hanfangyuan/nextjs-template-web` | Web 镜像名称（不含 registry）。 |
| `SERVER_SSH_USER` | Secret | `deploy.yaml` | 是 | 无 | 目标服务器 SSH 用户名。 |
| `SERVER_SSH_KEY` | Secret | `deploy.yaml` | 是 | 无 | 目标服务器 SSH 私钥。 |
| `SERVER_SSH_HOST` | Variable | `deploy.yaml` | 是 | 无 | 目标服务器主机名或 IP（`deploy.yaml` 无默认值）。 |
| `SERVER_SSH_SCRIPT` | Variable | `deploy.yaml` | 否 | `cd services/nextjs-template/docker && ./nextjs-template-service.sh start && docker image prune -af` | 在服务器上执行的部署脚本命令。 |

## 初始化记录

```bash
npx create-next-app@latest nextjs-template \
  --ts \
  --app \
  --eslint \
  --src-dir \
  --use-npm \
  --import-alias "@/*" \
  --tailwind \
  --use-turbopack
```

- 使用 `npm` 作为包管理器。
- `--use-turbopack` 启用 Turbopack 开发构建工具。

## UI 组件库集成

```bash
npx shadcn@latest init
```
- 选择基础主题色：`Neutral`。
- CLI 自动更新 `src/app/globals.css`、`src/lib/utils.ts` 并生成 `components.json`。

### 已添加组件

```bash
npx shadcn@latest add button input label select form table dropdown-menu pagination
```
- 组件文件生成于 `src/components/ui/`。

## 调整项目名称
告诉AI"搜索当前项目的docker compose，workflows配置等文件，把nextjs-template-web改成xx"
