import { PublisherSchema } from '@/utils/schemaManager';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.sendStatus(401);
    const token = authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err: any, data: any) => {
        if (err) return res.sendStatus(403);
        const user = {
            id: BigInt(data.id),
            username: data.username,
            email: data.email,
            role: data.role,
        };
        const publisher = PublisherSchema.parse(user);
        console.log("Authenticated user:", publisher);
        req.publisher = publisher;
        next();
    });
}