import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });

function parseDatabaseUrl(value) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\/+/, ''),
    };
  } catch (error) {
    return null;
  }
}

function getDbConfig() {
  const databaseUrl = process.env.DATABASE_URL || process.env.DB_URL || '';
  const parsedUrl = parseDatabaseUrl(databaseUrl) || parseDatabaseUrl(process.env.DB_HOST || '');

  if (parsedUrl) {
    return parsedUrl;
  }

  return {
    host: process.env.MYSQLHOST || process.env.RAILWAY_DB_HOST || process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306', 10),
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.MYSQLDATABASE || process.env.MYSQL_DB || process.env.DB_NAME || 'surema_fashion',
  };
}

const { host, port, user, password, database } = getDbConfig();
const sslEnabled = process.env.MYSQL_SSL === 'true' || process.env.DB_SSL === 'true' || process.env.RAILWAY_ENVIRONMENT;

const pool = mysql.createPool({
  host,
  port,
  user,
  password,
  database,
  ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export async function getOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

export default pool;

// Test DB connection at startup to provide clearer diagnostics for misconfiguration
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.execute('SELECT 1');
    conn.release();
    console.log('Database connection: OK');
  } catch (err) {
    console.error('Database connection failed. Config (without password):', { host, port, user, database });
    console.error('Tip: create a `.env` in the `backend` folder with MYSQLUSER, MYSQLPASSWORD, MYSQLHOST, MYSQLDATABASE, or set `DATABASE_URL`.');
    throw err;
  }
}

await testConnection();
