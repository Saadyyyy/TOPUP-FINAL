import pool from "../config/database";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

async function reset() {
  try {
    console.log("Resetting database...");

    // Drop all tables
    const tables = ["products", "banners", "categories", "users"]; // foreign key order matters for deletion?
    // Products has FK to Categories. So delete Products first.

    // Actually, safer to disable FK checks, drop, then re-enable.
    await pool.query("SET FOREIGN_KEY_CHECKS = 0");
    for (const table of tables) {
      await pool.query(`DROP TABLE IF EXISTS ${table}`);
      console.log(`Dropped table ${table}`);
    }
    await pool.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("Database cleared.");

    // Run migrate
    console.log("Running migrations...");
    await execPromise("npx ts-node src/scripts/migrate.ts");

    // Run seed
    console.log("Running seeds...");
    await execPromise("npx ts-node src/scripts/seed.ts");

    console.log("Database reset complete.");
    process.exit(0);
  } catch (error) {
    console.error("Reset failed:", error);
    process.exit(1);
  }
}

reset();
