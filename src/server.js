import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import env from "./config/env.js";

connectDB().then(() => {
  app.listen(env.port, () => {
    console.log(`[server] Running on port ${env.port} (${env.nodeEnv})`);
  });
});