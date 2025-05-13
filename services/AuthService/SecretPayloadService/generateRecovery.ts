import { Request, Response, NextFunction } from "express";
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

        const rows = await sql.queryOne("secret_payloads", ["email"], email);

        if (rows[0]) {
          await sql.deleteOne("secret_payloads", ["email"], email);
        }

        const token = generateSecretToken();
        const expire_at = BigInt(Date.now() + 1000 * 60 * 5);

        const result = await sql.insertOne("secret_payloads", email, token, expire_at);

        if (result.length === 0) {
          return res.status(500).json({ error: "Failed to create secret payload." });
        }

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
