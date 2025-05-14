import { Request, Response, NextFunction } from "express";

export function AddFavorite() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
            try {
                const { user_id, post_id } = req.body;

                if (!user_id || !post_id) {
                    return res.status(400).json({ error: "Missing required fields" });
                }
                
                const existingFavoriteStatus = await sql.queryOne("user_favorites", ["user_id", "post_id"], user_id, post_id);

                if (existingFavoriteStatus.length > 0) {
                    return res.status(409).json({ error: "User already added favorite this Post" });
                }

                const rows = await sql.insertOne("user_favorites", user_id, post_id);

                if (rows.length === 0) {
                    return res.status(400).json({ error: "Failed to add favorites this posts." });
                }
                
                req.body = rows.length > 0;
            } catch (error) {
                console.error("[AddFavorite Error]:", error);
                return res.status(500).json({ error: "Internal server error", detail: error });
            }

            return originalMethod.call(this, req, res, next);
        }
        
        return descriptor;
    }
}