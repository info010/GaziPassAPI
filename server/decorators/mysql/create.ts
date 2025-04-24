import { Request, Response, NextFunction } from "express";
import { db } from "@/utils/db";
import { ResultSetHeader } from "mysql2";

export function MySQLCreate(table: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      try {
        const fields = Object.keys(req.body);
        const values = Object.values(req.body);

        const placeholders = fields.map(() => "?").join(", ");
        const sqlQuery = `INSERT INTO ${table} (${fields.join(", ")}) VALUES (${placeholders})`;

        const [result] = await db.query<ResultSetHeader>(sqlQuery, values);

        if (result.affectedRows > 0) {
          req.mysqlCreate = { ...req.body, id: result.insertId }; // Adding the ID of the newly created row
          return res.status(201).json(req.mysqlCreate);
        } else {
          return res.status(400).json({ error: "Failed to create record." });
        }
      } catch (error) {
        console.error("[MySQLCreate Error]:", error);
        return res.status(400).json(error);
      }

      return originalMethod.call(this, req, res, next);
    };

    return descriptor;
  };
}
