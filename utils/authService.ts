import { db } from './db';
import { Quark } from "@thehadron/quark"
import { AuthUser, SecretPayload } from "@/utils/schemaManager"
import { generateSecretToken } from './crypt';

const quark = new Quark(1);

export const findUserByEmail = async (email: string) => {
  const [rows] = await db.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
  return rows as AuthUser;
};

export const findUserById = async (id: bigint) => {
  const [rows] = await db.query("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
  return rows as AuthUser;
};

export const createUser = async (username: string, email: string, password: string) => {
  const id = quark.generate()
  const result = await db.query("INSERT INTO users (id, username, email, password) VALUES ( ?, ?, ?, ?)", [ id, username, email, password]);
  return result as AuthUser;
};

export const updateUser = async (id: bigint, email: string, password: string) => {
  const [result] = await db.query(`UPDATE users SET email= ? AND name = ? WHERE id = ?`, [ id, email, password]);
  return result as AuthUser;
};

export const deleteUser = async (id: number) => {
  const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);
  return result as AuthUser;
};

export const generateRecovery = async (email: string) => {
  const secret = generateSecretToken();
  
  const exists = await db.query("SELECT * FROM secret_payload WHERE email = ? LIMIT 1", [email]) as SecretPayload | undefined;
  if(exists && exists.expires_at < Date.now() - 1000) return exists.token;

  const expire_at = Date.now() + 1000*60*5;
  const create_at = Date.now();

  const result = await db.query("INSERT INTO secret_payload ( email, secret, expire_at, create_at) VALUES ( ?, ?, ?, ?)", [ email, secret, expire_at, create_at]) as SecretPayload;
  return result.token;
}

export const verifyRecovery = async (email: string, secret: string): Promise<boolean> => {
  const record = await db.query("SELECT * FROM secret_payload WHERE email = ? LIMIT 1", [email]) as SecretPayload | undefined;

  if (!record) return false;

  const isValid = record.token === secret && record.expires_at > Date.now();
  return isValid;
};