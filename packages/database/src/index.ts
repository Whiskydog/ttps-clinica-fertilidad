/**
 * @repo/database
 * Database layer with Drizzle ORM and Supabase PostgreSQL
 */

// Client
export { db, sql, closeDatabase, type Database } from './client';

// Schema
export * from './schema';

// Queries
export * from './queries';

// Mutations
export * from './mutations';
