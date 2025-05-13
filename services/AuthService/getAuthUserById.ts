import { Request, Response, NextFunction } from "express";
import { AuthUser } from "@/utils/schemaManager";

export function GetAuthUserByID() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      try {
        const id = req.params.id;

        const rows = await sql.queryOne("auth_users", ["id"], id);

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
        console.error("[GetAuthUserByID Error]:", error);
        return res.status(500).json({ error: "Failed to fetch auth user" });
      }

      return originalMethod.call(this, req, res, next);
    };

    return descriptor;
  };
}