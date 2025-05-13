import { Request, Response, NextFunction } from "express";
import { Post, Publisher } from "@/utils/schemaManager";

export function GetPost() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      try {
        const id = req.params.id;

        const rows_post = await sql.queryOne("posts", ["id"], id);

        if (!rows_post[0]) {
          return res.status(404).json({ error: "Post not found" });
        }

        const rows_publisher = await sql.queryOne("users", ["id"], rows_post[0].publisher_id);

        const publisher: Publisher = {
            id: BigInt(rows_post[0].publisher_id),
            username: rows_publisher[0].username,
            email: rows_publisher[0].email,
            role: rows_publisher[0].role,
        }

        const rows_tags = await sql.queryOne("post_tags", ["post_id"], id);

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