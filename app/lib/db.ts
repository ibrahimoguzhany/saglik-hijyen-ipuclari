import bcrypt from 'bcryptjs';
import { getDb, formatQueryResult } from './db.config';

// Initialize database connection
const db = getDb();
const isProduction = process.env.NODE_ENV === 'production';

// Helper function to execute queries
async function executeQuery(query: string, params: any[] = []) {
  if (isProduction) {
    const result = await (db as any).query(query, params);
    return formatQueryResult(result);
  } else {
    const stmt = (db as any).prepare(query);
    return params.length > 0 ? stmt.run(...params) : stmt.all();
  }
}

// User operations
export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  role?: string;
}) {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  
  const query = `
    INSERT INTO users (email, password, name, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;
  
  try {
    const result = await executeQuery(query, [
      data.email,
      hashedPassword,
      data.name,
      data.role || 'user'
    ]);
    return { id: result[0]?.id };
  } catch (error: any) {
    if (error.code === '23505' || error.code === 'SQLITE_CONSTRAINT') {
      throw new Error('Bu e-posta adresi zaten kullanımda');
    }
    throw error;
  }
}

// Verify user
export async function verifyUser(email: string, password: string) {
  const query = 'SELECT * FROM users WHERE email = $1';
  const users = await executeQuery(query, [email]);
  const user = users[0];

  if (!user) {
    return null;
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return null;
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Get user by ID
export async function getUserById(id: number) {
  const query = 'SELECT id, email, name, role, created_at FROM users WHERE id = $1';
  const users = await executeQuery(query, [id]);
  return users[0];
}

// Tips operations
export async function getTips() {
  const query = `
    SELECT id, title, content, category, date
    FROM tips
    ORDER BY date DESC
  `;
  return executeQuery(query);
}

export async function getTipById(id: number) {
  const query = `
    SELECT id, title, content, category, date
    FROM tips
    WHERE id = $1
  `;
  const tips = await executeQuery(query, [id]);
  return tips[0];
}

// Reminders operations
export async function createReminder(userId: number, data: {
  title: string;
  time: string;
  type: string;
  isActive?: boolean;
}) {
  const query = `
    INSERT INTO reminders (user_id, title, time, type, is_active)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `;
  
  return executeQuery(query, [
    userId,
    data.title,
    data.time,
    data.type,
    data.isActive ?? true
  ]);
}

export async function getReminders(userId: number) {
  const query = `
    SELECT id, title, time, type, is_active
    FROM reminders
    WHERE user_id = $1
    ORDER BY time ASC
  `;
  
  return executeQuery(query, [userId]);
}

export async function updateReminder(userId: number, reminderId: number, data: {
  isActive: boolean;
}) {
  const query = `
    UPDATE reminders
    SET is_active = $1
    WHERE id = $2 AND user_id = $3
    RETURNING id
  `;
  
  return executeQuery(query, [data.isActive, reminderId, userId]);
}

export async function deleteReminder(userId: number, reminderId: number) {
  const query = `
    DELETE FROM reminders
    WHERE id = $1 AND user_id = $2
  `;
  
  return executeQuery(query, [reminderId, userId]);
}

// Health data operations
export async function upsertHealthData(userId: number, data: {
  steps: number;
  waterIntake: number;
  sleepHours: number;
  sleepQuality: number;
}) {
  const today = new Date().toISOString().split('T')[0];
  
  const query = isProduction ? `
    INSERT INTO health_data (user_id, date, steps, water_intake, sleep_hours, sleep_quality)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (user_id, date) 
    DO UPDATE SET 
      steps = EXCLUDED.steps,
      water_intake = EXCLUDED.water_intake,
      sleep_hours = EXCLUDED.sleep_hours,
      sleep_quality = EXCLUDED.sleep_quality
    RETURNING id
  ` : `
    INSERT INTO health_data (userId, date, steps, waterIntake, sleepHours, sleepQuality)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT(userId, date) 
    DO UPDATE SET 
      steps = $3,
      waterIntake = $4,
      sleepHours = $5,
      sleepQuality = $6
  `;
  
  return executeQuery(query, [
    userId,
    today,
    data.steps,
    data.waterIntake,
    data.sleepHours,
    data.sleepQuality
  ]);
}

export async function getHealthData(userId: number) {
  const query = isProduction ? `
    SELECT date, steps, water_intake as "waterIntake", 
           sleep_hours as "sleepHours", sleep_quality as "sleepQuality"
    FROM health_data
    WHERE user_id = $1
    ORDER BY date DESC
    LIMIT 7
  ` : `
    SELECT date, steps, waterIntake, sleepHours, sleepQuality
    FROM health_data
    WHERE userId = $1
    ORDER BY date DESC
    LIMIT 7
  `;
  
  return executeQuery(query, [userId]);
}

// Tips management
export async function createTip(data: { 
  title: string; 
  content: string; 
  category: string; 
  date: string; 
}) {
  const query = `
    INSERT INTO tips (title, content, category, date)
    VALUES ($1, $2, $3, $4)
    RETURNING id, title, content, category, date
  `;
  
  const result = await executeQuery(query, [
    data.title,
    data.content,
    data.category,
    data.date
  ]);
  
  return result[0];
}

export async function updateTip(id: number, data: { 
  title: string; 
  content: string; 
  category: string; 
  date: string; 
}) {
  const query = `
    UPDATE tips 
    SET title = $1, content = $2, category = $3, date = $4
    WHERE id = $5
    RETURNING id, title, content, category, date
  `;
  
  const result = await executeQuery(query, [
    data.title,
    data.content,
    data.category,
    data.date,
    id
  ]);
  
  return result[0] || null;
}

export async function deleteTip(id: number) {
  const query = 'DELETE FROM tips WHERE id = $1';
  const result = await executeQuery(query, [id]);
  return result.changes > 0;
}

// Cleanup on exit (only for SQLite)
if (!isProduction) {
  process.on('exit', () => {
    (db as any).close();
  });
}

export { db }; 