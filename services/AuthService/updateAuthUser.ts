import { Request, Response, NextFunction } from "express";
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

        const result = await sql.updateOne("auth_users", ["username", "email", "password"], [{id: id}], username, email, password);

        if(result.affectedRows === 0) {
          return res.status(404).json({ error: "AuthUser not found" });
        }

        const updated: AuthUser = {
          id: BigInt(id),
          username,
          email,
          password,
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
