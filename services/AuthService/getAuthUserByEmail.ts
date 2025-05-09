import e, { Request, Response, NextFunction } from "express";
import { db } from "@/utils/db";
import { RowDataPacket } from "mysql2";
import { AuthUser } from "@/utils/schemaManager";

export function GetAuthUserByEmail() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      try {
        const email = req.params.email;

        const [rows] = await db.query<RowDataPacket[]>(
          "SELECT * FROM auth_users WHERE email = ? LIMIT 1",
          [email]
        );

        if (!rows[0]) {
          return res.status(404).json({ error: "AuthUser not found" });
        }

        const auth_user: AuthUser = {
          id: rows[0].id,
          username: rows[0].username,
          email: rows[0].email,
          password: rows[0].password,
        };

        req.authUser = auth_user;
      } catch (error) {
        console.error("[GetAuthUserByEmail Error]:", error);
        return res.status(500).json({ error: "Failed to fetch auth user" });
      }

      return originalMethod.call(this, req, res, next);
    };

    return descriptor;
  };
}