import { Request, Response, NextFunction } from "express";
import { db } from "@/utils/db";
import { RowDataPacket } from "mysql2";

export function MySQLGetAll(tableName: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      try {
        const [rows] = await db.query<RowDataPacket[]>(`SELECT * FROM ${tableName}`);
        req.mysqlGetAll = rows;
      } catch (error) {
        console.error(error);
        return res.status(400).json({ error: "Failed to fetch data from MySQL" });
      }

      return originalMethod.call(this, req, res, next);
    };

    return descriptor;
  };
}
