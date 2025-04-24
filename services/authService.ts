import { db } from "@/utils/db";
import Quark from "@hadron/quark/_dist/src";
import { AuthUser, SecretPayload } from "@/utils/schemaManager";
import { generateSecretToken } from "@/utils/crypt";
import { createUser } from "./userService";
import { RowDataPacket, ResultSetHeader } from "mysql2";

const quark = new Quark(1);

export const findAuthUserByEmail = async (email: string) => {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT * FROM auth_users WHERE email = ? LIMIT 1",
    [email]
  );

  const row = rows[0];
  if (!row) return null;

  const auth_user: AuthUser = {
    id: BigInt(row.id),
    username: row.username,
    email: row.email,
    password: row.password,
  };

  return auth_user;
};

export const findAuthUserById = async (id: bigint) => {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT * FROM auth_users WHERE id = ? LIMIT 1",
    [id]
  );

  const row = rows[0];
  if (!row) return null;

  const auth_user: AuthUser = {
    id: BigInt(row.id),
    username: row.username,
    email: row.email,
    password: row.password,
  };

  return auth_user;
};

export const createAuthUser = async (
  username: string,
  email: string,
  password: string
) => {
  const id = quark.generate();

  await db.query<ResultSetHeader>(
    "INSERT INTO auth_users (id, username, email, password) VALUES (?, ?, ?, ?)",
    [id, username, email, password]
  );

  await createUser(id, username, email);

  const auth_user: AuthUser = {
    id: BigInt(id),
    username,
    email,
    password,
  };

  return auth_user;
};

export const updateAuthUser = async (id: bigint, email: string, username: string) => {
  await db.query<ResultSetHeader>(
    `UPDATE auth_users SET email = ?, username = ? WHERE id = ?`,
    [email, username, id]
  );

  const updatedUser = await findAuthUserById(id);
  return updatedUser;
};

export const updatePassword = async (id: bigint, password: string) => {
  await db.query<ResultSetHeader>(
    `UPDATE auth_users SET password = ? WHERE id = ?`,
    [password, id]
  );

  const updated = await findAuthUserById(id);
  return updated;
};

export const deleteAuthUser = async (id: bigint) => {
  const [result] = await db.query<ResultSetHeader>(
    "DELETE FROM auth_users WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
};

export const generateRecovery = async (email: string) => {
  const secret = generateSecretToken();

  const [exists] = await db.query<RowDataPacket[]>(
    "SELECT * FROM secret_payloads WHERE email = ? LIMIT 1",
    [email]
  );

  if (exists[0] && BigInt(exists[0].expires_at) > BigInt(Date.now())) {
    return exists[0].token;
  }

  const expire_at = Date.now() + 1000 * 60 * 5;
  const create_at = Date.now();

  await db.query<ResultSetHeader>(
    "INSERT INTO secret_payloads (email, token, expire_at, create_at) VALUES (?, ?, ?, ?)",
    [email, secret, expire_at, create_at]
  );

  return secret;
};

export const verifyRecovery = async (
  email: string,
  secret: string
): Promise<boolean> => {
  const [record] = await db.query<RowDataPacket[]>(
    "SELECT * FROM secret_payloads WHERE email = ? LIMIT 1",
    [email]
  );

  if (!record[0]) return false;

  const isValid =
    record[0].token === secret && BigInt(record[0].expires_at) > BigInt(Date.now());

  return isValid;
};
