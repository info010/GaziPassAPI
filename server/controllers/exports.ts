import UserController from "@/server/controllers/db/user/users";
import SecretPayloadController from "@/server/controllers/db/secret_payload/secretPayloads";
import PostController from "@/server/controllers/db/post/posts";
import AuthUsersController from "@/server/controllers/db/auth_user/authUsers";
import TestController from "@/server/controllers/test";
import LoginController from "@/server/controllers/auth/login/login";
import RefreshController from "@/server/controllers/auth/refresh/refresh";
import LogoutController from "@/server/controllers/auth/logout/logout";

// Exporting all controllers
export {
  UserController,
  SecretPayloadController,
  PostController,
  AuthUsersController,
  TestController,
  LoginController,
  RefreshController,
  LogoutController,
};