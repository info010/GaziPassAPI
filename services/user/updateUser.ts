import { Request, Response, NextFunction } from "express";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { Post, Publisher, User } from "@/utils/schemaManager";
import { db } from "@/utils/db";
import sql from "@/utils/sql";

export function UpdateUser() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      try {
        const id = req.params.id;
        const { email, username, role } = req.body;

        if (!id || !email || !username || !role) {
          return res.status(400).json({ error: "Missing required fields." });
        }

        const result_user = await sql.updateOne(
          "users",
          ["username", "email", "role"],
          [{ id: id }],
          username,
          email,
          role
        );

        if (result_user.affectedRows === 0) {
          return res.status(404).json({ error: "User not found" });
        }

        const result_authUser = await sql.updateOne(
          "auth_users",
          ["username", "email"],
          [{ id: id }],
          username,
          email
        );

        if (result_authUser.affectedRows === 0) {
          return res.status(404).json({ error: "AuthUser not found" });
        }

        //User's-Favorites
        const [rows_favorite] = await db.query<RowDataPacket[]>(
          "SELECT posts.id, posts.title, posts.description, posts.upvote, posts.url, posts.publisher_id FROM user_favorites INNER JOIN posts ON posts.id=user_favorites.post_id WHERE user_id = ?",
          [id]
        );

        const favorites: Post[] = await Promise.all(
          rows_favorite.map(async (row) => {
            const rows_publisher = await sql.queryOne(
              "users",
              ["id"],
              row.publisher_id
            );

            const publisher: Publisher = {
              id: rows_publisher[0].id,
              username: rows_publisher[0].username,
              email: rows_publisher[0].email,
              role: rows_publisher[0].role,
            };

            const rows_tags = await sql.queryOne(
              "post_tags",
              ["post_id"],
              row.id
            );

            const tags = rows_tags.map((row) => row.tag);

            const post: Post = {
              id: BigInt(row.id),
              title: row.title,
              description: row.description,
              upvote: row.upvote,
              url: row.url,
              tags,
              publisher,
            };

            return post;
          })
        );

        //User-Posts
        const rows_posts = await sql.queryOne("posts", ["publisher_id"], id);

        const posts: Post[] = await Promise.all(
          rows_posts.map(async (row) => {
            const rows_tags = await sql.queryOne(
              "post_tags",
              ["post_id"],
              row.id
            );

            const tags: string[] = rows_tags.map((e) => e.tag);

            const post: Post = {
              id: BigInt(id),
              title: row.title as string,
              description: row.description as string,
              upvote: row.upvote as number,
              url: row.url as string,
              tags,
              publisher: {
                id: BigInt(id),
                username,
                email,
                role,
              },
            };

            return post;
          })
        );

        //User's-Following-Publishers
        const [rows_following_publishers] = await db.query<RowDataPacket[]>(
          "SELECT users.id, users.username, users.email, users.role FROM user_following_publishers INNER JOIN users ON users.id=user_following_publishers.publisher_id WHERE user_id = ?",
          [id]
        );

        const following_publishers: Publisher[] = rows_following_publishers.map(
          (row) => ({
            id: row.id,
            username: row.username,
            email: row.email,
            role: row.role,
          })
        );

        //User's-Following-Tags

        const rows_following_tags = await sql.queryOne(
          "user_following_tags",
          ["user_id"],
          id
        );

        const following_tags: string[] = rows_following_tags.map(
          (row) => row.tag
        );

        //Object
        const updated: User = {
          id: BigInt(id),
          username,
          email,
          role,
          favorites,
          posts,
          following_tags,
          following_publishers,
        };

        req.user = updated;
      } catch (error) {
        console.error("[UpdateUser Error]:", error);
        return res.status(500).json({ error: "Update failed", detail: error });
      }

      return originalMethod.call(this, req, res, next);
    };

    return descriptor;
  };
}
