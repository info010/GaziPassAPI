import { Request, Response, NextFunction } from "express";
import { AuthUser } from "@/utils/schemaManager";
import { hashPassword, comparePassword } from "@/utils/crypt";

export function UpdateAuthUser() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      try {
        const id = req.params.id;
        const { oldPassword, newPassword } = req.body;

        if (!id || !oldPassword || !newPassword) {
          return res.status(400).json({ error: "Missing required fields." });
        }

        const rows = await sql.queryOneWithColumns("auth_users", ["password"], ["id"], id);

        const match = await comparePassword(oldPassword, rows[0].password);
        if (!match) {
          return res.status(401).json({ error: "Invalid password" });
        }

        const hashedPassword = await hashPassword(newPassword);

        const result = await sql.updateOne("auth_users", ["password"], [{id: id}], hashedPassword);

        if(result.affectedRows === 0) {
          return res.status(404).json({ error: "AuthUser not found" });
        }

        const authUser = await sql.queryOneWithColumns("auth_users", ["username", "email"], ["id"], id); 

        const updated: AuthUser = {
          id: BigInt(id),
          username: authUser[0].username,
          email: authUser[0].email,
          password: hashedPassword,
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
