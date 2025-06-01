import { Request, Response, NextFunction } from "express";
import { Controller } from "@/server/decorators/controller";
import { Route } from "@/server/decorators/route";
import jwt from "jsonwebtoken";
import sql from "@/utils/sql";
import { hashPassword } from "@/utils/crypt";
import { Quark } from "@thehadron/quark";
import { PublisherSchema } from "@/utils/schemaManager";

const quark = new Quark(1);

const ACCESS = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH = process.env.REFRESH_TOKEN_SECRET!;

@Controller("/auth/register")
class RegisterController {
  @Route("post", "/")
  async register(req: Request, res: Response, next: NextFunction) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const existingUsers = await sql.queryOne("auth_users", ["email"], email);

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: "Email already exists." });
    }

    const id = quark.generate();
    const hashedPassword = hashPassword(password);

    const result = await sql.insertOne(
      "auth_users",
      id,
      username,
      email,
      hashedPassword
    );

    if (result.length === 0) {
      return res.status(400).json({ error: "Failed to create AuthUser." });
    }

    const rows = await sql.insertOneWithColumns(
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
    return res
      .status(200)
      .json({ accesToken: accesToken, refreshToken: refreshToken });
  }
}

export default RegisterController;
