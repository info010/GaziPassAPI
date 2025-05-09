import { Request, Response, NextFunction } from "express";
import { db } from "@/utils/db";
import { RowDataPacket } from "mysql2";
import { AuthUser, Post, Publisher } from "@/utils/schemaManager";

export function GetPost() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      try {
        const id = req.params.id;

        const [rows_post] = await db.query<RowDataPacket[]>(
          "SELECT * FROM posts WHERE id = ? LIMIT 1",
          [id]
        );

        if (!rows_post[0]) {
          return res.status(404).json({ error: "Post not found" });
        }

        const [rows_publisher] = await db.query<RowDataPacket[]>(
          "SELECT * FROM users WHERE id = ? LIMIT 1",
          [rows_post[0].publisher_id]
        );

        if (!rows_publisher[0]) {
          return res.status(404).json({ error: "Publisher not found" });
        }

        const publisher: Publisher = {
            id: rows_publisher[0].id,
            username: rows_publisher[0].username,
            email: rows_publisher[0].email,
            role: rows_publisher[0].role,
        }

        const [rows_tags] = await db.query<RowDataPacket[]>(
            "SELECT tag FROM post_tags WHERE post_id = ?",
            [id]
        );

        const tags = rows_tags.map((row) => row.tag);
        
        const post: Post = {
            id: BigInt(id),
            title: rows_post[0].title,
            description: rows_post[0].description,
            upvote: rows_post[0].upvote,
            url: rows_post[0].url,
            tags,
            publisher
        }

        req.post = post;
      } catch (error) {
        console.error("[GetAuthUserByID Error]:", error);
        return res.status(500).json({ error: "Failed to fetch auth user" });
      }

      return originalMethod.call(this, req, res, next);
    };

    return descriptor;
  };
}