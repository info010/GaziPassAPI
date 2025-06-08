import { Request, Response } from "express";
import { Post, Publisher } from "@/utils/schemaManager";
import { Quark } from "@thehadron/quark";
import {
  deleteOne,
  insertOne,
  insertOneWithColumns,
  queryOne,
  updateOne,
} from "@/utils/sql";

const quark = new Quark(2);

export async function getPostById(postId: bigint, req: Request, res: Response) {
  try {
    const rows_post = await queryOne("posts", ["id"], postId);

    if (!rows_post[0]) {
      return res.status(404).json({ error: "Post not found" });
    }

    const rows_publisher = await queryOne(
      "users",
      ["id"],
      rows_post[0].publisher_id
    );

    const publisher: Publisher = {
      id: BigInt(rows_post[0].publisher_id),
      username: rows_publisher[0].username,
      email: rows_publisher[0].email,
      role: rows_publisher[0].role,
    };

    const rows_tags = await queryOne("post_tags", ["post_id"], postId);

    const tags = rows_tags.map((row) => row.tag);

    const post: Post = {
      id: BigInt(postId),
      title: rows_post[0].title,
      description: rows_post[0].description,
      upvote: rows_post[0].upvote,
      url: rows_post[0].url,
      tags,
      publisher,
    };

    req.post = post;
  } catch (error) {
    console.error("[GetAuthUserByID Error]:", error);
    return res.status(500).json({ error: "Failed to fetch auth user" });
  }
}

export async function createPost(req: Request, res: Response) {
  try {
    const publisher_id = req.currentUser?.id;

    const { title, description, url, tags } = req.body;

    if (!title || !description || !url || !publisher_id || !tags) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const id = quark.generate();

    const result = await insertOneWithColumns(
      "posts",
      ["id", "title", "description", "url", "publisher_id"],
      id,
      title,
      description,
      url,
      publisher_id
    );

    if (result.length === 0) {
      return res.status(400).json({ error: "Failed to create Post." });
    }

    await Promise.all(
      tags.map((tag: string) => insertOne("post_tags", id, tag))
    );

    await getPostById(id, req, res);
  } catch (error) {
    console.error("[CreatePost Error]:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function updatePost(postId: bigint, req: Request, res: Response) {
  try {
    const publisher_id = req.currentUser?.id;
    const { title, description, url, tags } = req.body;

    if (!title || !description || !url || !publisher_id || !tags) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const rows_post = await queryOne("posts", ["id"], postId);

    if (!rows_post[0]) {
      return res.status(404).json({ error: "Post not found" });
    }

    const result = await updateOne(
      "posts",
      ["title", "description", "url"],
      [{ id: postId }],
      title,
      description,
      url
    );

    if (result.affectedRows == 0) {
      return res.status(400).json({ error: "Failed to update Post" });
    }

    await deleteOne("post_tags", ["post_id"], postId);

    await Promise.all(
      tags.map((tag: string) => insertOne("post_tags", postId, tag))
    );

    await getPostById(postId, req, res);
  } catch (error) {
    console.error("[UpdatePost Error]:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function deletePost(postId: bigint, req: Request, res: Response) {
  try {
    const publisher_id = req.currentUser?.id;
    const { title, description, url, tags } = req.body;

    if (!title || !description || !url || !publisher_id || !tags) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const rows_post = await queryOne("posts", ["id"], postId);

    if (!rows_post[0]) {
      return res.status(404).json({ error: "Post not found" });
    }

    const rows = await deleteOne("posts", ["id"], postId);

    if (rows.affectedRows == 0) {
      return res.status(400).json({ error: "Failed to delete Post" });
    }

    await deleteOne("post_tags", ["post_id"], postId);

    return res
      .status(200)
      .json({ message: "Post delete successfully.", postId: postId });
  } catch (error) {
    console.error("[DeletePost Error]:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function votePost(
  postId: bigint,
  index: number,
  req: Request,
  res: Response
) {
  try {
    const userId = req.currentUser?.id;

    await getPostById(postId, req, res);

    if (req.post?.upvote! + index < 0) {
      return res
        .status(400)
        .json({ error: "Upvote is not smaller than zero." });
    }

    const result = await updateOne(
      "posts",
      ["upvote"],
      [{ id: postId }],
      req.post?.upvote! + index
    );

    if (result.affectedRows == 0) {
      return res.status(400).json({ error: "Failed to vote Post" });
    }

    if (index > 0) 
      await insertOne("upvote", userId, postId);
    if (index < 0)
      await deleteOne("upvote", ["user_id", "post_id"], userId, postId);

    await getPostById(postId, req, res);
  } catch (error) {
    console.error("[UpvotePost Error]:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
