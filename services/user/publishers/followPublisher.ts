import { Request, Response, NextFunction } from "express";

export function FollowPublisher() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
            try {
                const { user_id, publisher_id } = req.body;

                if (!user_id || !publisher_id) {
                    return res.status(400).json({ error: "Missing required fields" });
                }

                const existingFollowingStatus = await sql.queryOne("user_following_publishers", ["user_id", "publisher_id"], user_id, publisher_id);

                if (existingFollowingStatus.length > 0) {
                    return res.status(409).json({ error: "User already follow this Publisher" });
                }

                const rows = await sql.insertOne("user_following_publishers", user_id, publisher_id);

                if (rows.length === 0) {
                    return res.status(400).json({ error: "Failed to follow publisher." });
                }
                
                req.body = rows.length > 0;
            } catch (error) {
                console.error("[FollowPublisher Error]:", error);
                return res.status(500).json({ error: "Internal server error", detail: error });
            }

            return originalMethod.call(this, req, res, next);
        }
        
        return descriptor;
    }
}