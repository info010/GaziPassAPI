import mysql from 'mysql2/promise';
import { DB_HOST, DB_NAME, DB_PASS, DB_USER } from "@/server/config/config";

async function ensureDatabaseExists() {
  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
  });

  const [rows] = await connection.query(
    `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
    [DB_NAME]
  );

  if ((rows as any[]).length > 0) {
    logging.log(`Database "${DB_NAME}" is exists.`);
  } else {
    await connection.query(`CREATE DATABASE \`${DB_NAME}\`;`);
    logging.warn(`Database "${DB_NAME}" was created.`);
  }

  await connection.end();
}

ensureDatabaseExists();

export const db = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  supportBigNumbers: true,
  bigNumberStrings: true,
});

const secretPayloadTable = `
CREATE TABLE IF NOT EXISTS secret_payloads (
  email VARCHAR(255) UNIQUE,
  token VARCHAR(255),
  expire_at BIGINT
);
`;

const postTable = `
CREATE TABLE IF NOT EXISTS posts (
  id BIGINT PRIMARY KEY,
  title VARCHAR(255),
  description VARCHAR(255),
  upvote INT UNSIGNED DEFAULT 0,
  url VARCHAR(255),
  publisher_id BIGINT,
  FOREIGN KEY (publisher_id) REFERENCES users(id)
);
`;

const postTagsTable = `
CREATE TABLE IF NOT EXISTS post_tags (
  post_id BIGINT,
  tag VARCHAR(255),
  FOREIGN KEY (post_id) REFERENCES posts(id)
);
`;

const userTable = `
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY,
  username VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  role VARCHAR(255) DEFAULT 'user',
  FOREIGN KEY (id) REFERENCES auth_users(id)
);
`;

const userFollowingTagsTable = `
CREATE TABLE IF NOT EXISTS user_following_tags (
  user_id BIGINT,
  tag VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
`;

const userFavoritesTable = `
CREATE TABLE IF NOT EXISTS user_favorites (
  user_id BIGINT,
  post_id BIGINT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (post_id) REFERENCES posts(id)
);
`;

const userFollowingPublishersTable = `
CREATE TABLE IF NOT EXISTS user_following_publishers (
  user_id BIGINT,
  publisher_id BIGINT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (publisher_id) REFERENCES users(id)
);
`;

const authUserTable = `
CREATE TABLE IF NOT EXISTS auth_users (
  id BIGINT PRIMARY KEY,
  username VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255)
);
`;

const tables = [
  authUserTable,
  userTable,
  secretPayloadTable,
  postTable,
  postTagsTable,
  userFavoritesTable,
  userFollowingTagsTable,
  userFollowingPublishersTable,
];

export async function createTables() {
  tables.forEach((element) => {
    db.execute(element);
  });
}

export async function checkConnection() {
  try {
      const conn = await db.getConnection();
      await conn.ping(); 
      conn.release();

      logging.log('MySQL connection success!');
  } catch (err) {
      logging.error('MySQL connection has error:', err);
  }
}