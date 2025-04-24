import { AuthUser, Publisher, Post, User, SecretPayload } from "@/utils/schemaManager";
import { Request, Response, NextFunction } from "express";
import type { RowDataPacket } from "mysql2";

declare global {
  namespace Express {
    interface Request {
      mysqlGet?: RowDataPacket | undefined;
      mysqlGetAll?: RowDataPacket[];
      mysqlCreate?: RowDataPacket | undefined;
      mysqlUpdate?: RowDataPacket | undefined;
      mysqlQuery?: RowDataPacket[];
    }
  }
}

export function declareHandler(req: Request, res: Response, next: NextFunction) {
    req.mysqlGet = undefined;
    req.mysqlGetAll = [];
    req.mysqlCreate = undefined;
    req.mysqlUpdate = undefined;
    req.mysqlQuery = [];

    next()    
}