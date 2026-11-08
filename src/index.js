import express from "express";
import { logger } from "./middleware/logger.js";
import itemsRouter from "./routes/items.js";
import { initDb } from "./db/pool.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(logger);
app.use("/api/items", itemsRouter);

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON body" });
  }
  next(err);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

try {
  await initDb();
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
} catch (err) {
  console.error("Failed to connect to the database:", err.message);
  process.exit(1);
}
