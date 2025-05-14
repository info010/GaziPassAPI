import { Request, Response, NextFunction } from "express";

export function FollowTag() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
            try {
                const { user_id, tag } = req.body;

                if (!user_id || !tag) {
                    return res.status(400).json({ error: "Missing required fields" });
                }

                const existingFollowingStatus = await sql.queryOne("user_following_tags", ["user_id", "tag"], user_id,tag);

                if (existingFollowingStatus.length > 0) {
                    return res.status(409).json({ error: "User already follow this Tag" });
                }

                const rows = await sql.insertOne("user_following_tags", user_id, tag);

                if (rows.length === 0) {
                    return res.status(400).json({ error: "Failed to follow tag." });
                }
                
                req.body = rows.length > 0;
            } catch (error) {
                console.error("[FollowTag Error]:", error);
                return res.status(500).json({ error: "Internal server error", detail: error });
            }

            return originalMethod.call(this, req, res, next);
        }
        
        return descriptor;
    }
}