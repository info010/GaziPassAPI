import { db } from "@/utils/db";
import { Post, Publisher, User } from "@/utils/schemaManager";
import { getPostById, getPostsByUser } from "./postService";
import { RowDataPacket } from "mysql2";

export const createUser = async (
  id: bigint,
  username: string,
  email: string,
  verification: string = "user"
) => {
  const signup_time = BigInt(Date.now());

  await db.query<RowDataPacket[]>(
    "INSERT INTO users (id, username, email, verification, signup_time) VALUES (?, ?, ?, ?, ?)",
    [id, username, email, verification, signup_time]
  );

  const user: User = {
    id: id,
    username: username,
    email: email,
    verification: verification,
    signupTime: signup_time,
    posts: [],
    favorites: [],
    following_tags: [],
    following_publishers: [],
  };

  return user;
};

export const getUserById = async (id: bigint) => {
  const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM users WHERE id = ? LIMIT 1", [
    id,
  ]);

  const posts: Post[] = await getPostsByUser(id);
  const favorites: Post[] = await getFavoritePosts(id);
  const following_tags: string[] = await getFollowedTags(id);
  const following_publishers: Publisher[] = await getFollowedPublishers(id);

  const user: User = {
    id: rows[0].id,
    username: rows[0].username,
    email: rows[0].email,
    verification: rows[0].verification,
    signupTime: rows[0].signup_time,
    posts: posts ?? [],
    favorites: favorites ?? [],
    following_tags: following_tags ?? [],
    following_publishers: following_publishers ?? [],
  };

  return user;
};

export const deleteUser = async (id: bigint) => {
  await db.query("DELETE FROM users WHERE id = ?", [id]);
};

//Followed tags
export const followTag = async (user_id: bigint, tag: string) => {
  await db.query(
    "INSERT IGNORE INTO user_following_tags (user_id, tag) VALUES (?, ?)",
    [user_id, tag]
  );
};

export const unfollowTag = async (user_id: bigint, tag: string) => {
  await db.query<RowDataPacket[]>(
    "DELETE FROM user_following_tags WHERE user_id = ? AND tag = ?",
    [user_id, tag]
  );
};

export const getFollowedTags = async (user_id: bigint) => {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT tag FROM user_following_tags WHERE user_id = ?",
    [user_id]
  );
  return rows[0].map((row: any) => row.tag);
};

//Followed publishers
export const followPublisher = async (
  user_id: bigint,
  publisher_id: bigint
) => {
  await db.query(
    "INSERT IGNORE INTO user_following_publishers (user_id, publisher_id) VALUES (?, ?)",
    [user_id, publisher_id]
  );
};

export const unfollowPublisher = async (
  user_id: bigint,
  publisher_id: bigint
) => {
  await db.query(
    "DELETE FROM user_following_publishers WHERE user_id = ? AND publisher_id = ?",
    [user_id, publisher_id]
  );
};

export const getFollowedPublishers = async (user_id: bigint) => {
  const [ids] = await db.query<RowDataPacket[]>(
    "SELECT publisher_id FROM user_following_publishers WHERE user_id = ?",
    [user_id]
  );

  if (ids[0].length === 0) return [];

  const placeholders = ids[0].map(() => "?").join(", ");
  const values = ids[0].map((row: any) => row.publisher_id);

  const [publishers] = await db.query(
    `SELECT * FROM publishers WHERE id IN (${placeholders})`,
    values
  );

  return publishers as Publisher[];
};

//Followed favorites
export const addFavoritePost = async (user_id: bigint, post_id: bigint) => {
  await db.query(
    "INSERT IGNORE INTO user_favorites (user_id, post_id) VALUES (?, ?)",
    [user_id, post_id]
  );
};

export const removeFavoritePost = async (user_id: bigint, post_id: bigint) => {
  await db.query(
    "DELETE FROM user_favorites WHERE user_id = ? AND post_id = ?",
    [user_id, post_id]
  );
};

export const getFavoritePosts = async (user_id: bigint) => {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT post_id FROM user_favorites WHERE user_id = ?",
    [user_id]
  );
  const postIds = rows[0].map((row: any) => BigInt(row.post_id));

  const posts = await Promise.all(postIds.map((id: bigint) => getPostById(id)));
  return posts as Post[];
};
