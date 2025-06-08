import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import {
  queryOneWithColumns,
  queryOne,
  insertOneWithColumns,
  insertOne,
} from "@/utils/sql";
import { comparePassword } from "@/utils/crypt";
import { hashPassword } from "@/utils/crypt";
import { Quark } from "@thehadron/quark";
import { sendEmail } from "@/utils/sendEmail";
import { VerifyPayload, VerifyPayloadSchema } from "@/utils/schemaManager";

const quark = new Quark(1);

const ACCESS = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH = process.env.REFRESH_TOKEN_SECRET!;

const VERIFY = process.env.VERIFY_TOKEN_SECRET!;

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
    ip: req.ip,
  };

  const accesToken = jwt.sign(user, ACCESS, { expiresIn: "30s" });
  const refreshToken = jwt.sign(user, REFRESH, { expiresIn: "1d" });

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.status(200).json({ accesToken: accesToken, refreshToken: refreshToken });
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
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

    const veriyPayload = VerifyPayloadSchema.parse({
      username,
      email,
      password: hashedPassword,
    });

    const uniqeJwt = jwt.sign(veriyPayload, VERIFY, { expiresIn: "6h" });

    const message = `<p>Verify your email adress to complete the signup into your account.
      </p><p>This link expires in 6 hours</b>.<p></p>Press <a href=
      ${
        process.env.BASE_URL + "/auth/verify/" + id + "/" + uniqeJwt
      }>here</a> to proceed.</p>`;

    await sendEmail(email, "Verify your email", message);

    res
      .status(200)
      .json({ status: "PENDING", message: "Verification email sent." });
  } catch (error) {
    console.error("[Register Error]:", error);
    return res.status(500).json({ error: "Failed to registration" });
  }
}

export async function verify(
  userId: bigint,
  uniqeJwt: string,
  req: Request,
  res: Response,
  next: NextFunction
) {
  jwt.verify(uniqeJwt, VERIFY, async (err: any, data: any) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (!data.email || !data.username || !data.password) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const existingUsers = await queryOne("auth_users", ["email"], data.email);

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: "Email already exists." });
    }

    const result = await insertOne(
      "auth_users",
      userId,
      data.username,
      data.email,
      data.password
    );

    if (result.length === 0) {
      return res.status(400).json({ error: "Failed to create AuthUser." });
    }

    const insertResult = await insertOneWithColumns(
      "users",
      ["id", "username", "email"],
      userId,
      data.username,
      data.email
    );

    if (insertResult.length === 0) {
      return res.status(400).json({ error: "Failed to create User." });
    }

    const userRows = await queryOne("users", ["id"], userId);

    if (userRows.length === 0) {
      return res.status(400).json({ error: "Failed to fetch created User." });
    }

    const user = {
      id: userRows[0].id,
      username: userRows[0].username,
      email: userRows[0].email,
      role: userRows[0].role,
      ip: req.ip,
    };

    const accesToken = jwt.sign(user, ACCESS, { expiresIn: "30s" });
    const refreshToken = jwt.sign(user, REFRESH, { expiresIn: "1d" });

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res
      .status(200)
      .json({ accesToken: accesToken, refreshToken: refreshToken });
  });
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.sendStatus(401);
  }
  const refreshToken = cookies.jwt;

  jwt.verify(refreshToken, REFRESH, async (err: any, decoded: any) => {
    if (err || decoded.ip !== req.ip) {
      return res.sendStatus(403);
    }

    const rows = await queryOne("users", ["id"], decoded.id);

    const user = {
      id: rows[0].id,
      username: rows[0].username,
      email: rows[0].email,
      role: rows[0].role,
      ip: req.ip,
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
    if (err || decoded.ip !== req.ip) {
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
