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
        name: "Mobile Legends",
        image_url: "/uploads/mlbb.png",
        description: "Top up Diamond Mobile Legends",
      },
      {
        name: "Free Fire",
        image_url: "/uploads/ff.png",
        description: "Top up Diamond Free Fire",
      },
      {
        name: "PUBG Mobile",
        image_url: "/uploads/pubgm.png",
        description: "Top up UC PUBG Mobile",
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
