import { lepton } from '@thehadron/lepton';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.sendStatus(401);
    const token = authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err: any, data: any) => {
        if (err) return res.sendStatus(403);
        const validate = lepton.object({
            username: lepton.string(),
            email: lepton.string()
        }).strict();
        const user = validate.parse(data);
        req.body = user;
        next();
    });
}