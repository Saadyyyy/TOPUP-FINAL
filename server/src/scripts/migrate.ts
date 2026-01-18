import pool from "../config/database";
import fs from "fs";
import path from "path";

async function migrate() {
  try {
    const schemaPath = path.join(__dirname, "../db/schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Split by semicolon to get individual queries
    const queries = schema
      .split(";")
      .map((q) => q.trim())
      .filter((q) => q.length > 0);

    console.log("Running migrations...");

    for (const query of queries) {
      await pool.query(query);
    }

    console.log("Migrations completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
