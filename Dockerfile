# 构建阶段
# FROM registry.cn-hangzhou.aliyuncs.com/hanfangyuan/node:22-alpine AS builder
FROM node:22-alpine AS builder

WORKDIR /web

# 复制依赖文件
COPY package.json package-lock.json ./

RUN npm ci

# 复制所有文件
COPY . .

# 设置环境变量
# TODO 除了放到Dockerfile还有其他更好的方式吗
ENV NEXT_PUBLIC_API_BASE_URL=/api

# Prisma 在构建期会被 Next.js 评估（例如 app/api 路由被打包/分析），
# 需要确保 @prisma/client 已生成；同时避免依赖仓库是否提交了 .env。
# 对 sqlite 来说，生成阶段不需要真实 DB 文件，但需要一个合法的 DATABASE_URL。
ENV DATABASE_URL=file:./dev.db

# 生成 Prisma Client（npm ci 发生在 COPY . 之前时，postinstall 无法拿到 schema.prisma）
RUN npx prisma generate

# 构建应用
RUN npm run build

# 运行阶段
# FROM registry.cn-hangzhou.aliyuncs.com/hanfangyuan/node:22-alpine AS runner
FROM node:22-alpine AS runner

WORKDIR /web

# 复制构建结果
COPY --from=builder /web/public ./public
COPY --from=builder /web/.next/standalone ./
COPY --from=builder /web/.next/static ./.next/static

# Prisma migrate deploy 在运行期需要 prisma CLI。
# Next.js standalone 产物里的 node_modules 通常不包含 prisma（本项目 prisma 在 devDependencies），
# 但把 builder 的整套 node_modules 拷进来会显著增大镜像体积。
#
# 方案：在 runner 构建期“单独安装 prisma CLI”到独立目录 /web/prisma-cli，
# 启动时使用它执行 migrate deploy（见 bin/boot.sh）。
ARG PRISMA_VERSION=6.19.1
RUN npm install --no-audit --no-fund --prefix /web/prisma-cli prisma@${PRISMA_VERSION}

COPY --from=builder /web/prisma ./prisma

# 启动脚本（含启动前自动迁移）
COPY --from=builder /web/bin/boot.sh /web/bin/boot.sh
RUN chmod +x /web/bin/boot.sh

# 暴露端口
EXPOSE 3000

# 启动应用
ENTRYPOINT ["/web/bin/boot.sh"]
