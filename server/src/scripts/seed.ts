import pool from "../config/database";
import bcrypt from "bcryptjs";

async function seed() {
  try {
    console.log("Seeding database...");

    // 1. Seed Users (Admin)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("admin123", salt); // Default admin password

    // Check if admin exists to avoid duplicate error if not cleaned
    const [existingUsers]: any = await pool.query(
      "SELECT * FROM users WHERE username = 'admin'",
    );
    if (existingUsers.length === 0) {
      await pool.query(
        "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
        ["admin", "admin@example.com", passwordHash],
      );
      console.log("Admin user seeded.");
    } else {
      console.log("Admin user already exists.");
    }

    // 2. Seed Categories
    const categories = [
      {
        name: "Game Topup",
        image_url: "/uploads/topup.png",
        description: "Top up",
      },
    ];

    for (const cat of categories) {
      const [rows]: any = await pool.query(
        "SELECT id FROM categories WHERE name = ?",
        [cat.name],
      );
      if (rows.length === 0) {
        await pool.query(
          "INSERT INTO categories (name, image_url, description) VALUES (?, ?, ?)",
          [cat.name, cat.image_url, cat.description],
        );
      }
    }
    console.log("Categories seeded.");

    console.log("Seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
