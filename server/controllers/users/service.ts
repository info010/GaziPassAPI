import { Request, Response, NextFunction } from "express";
import { Post, Publisher, User } from "@/utils/schemaManager";
import { db } from "@/utils/db";
import { RowDataPacket } from "mysql2";
import { deleteOne, insertOne, queryOne, updateOne } from "@/utils/sql";

export async function getUserById(id: bigint, req: Request, res: Response) {
  try {
    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const rows_user = await queryOne("users", ["id"], id);

    if (!rows_user[0]) {
      return res.status(404).json({ error: "User not found" });
    }

    //User's-Favorites
    const [rows_favorite] = await db.query<RowDataPacket[]>(
      "SELECT posts.id, posts.title, posts.description, posts.upvote, posts.url, posts.publisher_id FROM user_favorites INNER JOIN posts ON posts.id=user_favorites.post_id WHERE user_id = ?",
      [id]
    );

    const favorites: Post[] = await Promise.all(
      rows_favorite.map(async (row: any) => {
        const rows_publisher = await queryOne(
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

        const rows_tags = await queryOne("post_tags", ["post_id"], row.id);

        const tags = rows_tags.map((row: RowDataPacket) => row.tag);

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
    const rows_posts = await queryOne("posts", ["publisher_id"], id);

    const posts: Post[] = await Promise.all(
      rows_posts.map(async (row: RowDataPacket) => {
        const rows_tags = await queryOne("post_tags", ["post_id"], row.id);

        const tags: string[] = rows_tags.map((e: RowDataPacket) => e.tag);

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
          } as Publisher,
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
      (row: any) => ({
        id: row.id,
        username: row.username,
        email: row.email,
        role: row.role,
      })
    );

    //User's-Following-Tags

    const rows_following_tags = await queryOne(
      "user_following_tags",
      ["user_id"],
      id
    );

    const following_tags: string[] = rows_following_tags.map(
      (row: RowDataPacket) => row.tag
    );

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
    };

    req.user = user;
  } catch (error) {
    console.error("[GetUser Error]:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
}

export async function getCurrentUser(req: Request, res: Response) {
  const userId = req.currentUser?.id;
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }
  await getUserById(userId, req, res);
}

export async function updateUser(id: bigint, req: Request, res: Response) {
  try {
    const { email, username, role } = req.body;

    if (!id || !email || !username || !role) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const result_user = await updateOne(
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

    const result_authUser = await updateOne(
      "auth_users",
      ["username", "email"],
      [{ id: id }],
      username,
      email
    );

    if (result_authUser.affectedRows === 0) {
      return res.status(404).json({ error: "AuthUser not found" });
    }

    await getUserById(id, req, res);
  } catch (error) {
    console.error("[UpdateUser Error]:", error);
    return res.status(500).json({ error: "Failed to update user" });
  }
}

export async function addFavorite(postId: bigint, req: Request, res: Response) {
  try {
    const userId = req.currentUser?.id;
    if (!userId || !postId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingFavoriteStatus = await queryOne(
      "user_favorites",
      ["user_id", "post_id"],
      userId,
      postId
    );

    if (existingFavoriteStatus.length > 0) {
      return res
        .status(409)
        .json({ error: "User already added favorite this Post" });
    }

    const rows = await insertOne("user_favorites", userId, postId);

    if (rows.length === 0) {
      return res
        .status(400)
        .json({ error: "Failed to add favorites this posts." });
    }
    return res.status(200).json({
      message: "Post added to favorites successfully",
      postId: postId,
      userId: userId,
    });
  } catch (error) {
    console.error("[AddFavorite Error]:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", detail: error });
  }
}

export async function removeFavorite(
  postId: bigint,
  req: Request,
  res: Response
) {
  try {
    const userId = req.currentUser?.id;

    if (!userId || !postId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await deleteOne(
      "user_favorites",
      ["user_id", "post_id"],
      userId,
      postId
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Favorite status not found" });
    }

    return res.status(200).json({
      message: "Removing post from favorites",
      postId: postId,
      userId: userId,
    });
  } catch (error) {
    console.error("[RemoveFavorite Error]:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", detail: error });
  }
}

export async function followPublisher(
  publisherId: bigint,
  req: Request,
  res: Response
) {
  try {
    const userId = req.currentUser?.id;

    if (!userId || !publisherId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingFollowStatus = await queryOne(
      "user_following_publishers",
      ["user_id", "publisher_id"],
      userId,
      publisherId
    );

    if (existingFollowStatus.length > 0) {
      return res
        .status(409)
        .json({ error: "User already following this publisher" });
    }

    const rows = await insertOne(
      "user_following_publishers",
      userId,
      publisherId
    );

    if (rows.length === 0) {
      return res
        .status(400)
        .json({ error: "Failed to follow this publisher." });
    }

    return res.status(200).json({
      message: "Publisher followed successfully",
      publisherId: publisherId,
      userId: userId,
    });
  } catch (error) {
    console.error("[FollowPublisher Error]:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", detail: error });
  }
}

export async function unfollowPublisher(
  publisherId: bigint,
  req: Request,
  res: Response
) {
  try {
    const userId = req.currentUser?.id;

    if (!userId || !publisherId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await deleteOne(
      "user_following_publishers",
      ["user_id", "publisher_id"],
      userId,
      publisherId
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Follow status not found" });
    }

    return res.status(200).json({
      message: "Unfollowed publisher successfully",
      publisherId: publisherId,
      userId: userId,
    });
  } catch (error) {
    console.error("[UnfollowPublisher Error]:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", detail: error });
  }
}

export async function followTag(tag: string, req: Request, res: Response) {
  try {
    const userId = req.currentUser?.id;

    if (!userId || !tag) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingFollowStatus = await queryOne(
      "user_following_tags",
      ["user_id", "tag"],
      userId,
      tag
    );

    if (existingFollowStatus.length > 0) {
      return res.status(409).json({ error: "User already following this tag" });
    }

    const rows = await insertOne("user_following_tags", userId, tag);

    if (rows.length === 0) {
      return res.status(400).json({ error: "Failed to follow this tag." });
    }

    return res.status(200).json({
      message: "Tag followed successfully",
      tag: tag,
      userId: userId,
    });
  } catch (error) {
    console.error("[FollowTag Error]:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", detail: error });
  }
}

export async function unfollowTag(tag: string, req: Request, res: Response) {
  try {
    const userId = req.currentUser?.id;

    if (!userId || !tag) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await deleteOne(
      "user_following_tags",
      ["user_id", "tag"],
      userId,
      tag
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Follow status not found" });
    }

    return res.status(200).json({
      message: "Unfollowed tag successfully",
      tag: tag,
      userId: userId,
    });
  } catch (error) {
    console.error("[UnfollowTag Error]:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", detail: error });
  }
}
