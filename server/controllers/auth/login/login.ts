import { Request, Response, NextFunction } from 'express';
import { Controller } from '@/server/decorators/controller';
import { Route } from '@/server/decorators/route';
import jwt from 'jsonwebtoken';
import sql from "@/utils/sql";
import { comparePassword, hashPassword } from '@/utils/crypt';

const ACCESS = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH = process.env.REFRESH_TOKEN_SECRET!;

@Controller('/auth/login')
class LoginController {

    @Route("post", "/")
    async login(req: Request, res: Response, next: NextFunction) {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const rows = await sql.queryOneWithColumns("auth_users", ["username", "email", "password"], ["email"] , email);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email' });
        }

        const match = comparePassword(password, rows[0].password);

        if (!match) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const user = { username: rows[0].username, email: rows[0].email };

        const accesToken = jwt.sign(user, ACCESS, { expiresIn: '30s' });
        const refreshToken = jwt.sign(user, REFRESH, { expiresIn: '1d' });

        res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        return res.status(200).json({ accesToken: accesToken ,refreshToken: refreshToken });
    }

}

export default LoginController;