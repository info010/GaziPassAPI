import { comparePassword, signJwt } from "@/utils/crypt";
import { findAuthUserByEmail } from "@/services/authService"
import { loginSchema } from "@/utils/schemaManager";

export async function POST(req: Request) {
  const { email, password, turnstileToken} = loginSchema.parse(await req.json());

  const turnstileRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: turnstileToken,
    }),
  });

  const result = await turnstileRes.json();
  if (!result.success) return Response.json({ error: "Turnstile failed" }, { status: 400 });

  const user = await findAuthUserByEmail(email)
  if (!user || !(await comparePassword(password, user.password))) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signJwt({ id: user.id, email: user.email });

  return Response.json({ token });
}