import { Request, Response, NextFunction } from "express";
import { AuthUser } from "@/utils/schemaManager";
import { Quark } from  "@thehadron/quark"
import sql from "@/utils/sql";
import { hashPassword } from "@/utils/crypt";

const quark = new Quark(1)

export function CreateAuthUser() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
          return res.status(400).json({ error: "Missing required fields." });
        }

        const existingUsers = await sql.queryOne("auth_users", ["email"], email);

        if (existingUsers.length > 0) {
          return res.status(409).json({ error: "Email already exists." });
        }

        const id = quark.generate();
        console.log("Generated ID:", id);
        const hashedPassword = hashPassword(password); 
        console.log("Hashed Password:", hashedPassword);

        const result = await sql.insertOne("auth_users", id, username, email, hashedPassword);  

        if (result.length === 0) {
          return res.status(400).json({ error: "Failed to create AuthUser." });
        }      
        
        const rows = await sql.insertOneWithColumns("users", ["id", "username", "email"], id, username, email);

        if (rows.length === 0) {
          return res.status(400).json({ error: "Failed to create User." });
        }  

        const authUser: AuthUser = {
          id,
          username,
          email,
          password: hashedPassword,
        };

        req.authUser = authUser;
      } catch (error) {
        console.error("[CreateAuthUser Error]:", error);
        return res.status(500).json({ error: "Internal server error" });
      }

      return originalMethod.call(this, req, res, next);
    };

    return descriptor;
  };
}
