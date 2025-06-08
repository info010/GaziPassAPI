import { NextFunction, Request, Response } from "express";
import { Controller } from "@/server/decorators/controller";
import { Route } from "@/server/decorators/route";
import {
  getUserById,
  getCurrentUser,
  addFavorite,
  removeFavorite,
  followPublisher,
  unfollowPublisher,
  followTag,
  unfollowTag,
} from "./service";
import { authenticateToken } from "@/server/middleware/authenticateToken";

@Controller()
class UsersController {
  @Route("get", "/users")
  async getAllUsers(req: Request, res: Response) {
    return res.status(200).json({ message: "Getting All users" });
  }

  @Route("get", "/me", authenticateToken)
  async getProfile(req: Request, res: Response) {
    try {
      await getCurrentUser(req, res);
      return res
        .status(200)
        .json({ message: "Getting current user profile", user: req.user });
    } catch (error) {
      return res
        .status(400)
        .json({ error: "Someting went wrong.", detail: error });
    }
  }

  @Route("get", "/users/:id")
  async getById(req: Request, res: Response) {
    try {
      const userId: bigint = BigInt(req.params.id);
      await getUserById(userId, req, res);
      return res
        .status(200)
        .json({ message: `Getting user with ID: ${userId}`, user: req.user });
    } catch (error) {}
  }

  @Route("get", "/users/:id/posts")
  async getUserPosts(req: Request, res: Response) {
    try {
      const userId: bigint = BigInt(req.params.id);
      await getUserById(userId, req, res);
      return res.status(200).json({
        message: `Getting posts for user with ID: ${userId}`,
        posts: req.user?.posts,
      });
    } catch (error) {
      return res
        .status(400)
        .json({ error: "Someting went wrong.", detail: error });
    }
  }

  @Route("get", "/me/posts")
  async getProfilePosts(req: Request, res: Response) {
    try {
      await getCurrentUser(req, res);
      return res.status(200).json({
        message: `Getting current user posts`,
        posts: req.user?.posts,
      });
    } catch (error) {
      return res
        .status(400)
        .json({ error: "Someting went wrong.", detail: error });
    }
  }

  @Route("get", "/me/favorites", authenticateToken)
  async getProfileFavorites(req: Request, res: Response) {
    try {
      await getCurrentUser(req, res);
      return res.status(200).json({
        message: "Getting current user favorites",
        favorites: req.user?.favorites,
      });
    } catch (error) {
      return res
        .status(400)
        .json({ error: "Someting went wrong.", detail: error });
    }
  }

  @Route("post", "/me/favorites/:postId", authenticateToken)
  async addProfileFavorite(req: Request, res: Response) {
    try {
      const postId: bigint = BigInt(req.params.postId);
      return await addFavorite(postId, req, res);
    } catch (error) {
      return res
        .status(400)
        .json({ error: "Someting went wrong.", detail: error });
    }
  }

  @Route("delete", "/me/favorites/:postId", authenticateToken)
  async removeProfileFavorite(req: Request, res: Response) {
    try {
      const postId: bigint = BigInt(req.params.postId);
      return await removeFavorite(postId, req, res);
    } catch (error) {
      return res
        .status(400)
        .json({ error: "Someting went wrong.", detail: error });
    }
  }

  @Route("get", "/me/following-publishers", authenticateToken)
  async getProfileFollowingPublishers(req: Request, res: Response) {
    try {
      await getCurrentUser(req, res);
      return res.status(200).json({
        message: "Getting current user following publishers",
        followingPublishers: req.user?.following_publishers,
      });
    } catch (error) {
      return res
        .status(400)
        .json({ error: "Someting went wrong.", detail: error });
    }
  }

  @Route("post", "/me/following-publishers/:publisherId", authenticateToken)
  async addProfileFollowingPublisher(req: Request, res: Response) {
    try {
      const publisherId: bigint = BigInt(req.params.publisherId);
      return await followPublisher(publisherId, req, res);
    } catch (error) {
      return res
        .status(400)
        .json({ error: "Someting went wrong.", detail: error });
    }
  }

  @Route("delete", "/me/following-publishers/:publisherId", authenticateToken)
  async removeProfileFollowingPublisher(req: Request, res: Response) {
    try {
      const publisherId: bigint = BigInt(req.params.publisherId);
      return await unfollowPublisher(publisherId, req, res);
    } catch (error) {
      return res
        .status(400)
        .json({ error: "Someting went wrong.", detail: error });
    }
  }

  @Route("get", "/me/following-tags", authenticateToken)
  async getProfileFollowingTags(req: Request, res: Response) {
    try {
      await getCurrentUser(req, res);
      return res.status(200).json({
        message: "Getting current user following tags",
        followingTags: req.user?.following_tags,
      });
    } catch (error) {
      return res
        .status(400)
        .json({ error: "Someting went wrong.", detail: error });
    }
  }

  @Route("post", "/me/following-tags/:tag", authenticateToken)
  async addProfileFollowingTag(req: Request, res: Response) {
    try {
      const tag: string = req.params.tag;
      return await followTag(tag, req, res);
    } catch (error) {
      return res
        .status(400)
        .json({ error: "Someting went wrong.", detail: error });
    }
  }

  @Route("delete", "/me/following-tags/:tag", authenticateToken)
  async removeProfileFollowingTag(req: Request, res: Response) {
    try {
      const tag: string = req.params.tag;
      return await unfollowTag(tag, req, res);
    } catch (error) {
      return res
        .status(400)
        .json({ error: "Someting went wrong.", detail: error });
    }
  }

  /*     @Route('patch', '/:id')
    async updateUser(req: Request, res: Response) {
        const userId = req.params.id;
        // Logic to update user by ID
        return res.status(200).json({ message: `Updating user with ID: ${userId}` });
    }

    @Route('delete', '/:id')
    async deleteUser(req: Request, res: Response) {
        const userId = req.params.id;
        // Logic to delete user by ID
        return res.status(200).json({ message: `Deleting user with ID: ${userId}` });
    }

    @Route('get', '/search')
    async searchUsers(req: Request, res: Response) {
        const query = req.query.q;
        // Logic to search users by query
        return res.status(200).json({ message: `Searching users with query: ${query}` });
    } */
}

export default UsersController;
