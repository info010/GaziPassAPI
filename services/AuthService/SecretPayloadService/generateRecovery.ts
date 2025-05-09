import { Request, Response, NextFunction } from "express";
import { db } from "@/utils/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { generateSecretToken } from "@/utils/crypt";
import { SecretPayload } from "@/utils/schemaManager";

export function GenerateRecovery() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      try {
        const email = req.body.email;
        if (!email || typeof email !== "string") {
          return res.status(400).json({ error: "Invalid or missing email." });
        }

        const token = generateSecretToken();

        const [rows] = await db.query<RowDataPacket[]>(
          "SELECT * FROM secret_payloads WHERE email = ? LIMIT 1",
          [email]
        );

        if (rows[0]) {
          await db.query<ResultSetHeader>(
            "DELETE FROM secret_payloads WHERE email = ?",
            [email]
          )
        }

        const expire_at = BigInt(Date.now() + 1000 * 60 * 5);

        await db.query<ResultSetHeader>(
          "INSERT INTO secret_payloads (email, token, expire_at) VALUES (?, ?, ?)",
          [email, token, expire_at]
        );

        const secretPayload: SecretPayload = {
          email,
          token,
          expire_at
        }

        req.secretPayload = secretPayload

        return originalMethod.call(this, req, res, next);
      } catch (error) {
        console.error("[GenerateRecovery Error]:", error);
        return res.status(500).json({ error: "Recovery generation failed", detail: error });
      }
    };

    return descriptor;
  };
}
