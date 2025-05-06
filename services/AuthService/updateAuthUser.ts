import { Request, Response, NextFunction } from "express";
import { db } from "@/utils/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { AuthUser } from "@/utils/schemaManager";

export function UpdateAuthUser() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      try {
        const id = req.params.id;
        const { email, username, password } = req.body;

        if (!id || !email || !username || !password) {
          return res.status(400).json({ error: "Missing required fields." });
        }

        await db.query<ResultSetHeader>(
          `UPDATE auth_users SET email = ?, username = ?, password = ? WHERE id = ?`,
          [email, username, password, id]
        );

        const [rows] = await db.query<RowDataPacket[]>(
          `SELECT * FROM auth_users WHERE id = ? LIMIT 1`,
          [id]
        );

        if (!rows || rows.length === 0) {
          return res.status(404).json({ error: "User not found after update" });
        }

        const updated: AuthUser = {
          id: rows[0].id,
          username: rows[0].username,
          email: rows[0].email,
          password: rows[0].password,
        };

        req.authUser = updated;
      } catch (error) {
        console.error("[UpdateAuthUser Error]:", error);
        return res.status(500).json({ error: "Update failed", detail: error });
      }

      return originalMethod.call(this, req, res, next);
    };

    return descriptor;
  };
}
