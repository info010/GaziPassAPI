import { Request, Response, NextFunction } from "express";
import { db } from "@/utils/db";
import { ResultSetHeader } from "mysql2";

export function DeleteAuthUser() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      try {
        const id = req.params.id;

        if (!id) {
          return res.status(400).json({ error: "Missing ID parameter." });
        }

        //TODO user tablelardan tüm verileri sil, sadece user siliniyor oe

        const [result] = await db.query<ResultSetHeader>(
          "DELETE FROM users WHERE id = ?",
          [id]
        ); 

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "User not found" });
        }

        const [result_2] = await db.query<ResultSetHeader>(
          "DELETE FROM auth_users WHERE id = ?",
          [id]
        );

        if (result_2.affectedRows === 0) {
          return res.status(404).json({ error: "AuthUser not found" });
        }

        req.body = result.affectedRows > 0;
      } catch (error) {
        console.error("[DeleteAuthUser Error]:", error);
        return res.status(500).json({ error: "Delete failed", detail: error });
      }

      return originalMethod.call(this, req, res, next);
    };

    return descriptor;
  };
}
