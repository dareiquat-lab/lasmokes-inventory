import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function createSchema() {
  console.log("Creating database schema...");

  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      product_name TEXT NOT NULL,
      category TEXT NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
      image_url TEXT,
      barcode TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_products_quantity ON products(quantity)
  `;

  console.log("Schema created successfully!");
}

createSchema().catch(console.error);
