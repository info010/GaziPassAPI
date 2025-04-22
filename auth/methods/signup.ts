import { hashPassword } from "@/utils/bcrypt";
import { createUser, findUserByEmail} from "@/utils/authService"
import { signUpSchema } from "@/utils/schemaManager";

export async function POST(req: Request) {
  const { username, email, password, turnstileToken } = signUpSchema.parse(await req.json());

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

  const exsistUser = await findUserByEmail(email);
  if (exsistUser) return Response.json({ error: "Existing User by that Email"}, { status: 400});

  const hashedPassword = await hashPassword(password);

  await createUser(username, email, hashedPassword);

  return Response.json({ success: true });
}