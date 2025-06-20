import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import { CurrentUser } from "./schemaManager";

const SECRET = process.env.RECOVERY_SECRET!;
const ACCESS = process.env.ACCESS_TOKEN_SECRET!;

export const signJwt = (payload: object) =>
  jwt.sign(payload, SECRET, { expiresIn: "1h" });

export const verifyJwt = (token: string) =>
  jwt.verify(token, SECRET);

export const hashPassword = (pwd: string) => bcrypt.hashSync(pwd, 16);
export const comparePassword = (pwd: string, hash: string) =>  bcrypt.compareSync(pwd, hash);

export const generateSecretToken = () => {
    return randomBytes(64).toString('hex')
};

export function generateAccessToken(user: any) {
  return jwt.sign(user, ACCESS, { expiresIn: "15s" });
}

export const turnstileVertify = async (token: string) => {

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
    }),
  });

  return res;
}