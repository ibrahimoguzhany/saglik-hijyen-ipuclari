import { Pool } from 'pg';
import fs from 'fs/promises';
import path from 'path';

async function runMigrations() {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Running migrations...');
    
    // Read the migration SQL file
    const migrationSQL = await fs.readFile(
      path.join(process.cwd(), 'app', 'lib', 'migrations.sql'),
      'utf8'
    );

    // Execute migrations
    await pool.query(migrationSQL);
    
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { runMigrations }; 