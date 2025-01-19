import { Pool } from 'pg';
import Database from 'better-sqlite3';
import path from 'path';

// Environment-specific configuration
const isProduction = process.env.NODE_ENV === 'production';

// PostgreSQL configuration for production (Vercel)
const postgresConfig = {
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
};

// SQLite configuration for development
const sqliteConfig = {
  filename: path.join(process.cwd(), 'health-data.db')
};

// Export the appropriate database instance based on environment
export const getDb = () => {
  if (isProduction) {
    return new Pool(postgresConfig);
  } else {
    return new Database(sqliteConfig.filename);
  }
};

// Helper function to format query results consistently
export const formatQueryResult = (result: any) => {
  if (isProduction) {
    return result.rows;
  }
  return result;
}; 