import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import {
  queryOneWithColumns,
  queryOne,
  insertOneWithColumns,
  insertOne,
} from "@/utils/sql";
import { comparePassword, generateAccessToken } from "@/utils/crypt";
import { hashPassword } from "@/utils/crypt";
import { Quark } from "@thehadron/quark";
import { sendEmail } from "@/utils/sendEmail";
import { VerifyPayloadSchema } from "@/utils/schemaManager";

const quark = new Quark(1);

const REFRESH = process.env.REFRESH_TOKEN_SECRET!;

const VERIFY = process.env.VERIFY_TOKEN_SECRET!;

const refreshTokens: Array<string> = [];

export async function login(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const row = await queryOneWithColumns(
    "auth_users",
    ["password"],
    ["email"],
    email
  );
  if (row.length === 0) {
    return res.status(401).json({ error: "Invalid email" });
  }

  const match = comparePassword(password, row[0].password);

  if (!match) {
    return res.status(401).json({ error: "Invalid password" });
  }

  const rows = await queryOne("users", ["email"], email);

  const user = {
    id: rows[0].id,
    username: rows[0].username,
    email: rows[0].email,
    role: rows[0].role,
    ip: req.ip,
  };

  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(user, REFRESH, { expiresIn: "1d" });

  refreshTokens.push(refreshToken);

  res.status(200).json({ accessToken: accessToken , refreshToken: refreshToken});
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

    const hashedPassword = hashPassword(password);

    const veriyPayload = VerifyPayloadSchema.parse({
      username,
      email,
      password: hashedPassword,
    });

    const uniqueJwt = jwt.sign(veriyPayload, VERIFY, { expiresIn: "6h" });

    const message = `<p>Verify your email adress to complete the signup into your account.
      </p><p>This link expires in 6 hours</b>.<p></p>Press <a href=
      ${
        process.env.BASE_URL + "/auth/verify/" + uniqueJwt
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
  uniqueJwt: string,
  req: Request,
  res: Response,
  next: NextFunction
) {
  jwt.verify(uniqueJwt, VERIFY, async (err: any, data: any) => {
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

    const userId = quark.generate();

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

    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(user, REFRESH, { expiresIn: "1d" });

    refreshTokens.push(refreshToken);

    res.status(200).json({ accessToken: accessToken , refreshToken: refreshToken});
  });
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  const { refreshToken } = req.body;

  if(!refreshTokens.includes(refreshToken)) return res.status(404).json({ error : "RefreshToken is not valid." })

  jwt.verify(refreshToken, REFRESH, async (err: any, decoded: any) => {
    if (err || decoded.ip !== req.ip) {
      return res.sendStatus(403);
    }

    const user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
      ip: req.ip,
    };

    const accessToken = generateAccessToken(user);
    res.status(200).json({ accessToken: accessToken });
  });
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  const { refreshToken } = req.body;

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

    const index = refreshTokens.indexOf(refreshToken);
    refreshTokens.splice(index, 1);

    res.status(200).json({ message: "Logout successful" });
  });
}
