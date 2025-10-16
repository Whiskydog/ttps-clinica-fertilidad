import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

/**
 * Database connection configuration
 * Lazy initialization to ensure env vars are loaded
 */

let _sql: ReturnType<typeof postgres> | null = null;
let _db: PostgresJsDatabase<typeof schema> | null = null;

function getConnectionString(): string {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL environment variable is not set. Please check your .env file.'
    );
  }

  return connectionString;
}

/**
 * Get PostgreSQL client (lazy initialization)
 */
export function getSql() {
  if (!_sql) {
    const connectionString = getConnectionString();
    _sql = postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return _sql;
}

/**
 * Get Drizzle ORM instance (lazy initialization)
 */
export function getDb(): PostgresJsDatabase<typeof schema> {
  if (!_db) {
    _db = drizzle(getSql(), { schema });
  }
  return _db;
}

// Export the lazy getter as 'db' for backward compatibility
export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_, prop) {
    return getDb()[prop as keyof PostgresJsDatabase<typeof schema>];
  },
});

// Export sql for direct access if needed
export const sql = new Proxy({} as ReturnType<typeof postgres>, {
  get(_, prop) {
    return getSql()[prop as keyof ReturnType<typeof postgres>];
  },
});

/**
 * Close database connection
 */
export async function closeDatabase() {
  if (_sql) {
    await _sql.end();
    _sql = null;
    _db = null;
  }
}

export type Database = PostgresJsDatabase<typeof schema>;
