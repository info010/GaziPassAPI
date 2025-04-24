import { db } from "@/utils/db";
import Quark from "@hadron/quark/_dist/src";
import { Publisher, Post } from "@/utils/schemaManager";
import { RowDataPacket, ResultSetHeader } from "mysql2";

const quark = new Quark(2);

export const createPost = async (
  title: string,
  description: string,
  url: string,
  publisher_id: bigint,
  tags: string[]
) => {
  const id = quark.generate();
  const upvote = 0;

  await db.query<ResultSetHeader>(
    "INSERT INTO posts (id, title, description, upvote, url, publisher_id) VALUES (?, ?, ?, ?, ?, ?)",
    [id, title, description, upvote, url, publisher_id]
  );

  await linkPostToUser(publisher_id, id);
  await Promise.all(tags.map((tag) => addTagToPost(id, tag)));

  return id;
};

export const getPostById = async (post_id: bigint) => {
  const [posts_rows] = await db.query<RowDataPacket[]>(
    "SELECT * FROM posts WHERE id = ? LIMIT 1",
    [post_id]
  );
  if (!posts_rows[0]) return null;

  const [publishers_rows] = await db.query<RowDataPacket[]>(
    "SELECT * FROM publishers WHERE id = ? LIMIT 1",
    [posts_rows[0].publisher_id]
  );

  const publisher: Publisher = {
    id: BigInt(publishers_rows[0].id),
    username: publishers_rows[0].username,
    email: publishers_rows[0].email,
    role: publishers_rows[0].verification,
  };

  const [tags_rows] = await db.query<RowDataPacket[]>(
    "SELECT tag FROM post_tags WHERE post_id = ?",
    [posts_rows[0].id]
  );

  const tags = tags_rows.map((row) => row.tag);

  const post: Post = {
    id: BigInt(posts_rows[0].id),
    title: posts_rows[0].title,
    description: posts_rows[0].description,
    url: posts_rows[0].url,
    upvote: posts_rows[0].upvote,
    tags,
    publisher,
  };

  return post;
};

export const getAllPosts = async () => {
  const [rows] = await db.query<RowDataPacket[]>("SELECT id FROM posts");

  const postIds: bigint[] = rows.map((row) => BigInt(row.id));

  const posts: Post[] = await Promise.all(
    postIds.map((id: bigint) => getPostById(id) as Promise<Post>)
  );

  return posts;
};

export const getPostsByUser = async (id: bigint) => {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT * FROM user_posts WHERE user_id = ?",
    [id]
  );

  const postIds: bigint[] = rows.map((row) => BigInt(row.post_id));

  const posts: Post[] = await Promise.all(
    postIds.map((id: bigint) => getPostById(id) as Promise<Post>)
  );

  return posts;
};

export const getPostsByTags = async (tags: string[]) => {
  if (tags.length === 0) return [];

  const placeholders = tags.map(() => "?").join(", ");

  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT post_id FROM post_tags WHERE tag IN (${placeholders}) GROUP BY post_id HAVING COUNT(DISTINCT tag) = ?`,
    [...tags, tags.length]
  );

  const postIds: bigint[] = rows.map((row) => BigInt(row.post_id));

  const posts: Post[] = await Promise.all(
    postIds.map((id: bigint) => getPostById(id) as Promise<Post>)
  );

  return posts;
};

export const addTagToPost = async (post_id: bigint, tag: string) => {
  await db.query<ResultSetHeader>(
    "INSERT IGNORE INTO post_tags (post_id, tag) VALUES (?, ?)",
    [post_id, tag]
  );
};

export const deleteTagToPost = async (post_id: bigint, tag: string) => {
  await db.query<ResultSetHeader>(
    "DELETE FROM post_tags WHERE post_id = ? AND tag = ?",
    [post_id, tag]
  );
};

export const linkPostToUser = async (user_id: bigint, post_id: bigint) => {
  await db.query<ResultSetHeader>(
    "INSERT INTO user_posts (user_id, post_id) VALUES (?, ?)",
    [user_id, post_id]
  );
};

export const upvotePost = async (post_id: bigint) => {
  await db.query<ResultSetHeader>(
    "UPDATE posts SET upvote = upvote + 1 WHERE id = ?",
    [post_id]
  );
};

export const downvotePost = async (post_id: bigint) => {
  await db.query<ResultSetHeader>(
    "UPDATE posts SET upvote = upvote - 1 WHERE id = ?",
    [post_id]
  );
};

export const deletePost = async (post_id: bigint) => {
  await db.query<ResultSetHeader>("DELETE FROM posts WHERE id = ?", [post_id]);
  await db.query<ResultSetHeader>("DELETE FROM post_tags WHERE post_id = ?", [post_id]);
  await db.query<ResultSetHeader>("DELETE FROM user_posts WHERE post_id = ?", [post_id]);
};
