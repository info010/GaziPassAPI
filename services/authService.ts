import { db } from "@/utils/db";
import Quark from "@hadron/quark/_dist/src"
import { AuthUser, SecretPayload } from "@/utils/schemaManager";
import { generateSecretToken } from "@/utils/crypt";
import { createUser } from "./userService";

const quark = new Quark(1);

export const findAuthUserByEmail = async (email: string) => {
  const [rows] = await db.query(
    "SELECT * FROM auth_users WHERE email = ? LIMIT 1",
    [email]
  );

  const auth_user: AuthUser = {
    id: rows[0].id,
    username: rows[0].username,
    email: rows[0].email,
    password: rows[0].password,
  };

  return auth_user;
};

export const findAuthUserById = async (id: bigint) => {
  const [rows] = await db.query(
    "SELECT * FROM auth_users WHERE id = ? LIMIT 1",
    [id]
  );

  const auth_user: AuthUser = {
    id: rows[0].id,
    username: rows[0].username,
    email: rows[0].email,
    password: rows[0].password,
  };

  return auth_user;
};

export const createAuthUser = async (
  username: string,
  email: string,
  password: string
) => {
  const id = quark.generate();
  const [rows] = await db.query(
    "INSERT INTO auth_users (id, username, email, password) VALUES ( ?, ?, ?, ?)",
    [id, username, email, password]
  );

  const auth_user: AuthUser = {
    id: rows[0].id,
    username: rows[0].username,
    email: rows[0].email,
    password: rows[0].password,
  };

  await createUser(auth_user.id, auth_user.username, auth_user.email);

  return auth_user;
};

export const updateAuthUser = async (id: bigint, email: string) => {
  const [rows] = await db.query(
    `UPDATE auth_users SET email= ? AND name = ? WHERE id = ?`,
    [id, email]
  );

  const auth_user: AuthUser = {
    id: rows[0].id,
    username: rows[0].username,
    email: rows[0].email,
    password: rows[0].password,
  };

  return auth_user;
};

export const updatePassoword = async (id: bigint, password: string) => {
  const [rows] = await db.query(
    `UPDATE auth_users SET password = ? WHERE id = ?`,
    [id, password]
  );

  const auth_user: AuthUser = {
    id: rows[0].id,
    username: rows[0].username,
    email: rows[0].email,
    password: rows[0].password,
  };

  return auth_user;
};

export const deleteAuthUser = async (id: bigint) => {
  const [result] = await db.query("DELETE FROM auth_users WHERE id = ?", [id]);
  return Boolean(!result[0]);
};

export const generateRecovery = async (email: string) => {
  const secret = generateSecretToken();

  const exists = (await db.query(
    "SELECT * FROM secret_payload WHERE email = ? LIMIT 1",
    [email]
  )) as SecretPayload | undefined;
  if (exists && exists.expires_at < Date.now() - 1000) return exists.token;

  const expire_at = Date.now() + 1000 * 60 * 5;
  const create_at = Date.now();

  const result = (await db.query(
    "INSERT INTO secret_payload ( email, secret, expire_at, create_at) VALUES ( ?, ?, ?, ?)",
    [email, secret, expire_at, create_at]
  )) as SecretPayload;
  return result.token;
};

export const verifyRecovery = async (
  email: string,
  secret: string
): Promise<boolean> => {
  const [record] = await db.query(
    "SELECT * FROM secret_payload WHERE email = ? LIMIT 1",
    [email]
  );

  if (!record[0]) return false;

  const isValid =
    record[0].token === secret && record[0].expires_at > Date.now();
  return isValid;
};
