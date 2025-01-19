import { Pool } from 'pg';

// PostgreSQL configuration
const postgresConfig = {
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
};

// Export database instance
export const getDb = async () => {
  return new Pool(postgresConfig);
};

// Helper function to format query results consistently
export const formatQueryResult = (result: any) => {
  return result.rows;
}; 