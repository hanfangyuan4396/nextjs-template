// Node 环境通用初始化（unit / integration）
// 目标：
// - integration tests 使用独立 SQLite 测试库（prisma/test.db）
// - 通过 migrations 初始化结构（贴近生产/CI）

// 按你的约定：测试 DB 放在仓库根目录
process.env.DATABASE_URL ??= "file:./test.db";
