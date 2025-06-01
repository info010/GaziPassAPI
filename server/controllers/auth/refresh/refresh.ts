import { Request, Response, NextFunction } from 'express';
import { Controller } from '@/server/decorators/controller';
import { Route } from '@/server/decorators/route';
import jwt from 'jsonwebtoken';
import sql from "@/utils/sql";
import { PublisherSchema } from '@/utils/schemaManager';

const ACCESS = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH = process.env.REFRESH_TOKEN_SECRET!;

@Controller('/auth/refresh')
class RefreshController {

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

            const rows = await sql.queryOne("users", ["id"] , decoded.id);

            const user = {
                id: rows[0].id,
                username: rows[0].username,
                email: rows[0].email,
                role: rows[0].role,
            };

            const accesToken = jwt.sign(user, ACCESS, { expiresIn: '30s' });
            return res.status(200).json({ accesToken: accesToken });
        });

    }

}

export default RefreshController;