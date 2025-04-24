import { db } from "@/utils/db";
import { Post, Publisher, User } from "@/utils/schemaManager";
import { getPostById, getPostsByUser } from "./postService";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export const createUser = async (
  id: bigint,
  username: string,
  email: string,
  role: string = "user"
) => {
  await db.query<ResultSetHeader>(
    "INSERT INTO users (id, username, email, role) VALUES (?, ?, ?, ?)",
    [id, username, email, role]
  );

  const user: User = {
    id,
    username,
    email,
    role: role,
    posts: [],
    favorites: [],
    following_tags: [],
    following_publishers: [],
  };

  return user;
};

export const getUserById = async (id: bigint) => {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT * FROM users WHERE id = ? LIMIT 1",
    [id]
  );

  if (rows.length === 0) return null;

  const posts: Post[] = await getPostsByUser(id);
  const favorites: Post[] = await getFavoritePosts(id);
  const following_tags: string[] = await getFollowedTags(id);
  const following_publishers: Publisher[] = await getFollowedPublishers(id);

  const user: User = {
    id: BigInt(rows[0].id),
    username: rows[0].username,
    email: rows[0].email,
    role: rows[0].role,
    posts,
    favorites,
    following_tags,
    following_publishers,
  };

  return user;
};

export const deleteUser = async (id: bigint) => {
  await db.query<ResultSetHeader>("DELETE FROM users WHERE id = ?", [id]);
};

// Follow Tags
export const followTag = async (user_id: bigint, tag: string) => {
  await db.query<ResultSetHeader>(
    "INSERT IGNORE INTO user_following_tags (user_id, tag) VALUES (?, ?)",
    [user_id, tag]
  );
};

export const unfollowTag = async (user_id: bigint, tag: string) => {
  await db.query<ResultSetHeader>(
    "DELETE FROM user_following_tags WHERE user_id = ? AND tag = ?",
    [user_id, tag]
  );
};

export const getFollowedTags = async (user_id: bigint) => {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT tag FROM user_following_tags WHERE user_id = ?",
    [user_id]
  );
  return rows.map((row) => row.tag);
};

// Follow Publishers
export const followPublisher = async (user_id: bigint, publisher_id: bigint) => {
  await db.query<ResultSetHeader>(
    "INSERT IGNORE INTO user_following_publishers (user_id, publisher_id) VALUES (?, ?)",
    [user_id, publisher_id]
  );
};

export const unfollowPublisher = async (user_id: bigint, publisher_id: bigint) => {
  await db.query<ResultSetHeader>(
    "DELETE FROM user_following_publishers WHERE user_id = ? AND publisher_id = ?",
    [user_id, publisher_id]
  );
};

export const getFollowedPublishers = async (user_id: bigint) => {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT publisher_id FROM user_following_publishers WHERE user_id = ?",
    [user_id]
  );

  const publisherIds = rows.map((row) => row.publisher_id);
  if (publisherIds.length === 0) return [];

  const placeholders = publisherIds.map(() => "?").join(", ");
  const [publishers] = await db.query<RowDataPacket[]>(
    `SELECT * FROM publishers WHERE id IN (${placeholders})`,
    publisherIds
  );

  return publishers.map((row) => ({
    id: BigInt(row.id),
    username: row.username,
    email: row.email,
    role: row.role,
  })) as Publisher[];
};

// Favorite Posts
export const addFavoritePost = async (user_id: bigint, post_id: bigint) => {
  await db.query<ResultSetHeader>(
    "INSERT IGNORE INTO user_favorites (user_id, post_id) VALUES (?, ?)",
    [user_id, post_id]
  );
};

export const removeFavoritePost = async (user_id: bigint, post_id: bigint) => {
  await db.query<ResultSetHeader>(
    "DELETE FROM user_favorites WHERE user_id = ? AND post_id = ?",
    [user_id, post_id]
  );
};

export const getFavoritePosts = async (user_id: bigint) => {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT post_id FROM user_favorites WHERE user_id = ?",
    [user_id]
  );

  const postIds = rows.map((row) => BigInt(row.post_id));

  const posts = await Promise.all(postIds.map((id) => getPostById(id)));
  return posts.filter(Boolean) as Post[];
};
