import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Check if we're using SQLite (local development) or PostgreSQL (production)
const isSQLite = process.env.DATABASE_URL.startsWith('file:');

let db: any;
let pool: any;

if (isSQLite) {
  // Mock database for local development
  console.log("🔧 Using mock database for development");
  db = {
    // Mock database methods
    select: () => ({ from: () => [] }),
    insert: () => ({ values: () => ({ returning: () => [] }) }),
    update: () => ({ set: () => ({ where: () => ({ returning: () => [] }) }) }),
    delete: () => ({ where: () => ({ returning: () => [] }) }),
  };
  pool = null;
} else {
  // PostgreSQL for production
  neonConfig.webSocketConstructor = ws;
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
}

export { db, pool };