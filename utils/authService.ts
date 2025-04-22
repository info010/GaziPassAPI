import { db } from './db';
import { Quark } from "@thehadron/quark"
import { AuthUser } from "@/utils/schemaManager"

const quark = new Quark(1);

export const findUserByEmail = async (email: string) => {
  const [rows] = await db.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
  return rows as AuthUser;
};

export const findUserById = async (id: number) => {
  const [rows] = await db.query("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
  return rows as AuthUser;
};

export const createUser = async (username: string, email: string, password: string) => {
  const id = quark.generate()
  const result = await db.query("INSERT INTO users (id, username, email, password) VALUES ( ?, ?, ?, ?)", [ id, username, email, password]);
  return result as AuthUser;
};

export const updateUser = async (id: number, email: string, password: string) => {
  const [result] = await db.query(`UPDATE users SET email= ? AND name = ? WHERE id = ?`, [ id, email, password]);
  return result as AuthUser;
};

export const deleteUser = async (id: number) => {
  const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);
  return result as AuthUser;
};