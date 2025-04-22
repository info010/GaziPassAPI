import { AuthUser, recoveryUpdateSchema } from "@/utils/schemaManager";
import { findUserById, updateUser, verifyRecovery } from "@/utils/authService";
import { hashPassword } from "@/utils/crypt";

export async function POST(req: Request) {
    const { password , repassword, url, turnstileToken } = recoveryUpdateSchema.parse(await req.json())

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

    if (password !== repassword) return Response.json({ error: "Password's is not equal!"}, { status: 400 });

    const parsedUrl = new URL(url);
    const user_id = BigInt(parsedUrl.searchParams.get("user_id"));
    const secret = parsedUrl.searchParams.get("secret");

    const user = await findUserById(user_id) as AuthUser;
    if (!user) return Response.json({ error: "User is not exists!"}, { status: 400 });

    const isValid = await verifyRecovery( user.email, secret);    
    if (!isValid) return Response.json({ error: "Vertify is not valid!"}, { status: 400 });

    const hashedPassword = await hashPassword(password);

    await updateUser( user.id, user.email, hashedPassword);

    return Response.json({ success: true });
}