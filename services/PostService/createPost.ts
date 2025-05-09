import { db } from "@/utils/db";
import { Request, Response, NextFunction } from "express";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { Post, Publisher } from "@/utils/schemaManager";
import { Quark } from  "@thehadron/quark"

const quark = new Quark(2);

export function CreatePost() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
            try {
                const { title, description, url, publisher_id, tags} = req.body;

                if (!title || !description || !url || !publisher_id || !tags) {
                    return res.status(400).json({ error: "Missing required fields." });
                }

                const id = quark.generate();
                const upvote = 0;

                const [result] = await db.query<ResultSetHeader>(
                    "INSERT INTO posts (id, title, description, upvote, url, publisher_id) VALUES (?, ?, ?, ?, ?, ?)",
                    [id, title, description, upvote, url, publisher_id]
                );

                if (result.affectedRows === 0) {
                    return res.status(400).json({ error: "Failed to create Post." });
                }
                
                await Promise.all(tags.map((tag: string) => {
                    db.query<ResultSetHeader>(
                        "INSERT INTO post_tags (post_id, tag) VALUES (?, ?)",
                        [id, tag]
                    );
                }));

                const [rows] = await db.query<RowDataPacket[]>(
                    "SELECT * FROM users WHERE id = ? LIMIT 1",
                    [publisher_id]
                );

                const publisher: Publisher = {
                    id: BigInt(publisher_id),
                    username: rows[0].username,
                    email: rows[0].email,
                    role: rows[0].role,
                } 
                
                const post: Post = {
                    id,
                    title,
                    description,
                    upvote,
                    url,
                    tags,
                    publisher,
                }
                
                req.post = post;
            } catch (error) {
                console.error("[CreatePost Error]:", error);
                return res.status(500).json({ error: "Internal server error" });
            }

            return originalMethod.call(this, req, res, next);
        };

        return descriptor;
    }
}