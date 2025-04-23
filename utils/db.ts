import * as mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const secretPayloadTable = `
CREATE IF EXISTS TABLE secret_payloads (
  email VARCHAR(255) UNIQUE,
  token VARCHAR(255),
  expire_at BIGINT,
  create_at BIGINT
);
`;

const publisherTable = `
CREATE IF EXISTS TABLE publishers (
  id BIGINT PRIMARY KEY,
  username VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  verification VARCHAR(255) DEFAULT 'user'
);
`;

const postTable = `
CREATE IF EXISTS TABLE posts (
  id BIGINT PRIMARY KEY,
  title VARCHAR(255),
  description VARCHAR(255),
  upvote INT UNSIGNED DEFAULT 0,
  url VARCHAR(255),
  publisher_id BIGINT,
  FOREIGN KEY (publisher_id) REFERENCES publishers(id)
);
`;

const postTagsTable = `
CREATE IF EXISTS TABLE post_tags (
  post_id BIGINT,
  tag VARCHAR(255),
  FOREIGN KEY (post_id) REFERENCES posts(id)
);
`;

const userTable = `
CREATE IF EXISTS TABLE users (
  id BIGINT PRIMARY KEY,
  username VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  verification VARCHAR(255) DEFAULT 'user',
  signup_time BIGINT
);
`;

const userPostsTable = `
CREATE IF EXISTS TABLE user_posts (
  user_id BIGINT,
  post_id BIGINT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (post_id) REFERENCES posts(id)
);
`;

const userFollowingTagsTable = `
CREATE IF EXISTS TABLE user_following_tags (
  user_id BIGINT,
  tag VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
`;

const userFavoritesTable = `
CREATE IF EXISTS TABLE user_favorites (
  user_id BIGINT,
  post_id BIGINT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (post_id) REFERENCES posts(id)
);
`;

const userFollowingPublishersTable = `
CREATE IF EXISTS TABLE user_following_publishers (
  user_id BIGINT,
  publisher_id BIGINT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (publisher_id) REFERENCES publishers(id)
);
`;

const authUserTable = `
CREATE IF EXISTS TABLE auth_users (
  id BIGINT PRIMARY KEY,
  username VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255)
);
`;

const tables = [
  secretPayloadTable,
  publisherTable,
  postTable,
  postTagsTable,
  userTable,
  userPostsTable,
  userFavoritesTable,
  userFollowingTagsTable,
  userFollowingPublishersTable,
  authUserTable,
];

tables.forEach((element) => {
  db.execute(element);
});
