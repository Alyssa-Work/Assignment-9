import express from "express";
import { pool } from "../db/pool.js";

const router = express.Router();

const isValidId = (id) => /^\d+$/.test(id) && Number(id) <= 2147483647;

function validate(body, { partial = false } = {}) {
  const errors = [];
  const { title, description, category } = body ?? {};

  if (!partial || title !== undefined) {
    if (typeof title !== "string" || title.trim() === "") {
      errors.push("title is required and must be a non-empty string");
    } else if (title.length > 255) {
      errors.push("title must be 255 characters or fewer");
    }
  }
  if (description !== undefined && typeof description !== "string") {
    errors.push("description must be a string");
  }
  if (category !== undefined) {
    if (typeof category !== "string" || category.trim() === "") {
      errors.push("category must be a non-empty string");
    } else if (category.length > 100) {
      errors.push("category must be 100 characters or fewer");
    }
  }
  if (partial && title === undefined && description === undefined && category === undefined) {
    errors.push("provide at least one of: title, description, category");
  }
  return errors;
}

router.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT * FROM items ORDER BY id");
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ error: "Item not found" });
    const { rows } = await pool.query("SELECT * FROM items WHERE id = $1", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Item not found" });
    res.status(200).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const errors = validate(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const { title, description = "", category = "general" } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO items (title, description, category)
       VALUES ($1, $2, $3) RETURNING *`,
      [title.trim(), description, category.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ error: "Item not found" });
    const errors = validate(req.body, { partial: true });
    if (errors.length) return res.status(400).json({ errors });

    const { title, description, category } = req.body;
    const { rows } = await pool.query(
      `UPDATE items
          SET title       = COALESCE($1, title),
              description = COALESCE($2, description),
              category    = COALESCE($3, category),
              updated_at  = NOW()
        WHERE id = $4
        RETURNING *`,
      [title?.trim() ?? null, description ?? null, category?.trim() ?? null, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Item not found" });
    res.status(200).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ error: "Item not found" });
    const { rows } = await pool.query("DELETE FROM items WHERE id = $1 RETURNING *", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Item not found" });
    res.status(200).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
