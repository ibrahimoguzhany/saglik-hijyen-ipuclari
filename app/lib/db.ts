import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

// Veritabanı dosyasının yolu
const dbPath = path.join(process.cwd(), 'health-data.db');

// Veritabanı bağlantısı
let db: ReturnType<typeof Database>;
try {
  console.log('Opening database connection...');
  console.log('Database path:', dbPath);
  db = new Database(dbPath);
  console.log('Database connection successful');

  // Tabloları oluştur
  console.log('Creating tables...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin', 'user')) DEFAULT 'user',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS health_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      date TEXT NOT NULL,
      steps INTEGER NOT NULL,
      waterIntake INTEGER NOT NULL,
      sleepHours REAL NOT NULL,
      sleepQuality INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(userId, date),
      FOREIGN KEY(userId) REFERENCES users(id)
    );

    DROP TABLE IF EXISTS reminders;
    CREATE TABLE reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      title TEXT NOT NULL,
      time TEXT NOT NULL,
      type TEXT NOT NULL,
      isActive BOOLEAN DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS tips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('Tables created successfully');

  // Örnek ipuçlarını ekle (sadece tablo boşsa)
  const tipCount = db.prepare('SELECT COUNT(*) as count FROM tips').get() as { count: number };
  if (tipCount.count === 0) {
    console.log('Adding sample tips...');
    const insertTip = db.prepare(`
      INSERT INTO tips (title, content, category, date)
      VALUES (@title, @content, @category, @date)
    `);

    const tips = [
      {
        title: 'Düzenli El Yıkama',
        content: 'Ellerinizi en az 20 saniye boyunca sabun ve suyla yıkayın. Özellikle yemeklerden önce ve sonra, tuvaleti kullandıktan sonra ve dışarıdan eve geldiğinizde bu kurala dikkat edin.',
        category: 'hijyen',
        date: '2024-03-20'
      },
      {
        title: 'Yeterli Uyku',
        content: 'Yetişkinler için günde 7-9 saat uyku optimal sağlık için önemlidir. Düzenli uyku saatleri bağışıklık sisteminizi güçlendirir.',
        category: 'sağlık',
        date: '2024-03-21'
      },
      {
        title: 'Dengeli Beslenme',
        content: 'Günlük beslenmenizde protein, karbonhidrat ve sağlıklı yağları dengeli bir şekilde tüketin. Bol miktarda sebze ve meyve tüketmeyi ihmal etmeyin.',
        category: 'sağlık',
        date: '2024-03-22'
      }
    ];

    const transaction = db.transaction(() => {
      for (const tip of tips) {
        insertTip.run(tip);
      }
    });

    transaction();
    console.log('Sample tips added successfully');
  }

  // Örnek admin kullanıcısı ekle (sadece tablo boşsa)
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    console.log('Adding default admin user...');
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    const stmt = db.prepare(`
      INSERT INTO users (email, password, name, role)
      VALUES (@email, @password, @name, @role)
    `);

    stmt.run({
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'admin'
    });

    console.log('Default admin user created:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
  } else {
    // Admin kullanıcısının rolünü güncelle
    const updateStmt = db.prepare(`
      UPDATE users 
      SET role = 'admin' 
      WHERE email = 'admin@example.com'
    `);
    updateStmt.run();
    console.log('Admin user role updated');
  }
} catch (error) {
  console.error('Database initialization error:', error);
  throw new Error('Veritabanı başlatılamadı: ' + (error as Error).message);
}

// Kullanıcı işlemleri
export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  role?: string;
}) {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  
  const stmt = db.prepare(`
    INSERT INTO users (email, password, name, role)
    VALUES (@email, @password, @name, @role)
  `);

  try {
    const result = stmt.run({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: data.role || 'user'
    });
    return { id: result.lastInsertRowid };
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      throw new Error('Bu e-posta adresi zaten kullanımda');
    }
    throw error;
  }
}

interface DbUser {
  id: number;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export async function verifyUser(email: string, password: string) {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  const user = stmt.get(email) as DbUser | undefined;

  if (!user) {
    return null;
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return null;
  }

  // Şifreyi çıkar
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export function getUserById(id: number) {
  const stmt = db.prepare('SELECT id, email, name, role, createdAt FROM users WHERE id = ?');
  return stmt.get(id) as { id: number; email: string; name: string; role: 'admin' | 'user'; createdAt: string } | undefined;
}

interface Tip {
  id: number;
  title: string;
  content: string;
  category: string;
  date: string;
}

// İpucu işlemleri
export function getTips() {
  console.log('getTips called');
  try {
    console.log('Preparing SQL statement...');
    const stmt = db.prepare(`
      SELECT id, title, content, category, date
      FROM tips
      ORDER BY date DESC
    `);
    
    console.log('Executing SQL statement...');
    const tips = stmt.all() as Tip[];
    console.log('Tips fetched:', tips ? tips.length : 0);
    
    return tips;
  } catch (error) {
    console.error('getTips error:', error);
    throw error; // Let the API handle the error
  }
}

export function getTipById(id: number) {
  const stmt = db.prepare(`
    SELECT id, title, content, category, date
    FROM tips
    WHERE id = ?
  `);

  return stmt.get(id);
}

// Hatırlatıcı işlemleri
export function createReminder(userId: number, data: {
  title: string;
  time: string;
  type: string;
  isActive?: boolean;
}) {
  const stmt = db.prepare(`
    INSERT INTO reminders (userId, title, time, type, isActive)
    VALUES (@userId, @title, @time, @type, @isActive)
  `);

  return stmt.run({
    userId,
    ...data,
    isActive: data.isActive ?? true
  });
}

export function getReminders(userId: number) {
  const stmt = db.prepare(`
    SELECT id, title, time, type, isActive
    FROM reminders
    WHERE userId = ?
    ORDER BY time ASC
  `);

  return stmt.all(userId);
}

export function updateReminder(userId: number, reminderId: number, data: {
  isActive: boolean;
}) {
  const stmt = db.prepare(`
    UPDATE reminders
    SET isActive = @isActive
    WHERE id = @reminderId AND userId = @userId
  `);

  return stmt.run({
    userId,
    reminderId,
    isActive: data.isActive
  });
}

export function deleteReminder(userId: number, reminderId: number) {
  const stmt = db.prepare(`
    DELETE FROM reminders
    WHERE id = ? AND userId = ?
  `);

  return stmt.run(reminderId, userId);
}

// Sağlık verisi işlemleri
export function upsertHealthData(userId: number, data: {
  steps: number;
  waterIntake: number;
  sleepHours: number;
  sleepQuality: number;
}) {
  const today = new Date().toISOString().split('T')[0];
  
  const stmt = db.prepare(`
    INSERT INTO health_data (userId, date, steps, waterIntake, sleepHours, sleepQuality)
    VALUES (@userId, @date, @steps, @waterIntake, @sleepHours, @sleepQuality)
    ON CONFLICT(userId, date) 
    DO UPDATE SET 
      steps = @steps,
      waterIntake = @waterIntake,
      sleepHours = @sleepHours,
      sleepQuality = @sleepQuality
  `);

  return stmt.run({
    userId,
    date: today,
    ...data
  });
}

export function getHealthData(userId: number) {
  const stmt = db.prepare(`
    SELECT date, steps, waterIntake, sleepHours, sleepQuality
    FROM health_data
    WHERE userId = ?
    ORDER BY date DESC
    LIMIT 7
  `);

  return stmt.all(userId);
}

export function createTip(data: { title: string; content: string; category: string; date: string }) {
  const stmt = db.prepare(`
    INSERT INTO tips (title, content, category, date)
    VALUES (?, ?, ?, ?)
  `);
  
  const result = stmt.run(data.title, data.content, data.category, data.date);
  
  if (result.changes === 0) {
    throw new Error('İpucu eklenemedi');
  }

  return {
    id: result.lastInsertRowid,
    ...data
  };
}

export function updateTip(id: number, data: { title: string; content: string; category: string; date: string }) {
  const stmt = db.prepare(`
    UPDATE tips 
    SET title = ?, content = ?, category = ?, date = ?
    WHERE id = ?
  `);
  
  const result = stmt.run(data.title, data.content, data.category, data.date, id);
  
  if (result.changes === 0) {
    return null;
  }

  return {
    id,
    ...data
  };
}

export function deleteTip(id: number) {
  const stmt = db.prepare('DELETE FROM tips WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

// Veritabanı bağlantısını kapat
process.on('exit', () => {
  db.close();
});

export { db }; 