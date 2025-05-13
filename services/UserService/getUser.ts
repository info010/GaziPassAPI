import { db } from "@/utils/db";
import { Request, Response, NextFunction } from "express";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { Post, Publisher, User } from "@/utils/schemaManager";

export function GetUser() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
            try {
                const id = req.params.id;

                //User
                const rows_user = await sql.queryOne("users", ["id"], id);

                if (!rows_user[0]) {
                    return res.status(404).json({ error: "User not found" });
                }

                //User's-Favorites
                const [rows_favorite] = await db.query<RowDataPacket[]>(
                    "SELECT posts.id, posts.title, posts.description, posts.upvote, posts.url, posts.publisher_id FROM user_favorites INNER JOIN posts ON posts.id=user_favorites.post_id WHERE user_id = ?",
                    [id]
                );

                const favorites: Post[] = await Promise.all(rows_favorite.map(async (row) => {
                    
                    const rows_publisher = await sql.queryOne("users", ["id"], row.publisher_id);

                    const publisher: Publisher = {
                        id: rows_publisher[0].id,
                        username: rows_publisher[0].username,
                        email: rows_publisher[0].email,
                        role: rows_publisher[0].role,
                    }

                    const rows_tags = await sql.queryOne("post_tags", ["post_id"], row.id);

                    const tags = rows_tags.map((row) => row.tag);
        
                    const post: Post = {
                        id: BigInt(row.id),
                        title: row.title,
                        description: row.description,
                        upvote: row.upvote,
                        url: row.url,
                        tags,
                        publisher
                    }

                    return post;
                })) 
                
                //User-Posts
                const rows_posts = await sql.queryOne("posts", ["publisher_id"], id);

                const posts: Post[] = await Promise.all(rows_posts.map(async (row) => {

                    const rows_tags = await sql.queryOne("post_tags", ["post_id"], row.id);

                    const tags: string[] = rows_tags.map((e) => e.tag);
                    
                    const post: Post = {
                        id: BigInt(id),
                        title: row.title as string,
                        description: row.description as string,
                        upvote: row.upvote as number,
                        url: row.url as string,
                        tags,
                        publisher: {
                            id: rows_user[0].id,
                            username: rows_user[0].username,
                            email: rows_user[0].email,
                            role: rows_user[0].role,
                        } as Publisher
                    }

                    return post;
                }));

                //User's-Following-Publishers
                const [rows_following_publishers] = await db.query<RowDataPacket[]>(
                    "SELECT users.id, users.username, users.email, users.role FROM user_following_publishers INNER JOIN users ON users.id=user_following_publishers.publisher_id WHERE user_id = ?",
                    [id]
                );

                const following_publishers: Publisher[] = rows_following_publishers.map((row) => ({
                        id: row.id,
                        username: row.username,
                        email: row.email,
                        role: row.role,
                }));

                //User's-Following-Tags

                const rows_following_tags = await sql.queryOne("user_following_tags", ["user_id"], id);

                const following_tags: string[] = rows_following_tags.map((row) => row.tag);
                
                //Object
                const user: User = {
                    id: rows_user[0].id,
                    username: rows_user[0].username,
                    email: rows_user[0].email,
                    role: rows_user[0].role,
                    favorites,
                    posts,
                    following_tags,
                    following_publishers,
                } 

                req.user = user;
            } catch (error) {
                console.error("[GetUser Error]:", error);
                return res.status(500).json({ error: "Failed to fetch user" });
            }

            return originalMethod.call(this, req, res, next);
        }

        return descriptor;
    }
}