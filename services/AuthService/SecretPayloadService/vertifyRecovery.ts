import { Request, Response, NextFunction } from "express";

export function VerifyRecovery() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      try {
        const { email, token } = req.body;

        if (!email || !token || typeof email !== "string" || typeof token !== "string") {
          return res.status(400).json({ error: "Missing or invalid email/token" });
        }

        const record = await sql.queryOne("secret_payloads", ["email", "token"], email, token);
        
        if (!record[0]) {
            return res.status(400).json({ error: "Token is not exsist."});
        }

        const isExpire = record[0].expire_at < Date.now();

        if (isExpire) {
            await sql.deleteOne("secret_payloads", ["email", "token"], email, token);
            return res.status(400).json({ error: "Token is expires." });
        } else {
            req.body = !isExpire;
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


