import { AuthUser, recoveryPasswordSchema } from "@/utils/schemaManager";
import { findAuthUserByEmail, generateRecovery } from "@/services/DeprecatedServices/authService";
import { sendEmail } from "@/utils/sendEmail";
import { turnstileVertify } from "@/utils/crypt";

export async function POST(req: Request) {
    const { email, turnstileToken } = recoveryPasswordSchema.parse(await req.json())

    const turnstileRes = await turnstileVertify(turnstileToken);
    
    const result = await turnstileRes.json();
    if (!result.success) return Response.json({ error: "Turnstile failed" }, { status: 400 });

    const exsistUser = await findAuthUserByEmail(email) as AuthUser;
    if (!exsistUser) return Response.json({ error: "User is not exists!"}, { status: 400 });

    const user_id = exsistUser.id;
    const secret = await generateRecovery(email);

    const link = `${process.env.BASE_URL}/recovery/update?user_id=${user_id}&token=${secret}`;

    await sendEmail(email, "Password Recovery", `Click here to reset your password:\n${link}`);

    return Response.json({ success: true });
}