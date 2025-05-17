import { Request, Response, NextFunction } from 'express';
import { Controller } from '@/server/decorators/controller';
import { Route } from '@/server/decorators/route';
import jwt from 'jsonwebtoken';
import sql from "@/utils/sql";

const ACCESS = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH = process.env.REFRESH_TOKEN_SECRET!;

@Controller('/auth/refresh')
class RefreshController {

    @Route("get", "/")
    async login(req: Request, res: Response, next: NextFunction) {
        const cookies = req.cookies;
        if (!cookies?.jwt) {
            return res.sendStatus(401);
        }
        const refreshToken = cookies.jwt;
        
        jwt.verify(refreshToken, REFRESH, async (err: any, decoded: any) => {
            if (err) {
                return res.sendStatus(403);
            }
            const rows = await sql.queryOneWithColumns("auth_users", ["username", "email"], ["username", "email"],decoded.username ,decoded.email);
            if (rows.length === 0) {
                return res.sendStatus(403);
            }
            const user = { username: rows[0].username, email: rows[0].email };
            const accesToken = jwt.sign(user, ACCESS, { expiresIn: '30s' });
            return res.status(200).json({ accesToken: accesToken });
        });

    }

}

export default RefreshController;