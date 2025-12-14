# nextjs-template

# 项目说明

本前端项目基于 Next.js 16 (App Router) 与 TypeScript


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
