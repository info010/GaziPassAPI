import { hashPassword, turnstileVertify } from "@/utils/crypt";
import { createAuthUser, findAuthUserByEmail} from "@/services/DeprecatedServices/authService"
import { signUpSchema } from "@/utils/schemaManager";

export async function POST(req: Request) {
  const { username, email, password, repassword, turnstileToken } = signUpSchema.parse(await req.json());

  const turnstileRes = await turnstileVertify(turnstileToken);

  const result = await turnstileRes.json();
  if (!result.success) return Response.json({ error: "User is not exists!"}, { status: 400 });

  if (password !== repassword) return Response.json({ error: "Password's is not equal!"}, { status: 400 });

  const exsistUser = await findAuthUserByEmail(email);
  if (exsistUser) return Response.json({ error: "Email is used"}, { status: 400});

  const hashedPassword = await hashPassword(password);

  await createAuthUser(username, email, hashedPassword);

  return Response.json({ success: true });
}