import { comparePassword } from "@/utils/bcrypt";
import { findUserByEmail } from "@/utils/authService"
import { signJwt } from "@/utils/jwt";
import { loginSchema } from "@/utils/schemaManager";

export async function POST(req: Request) {
  const { email, password } = loginSchema.parse(await req.json());

  const user = await findUserByEmail(email)
  if (!user || !(await comparePassword(password, user.password))) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signJwt({ id: user.id, email: user.email });

  return Response.json({ token });
}
