import { CurrentUserSchema } from "@/utils/schemaManager";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET!,
    async (err: any, data: any) => {
      if (err || data.ip !== req.ip) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const user = {
        id: BigInt(data.id),
        username: data.username,
        email: data.email,
        role: data.role,
        ip: data.ip,
      };

      try {
        const currentUser = CurrentUserSchema.parse(user);

        req.currentUser = currentUser;
        next();
      } catch (err) {
        return res.status(400).json({ error: "Invalid user payload" , detail: err});
      }
    }
  );
}
