import { Request, Response, NextFunction } from "express";
import { db } from "@/utils/db";
import { RowDataPacket } from "mysql2";

export function MySQLQuery(table: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      try {
        const filters = req.body;

        let whereClause = "";
        const values: any[] = [];

        if (filters && Object.keys(filters).length > 0) {
          whereClause =
            "WHERE " +
            Object.entries(filters)
              .map(([key, _]) => {
                values.push(filters[key]);
                return `${key} = ?`;
              })
              .join(" AND ");
        }

        const query = `SELECT * FROM ${table} ${whereClause}`;
        const [rows] = await db.query<RowDataPacket[]>(query, values);

        req.mysqlQuery = rows;
      } catch (error) {
        console.error("[MySQLQuery Error]:", error);
        return res.status(400).json(error);
      }

      return originalMethod.call(this, req, res, next);
    };

    return descriptor;
  };
}
