import { CurrentUserSchema, PublisherSchema } from "@/utils/schemaManager";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = req.cookies.jwt;

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!, async (err: any, data: any) => {
    if (err || data.ip !== req.ip) {
      return res.status(403).json({ error: "Forbidden" }); 
    }

    const user = {
      id: BigInt(data.id),
      username: data.username,
      email: data.email,
      role: data.role,
      ip: data.ip
    };
    
    const currentUser = CurrentUserSchema.parse(user);
    req.currentUser = currentUser;
    next();
  });
}
