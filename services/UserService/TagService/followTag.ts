import { db } from "@/utils/db";
import { Request, Response, NextFunction } from "express";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export function FollowTag() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
            try {
                const { user_id, tag } = req.body;

                if (!user_id || !tag) {
                    return res.status(400).json({ error: "Missing required fields" });
                }

                const [existingFollowStatus] = await db.query<RowDataPacket[]>(
                    "SELECT * FROM user_following_tags WHERE user_id = ? AND tag = ?",
                    [user_id, tag]
                );

                if (existingFollowStatus.length > 0) {
                    return res.status(409).json({ error: "User already follow this tag" });
                }

                const [rows] = await db.query<ResultSetHeader>(
                    "INSERT INTO user_following_tags (user_id, tag) VALUES (?, ?)",
                    [user_id, tag]
                );

                if (rows.affectedRows === 0) {
                    return res.status(400).json({ error: "Failed to follow tag." });
                }

                req.body = rows.affectedRows > 0;
            } catch (error) {
                console.error("[FollowTag Error]:", error);
                return res.status(500).json({ error: "Internal server error", detail: error });
            }

            return originalMethod.call(this, req, res, next);
        }
        
        return descriptor;
    }
}