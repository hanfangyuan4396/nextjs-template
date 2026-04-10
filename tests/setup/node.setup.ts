// Node 环境通用初始化（unit / integration）
// integration：在测试里调用 useTestDatabase(name)，为每个套件使用独立 SQLite 文件并 migrate，
// 避免多 worker 争用同一 test.db。此处不再默认写入 DATABASE_URL。
