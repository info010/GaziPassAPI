import { hash, compare } from "bcryptjs"
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_AUTH_SECRET!;

export const signJwt = (payload: object) =>
  jwt.sign(payload, SECRET, { expiresIn: "1h" });

export const verifyJwt = (token: string) =>
  jwt.verify(token, SECRET);

export const hashPassword = (pwd: string) => hash(pwd, 32);
export const comparePassword = (pwd: string, hash: string) => compare(pwd, hash);

export const generateSecretToken = () => {
    return randomBytes(64).toString('hex')
};

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