import { Request, Response, NextFunction } from 'express';
import { Controller } from '@/server/decorators/controller';
import { Route } from '@/server/decorators/route';
import { login, refresh, register ,logout, verify } from './service';

@Controller('/auth')
class AuthController {

    @Route("get", "/")
    async index(req: Request, res: Response, next: NextFunction) {
        return res.status(200).json({ message: 'Auth API is working' });
    }

    @Route("post", "/login")
    async login(req: Request, res: Response, next: NextFunction) {
        return login(req, res, next);
    }

    @Route("post", "/register")
    async register(req: Request, res: Response, next: NextFunction) {
        return register(req, res, next);
    }

    @Route("get", "/verify/:id/:uniqeJwt")
    async verify(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = BigInt(req.params.id);
            const uniqeJwt = req.params.uniqeJwt;
            return verify(userId, uniqeJwt, req, res, next);
        } catch (error) {
            return res.status(400).json({ error: "Someting went wrong" });
        }
    }

    @Route("post", "/logout")
    async logout(req: Request, res: Response, next: NextFunction) {
        return logout(req, res, next);
    }

    @Route("post", "/refresh")
    async refresh(req: Request, res: Response, next: NextFunction) {
        return refresh(req, res, next);
    }
    
    @Route("post", "/forgot-password")
    async forgotPassword(req: Request, res: Response, next: NextFunction) {
        // Logic for handling forgot password
        // This should be implemented in authService
        return res.status(501).json({ message: 'Forgot password endpoint not implemented' });
    }

    @Route("post", "/reset-password")
    async resetPassword(req: Request, res: Response, next: NextFunction) {
        // Logic for resetting user password
        // This should be implemented in authService
        return res.status(501).json({ message: 'Reset password endpoint not implemented' });
    }
}

export default AuthController;