import { Request, Response, NextFunction } from "express";
import { db } from "@/utils/db"; // Veritabanı bağlantın
import { RowDataPacket } from "mysql2";

export function MySQLUpdate(table: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      try {
        const { id } = req.params;
        const updateData = req.body;

        if (!id) {
          return res.status(400).json({ error: "Missing ID" });
        }

        const fields = Object.keys(updateData);
        const values = Object.values(updateData);

        if (fields.length === 0) {
          return res.status(400).json({ error: "No fields provided to update" });
        }

        const setClause = fields.map((field) => `${field} = ?`).join(", ");
        const query = `UPDATE ${table} SET ${setClause} WHERE id = ?`;

        await db.query(query, [...values, id]);

        const [rows] = await db.query<RowDataPacket[]>(`SELECT * FROM ${table} WHERE id = ? LIMIT 1`, [id]);

        if (!rows || rows.length === 0) {
          return res.status(404).json({ error: "Record not found after update" });
        }

        req.mysqlUpdate = rows[0];
      } catch (error) {
        console.error("[MySQLUpdate Error]:", error);
        return res.status(500).json({ error: "Update failed", detail: error });
      }

      return originalMethod.call(this, req, res, next);
    };

    return descriptor;
  };
}
