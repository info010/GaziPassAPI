import { Request, Response, NextFunction } from "express";
import { db } from "@/utils/db";
import { RowDataPacket } from "mysql2";

export function MySQLGet(tableName: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      try {
        const [rows] = await db.query<RowDataPacket[]>(
          `SELECT * FROM ${tableName} WHERE id = ? LIMIT 1`,
          [req.params.id]
        );

        if (rows.length > 0) {
          req.mysqlGet = rows[0];
        } else {
          return res.status(404).json({ error: "Not found" });
        }
      } catch (error) {
        console.error(error);
        return res.status(400).json(error);
      }

      return originalMethod.call(this, req, res, next);
    };

    return descriptor;
  };
}
