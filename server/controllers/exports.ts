import UserController from "@/server/controllers/user/users";
import SecretPayloadController from "@/server/controllers/secret_payload/secretPayloads";
import PublisherController from "@/server/controllers/publisher/publishers";
import PostController from "@/server/controllers/post/posts";
import UserPostController from "@/server/controllers/user/user-posts";
import UserFavoritesController from "@/server/controllers/user/user-favorites";
import UserFollowingPublishersController from "@/server/controllers/user/user-following-publishers";
import UserFollowingTagsController from "@/server/controllers/user/user-following-tags";
import PostTagController from "@/server/controllers/post/post_tags";
import AuthUsersController from "@/server/controllers/auth_user/authUsers";
import TestController from "@/server/controllers/test";

// Exporting all controllers
export {
  UserController,
  SecretPayloadController,
  PublisherController,
  PostController,
  UserPostController,
  UserFavoritesController,
  UserFollowingPublishersController,
  UserFollowingTagsController,
  PostTagController,
  AuthUsersController,
  TestController
};