import e, { Request, Response, NextFunction } from 'express';
import { Controller } from '@/server/decorators/controller';
import { Route } from '@/server/decorators/route';
import jwt from 'jsonwebtoken';
import sql from "@/utils/sql";

const REFRESH = process.env.ADMIN_REFRESH_TOKEN_SECRET!;

@Controller('/admin/auth/logout')
class AdminLogoutController {

    @Route("get", "/")
    async logout(req: Request, res: Response, next: NextFunction) {
        const cookies = req.cookies;
        if (!cookies?.jwt) {
            return res.sendStatus(401);
        }
        const refreshToken = cookies.jwt;

        jwt.verify(refreshToken, REFRESH, async (err: any, decoded: any) => {
            if (err) {
                return res.sendStatus(403);
            }
            const rows = await sql.queryOneWithColumns("admin_users", ["username", "email"], ["username", "email"], decoded.username, decoded.email);
            if (rows.length === 0) {
                return res.sendStatus(403);
            }

            res.clearCookie("jwt", { httpOnly: true });
            return res.status(200).json({ message: "Logout successful" });
        });
    }
}        

export default AdminLogoutController;