import path from "node:path";

process.env.CORS_ORIGINS = "";
process.env.DATABASE_URL = `file:${path.resolve(process.cwd(), "prisma/test.db")}`;
process.env.JWT_ACCESS_SECRET = "test-access-secret-that-is-long-enough";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-that-is-long-enough";
process.env.NODE_ENV = "test";
process.env.PORT = "4000";
process.env.PUBLIC_UPLOAD_BASE_URL = "http://localhost:4000/uploads";
process.env.STORAGE_PROVIDER = "local";
