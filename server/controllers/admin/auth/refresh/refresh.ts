import { Request, Response, NextFunction } from 'express';
import { Controller } from '@/server/decorators/controller';
import { Route } from '@/server/decorators/route';
import jwt from 'jsonwebtoken';
import sql from "@/utils/sql";

const ACCESS = process.env.ADMIN_ACCESS_TOKEN_SECRET!;
const REFRESH = process.env.ADMIN_REFRESH_TOKEN_SECRET!;

@Controller('/admin/auth/refresh')
class AdminRefreshController {

    @Route("get", "/")
    async refresh(req: Request, res: Response, next: NextFunction) {
        const cookies = req.cookies;
        if (!cookies?.jwt) {
            return res.sendStatus(401);
        }
        const refreshToken = cookies.jwt;
        
        jwt.verify(refreshToken, REFRESH, async (err: any, decoded: any) => {
            if (err) {
                return res.sendStatus(403);
            }
            const rows = await sql.queryOneWithColumns("admin_users", ["username", "email"], ["username", "email"],decoded.username ,decoded.email);
            if (rows.length === 0) {
                return res.sendStatus(403);
            }
            const user = { username: rows[0].username, email: rows[0].email };
            const accesToken = jwt.sign(user, ACCESS, { expiresIn: '30s' });
            return res.status(200).json({ accesToken: accesToken });
        });

    }

}

export default AdminRefreshController;