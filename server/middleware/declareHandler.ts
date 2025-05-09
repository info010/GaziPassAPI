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
      authUser?: AuthUser | undefined;
      user?: User | undefined;
      publisher?: Publisher | undefined;
      secretPayload?: SecretPayload | undefined;
      post?: Post | undefined;      
    }
  }
}

export function declareHandler(req: Request, res: Response, next: NextFunction) {
    req.mysqlGet = undefined;
    req.mysqlGetAll = [];
    req.mysqlCreate = undefined;
    req.mysqlUpdate = undefined;
    req.mysqlQuery = [];
    req.authUser = undefined;
    req.publisher = undefined;
    req.secretPayload = undefined;

    next()    
}