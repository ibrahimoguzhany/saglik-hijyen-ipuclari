const Database = require('better-sqlite3');
const db = new Database('health-data.db');

const tipCount = db.prepare('SELECT COUNT(*) as count FROM tips').get();
console.log('Tips count:', tipCount.count);

const tips = db.prepare('SELECT * FROM tips').all();
console.log('Tips:', tips); 