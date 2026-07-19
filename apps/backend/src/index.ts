import { app } from "./app.js";
import { env } from "./config/env.js";
import { disconnectPrisma } from "./database/prismaClient.js";

const server = app.listen(env.PORT, () => {
  console.info(`Falcon API listening on port ${env.PORT}`);
});

async function shutdown(signal: NodeJS.Signals) {
  console.info(`Received ${signal}. Closing Falcon API gracefully.`);
  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
