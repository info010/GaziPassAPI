import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { queryOneWithColumns, queryOne, insertOneWithColumns, insertOne } from "@/utils/sql";
import { comparePassword } from "@/utils/crypt";
import { hashPassword } from "@/utils/crypt";
import { Quark } from "@thehadron/quark";

const quark = new Quark(1);

const ACCESS = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH = process.env.REFRESH_TOKEN_SECRET!;

export async function login(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const row = await queryOneWithColumns(
    "auth_users",
    ["password"],
    ["email"],
    email
  );
  if (row.length === 0) {
    return res.status(401).json({ message: "Invalid email" });
  }

  const match = comparePassword(password, row[0].password);

  if (!match) {
    return res.status(401).json({ message: "Invalid password" });
  }

  const rows = await queryOne("users", ["email"], email);

  const user = {
    id: rows[0].id,
    username: rows[0].username,
    email: rows[0].email,
    role: rows[0].role,
  };

  const accesToken = jwt.sign(user, ACCESS, { expiresIn: "30s" });
  const refreshToken = jwt.sign(user, REFRESH, { expiresIn: "1d" });

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.status(200).json({ accesToken: accesToken, refreshToken: refreshToken });
}
 
export async function register(req: Request, res: Response, next: NextFunction) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const existingUsers = await queryOne("auth_users", ["email"], email);

  if (existingUsers.length > 0) {
    return res.status(409).json({ error: "Email already exists." });
  }

  const id = quark.generate();
  const hashedPassword = hashPassword(password);

  const result = await insertOne(
    "auth_users",
    id,
    username,
    email,
    hashedPassword
  );

  if (result.length === 0) {
    return res.status(400).json({ error: "Failed to create AuthUser." });
  }

  const rows = await insertOneWithColumns(
    "users",
    ["id", "username", "email"],
    id,
    username,
    email
  );

  if (rows.length === 0) {
    return res.status(400).json({ error: "Failed to create User." });
  }

  const user = {
    id: rows[0].id,
    username: rows[0].username,
    email: rows[0].email,
    role: rows[0].role,
  };

  const accesToken = jwt.sign(user, ACCESS, { expiresIn: "30s" });
  const refreshToken = jwt.sign(user, REFRESH, { expiresIn: "1d" });

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.status(200).json({ accesToken: accesToken, refreshToken: refreshToken });
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.sendStatus(401);
  }
  const refreshToken = cookies.jwt;

  jwt.verify(refreshToken, REFRESH, async (err: any, decoded: any) => {
    if (err) {
      return res.sendStatus(403);
    }

    const rows = await queryOne("users", ["id"], decoded.id);

    const user = {
      id: rows[0].id,
      username: rows[0].username,
      email: rows[0].email,
      role: rows[0].role,
    };

    const accesToken = jwt.sign(user, ACCESS, { expiresIn: "30s" });
    res.status(200).json({ accesToken: accesToken });
  });
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.sendStatus(401);
  }
  const refreshToken = cookies.jwt;

  jwt.verify(refreshToken, REFRESH, async (err: any, decoded: any) => {
    if (err) {
      return res.sendStatus(403);
    }
    const rows = await queryOneWithColumns(
      "users",
      ["id", "username", "email"],
      decoded.id,
      decoded.username,
      decoded.email
    );
    if (rows.length === 0) {
      return res.sendStatus(403);
    }

    res.clearCookie("jwt", { httpOnly: true });
    res.status(200).json({ message: "Logout successful" });
  });
}
