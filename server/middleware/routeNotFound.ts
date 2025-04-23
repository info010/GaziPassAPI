import { Request, Response, NextFunction } from 'express';
import logging from '@/server/config/loggins';

export function routeNotFound(req: Request, res: Response, next: NextFunction) {
    const error = new Error('Not found');
    logging.warning(error);

    return res.status(404).json({
        error: {
            message: error.message
        }
    });
}