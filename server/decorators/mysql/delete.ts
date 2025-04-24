import { Request, Response, NextFunction } from "express";
import { db } from "@/utils/db";

export function MySQLDelete(table: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      try {
        const id = req.params.id;

        if (!id) {
          return res.status(400).json({ error: "Missing ID parameter." });
        }

        const [result] = await db.query(`DELETE FROM ${table} WHERE id = ?`, [id]);

        if ((result as any).affectedRows === 0) {
          return res.sendStatus(404);
        }
      } catch (error) {
        console.error("[MySQLDelete Error]:", error);
        return res.status(400).json(error);
      }

      return originalMethod.call(this, req, res, next);
    };

    return descriptor;
  };
}
