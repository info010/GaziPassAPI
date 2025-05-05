import { AuthUser, recoveryUpdateSchema } from "@/utils/schemaManager";
import { findAuthUserById, updateAuthUser, verifyRecovery } from "@/services/authService";
import { hashPassword, turnstileVertify } from "@/utils/crypt";

export async function POST(req: Request) {
    const { password , repassword, url, turnstileToken } = recoveryUpdateSchema.parse(await req.json())

    const turnstileRes = await turnstileVertify(turnstileToken);

    const result = await turnstileRes.json();
    if (!result.success) return Response.json({ error: "Turnstile failed" }, { status: 400 });

    if (password !== repassword) return Response.json({ error: "Password's is not equal!"}, { status: 400 });

    const parsedUrl = new URL(url);
    
    const userIdParam = parsedUrl.searchParams.get("user_id");
    if (!userIdParam) return Response.json({ error: "Missing user_id in URL!"}, { status: 400 });
    const user_id = BigInt(userIdParam);

    const secret = parsedUrl.searchParams.get("secret");
    if (!secret) return Response.json({ error: "Missing secret in URL!"}, { status: 400 });

    const user = await findAuthUserById(user_id) as AuthUser;
    if (!user) return Response.json({ error: "User is not exists!"}, { status: 400 });

    const isValid = await verifyRecovery( user.email, secret);    
    if (!isValid) return Response.json({ error: "Vertify is not valid!"}, { status: 400 });

    const hashedPassword = await hashPassword(password);

    await updateAuthUser( user.id, user.email, user.username, hashedPassword);

    return Response.json({ success: true });
}