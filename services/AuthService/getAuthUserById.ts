import { Request, Response, NextFunction } from "express";
import { db } from "@/utils/db";
import { RowDataPacket } from "mysql2";
import { AuthUser } from "@/utils/schemaManager";

export function GetAuthUserByID() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      try {
        const id = req.params.id;

        const [rows] = await db.query<RowDataPacket[]>(
          "SELECT * FROM auth_users WHERE id = ? LIMIT 1",
          [id]
        );

        const row = rows[0];

        if (!row) {
          return res.status(404).json({ error: "AuthUser not found" });
        }

        const auth_user: AuthUser = {
          id: row.id,
          username: row.username,
          email: row.email,
          password: row.password,
        };

        req.authUser = auth_user;
      } catch (error) {
        console.error("[GetAuthUserByID Error]:", error);
        return res.status(500).json({ error: "Failed to fetch auth user" });
      }

      return originalMethod.call(this, req, res, next);
    };

    return descriptor;
  };
}