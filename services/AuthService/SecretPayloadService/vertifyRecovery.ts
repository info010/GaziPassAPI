import { Request, Response, NextFunction } from "express";
import { db } from "@/utils/db";
import { RowDataPacket } from "mysql2";

export function VerifyRecovery() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      const { email, token } = req.body;

      if (!email || !token || typeof email !== "string" || typeof token !== "string") {
        return res.status(400).json({ error: "Missing or invalid email/token" });
      }

      try {
        const [record] = await db.query<RowDataPacket[]>(
            "SELECT * FROM secret_payloads WHERE email = ? LIMIT 1",
            [email]
        );
        
        if (!record[0]) {
            return res.status(400).json({ error: "Token is not exsist."});
        }    
        
        const isValid = record[0].token === token;
        const isExpire = record[0].expire_at < Date.now();

        if (!isValid) {
            return res.status(400).json({ error: "Token is not valid." })
        } else if (isExpire) {
            await db.query<RowDataPacket[]>(
                "DELETE FROM secret_payloads WHERE email = ?",
                [email]
            );
            return res.status(400).json({ error: "Token is expires." })
        } else {
            req.body = isValid && !isExpire;
            return originalMethod.call(this, req, res, next);
        }
        
      } catch (error) {
        console.error("[VerifyRecovery Error]:", error);
        return res.status(500).json({ error: "Recovery verification failed", detail: error });
      }
    };

    return descriptor;
  };
}


