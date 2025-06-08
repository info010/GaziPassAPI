import e, { Request, Response, NextFunction } from "express";
import { Controller } from "@/server/decorators/controller";
import { Route } from "@/server/decorators/route";
import { authenticateToken } from "@/server/middleware/authenticateToken";
import {
  createPost,
  deletePost,
  getPostById,
  updatePost,
  votePost,
} from "./service";

@Controller("/posts")
class PostsController {
  @Route("get", "/")
  async getAllPosts(req: Request, res: Response, next: NextFunction) {
    // Logic to get all posts
    return res.status(200).json({ message: "Getting all posts" });
  }

  @Route("get", "/:id")
  async getPostById(req: Request, res: Response, next: NextFunction) {
    try {
      const postId: bigint = BigInt(req.params.id);
      await getPostById(postId, req, res);
      return res
        .status(200)
        .json({ message: `Getting post with ID: ${postId}`, post: req.post });
    } catch (error) {
      return res
        .status(400)
        .json({ error: "Someting went wrong.", detail: error });
    }
  }

  @Route("post", "/", authenticateToken)
  async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      await createPost(req, res);
      return res
        .status(201)
        .json({ message: "Post created successfully", post: req.post });
    } catch (error) {
      return res
        .status(400)
        .json({ error: "Someting went wrong.", detail: error });
    }
  }

  @Route("patch", "/:id", authenticateToken)
  async updatePost(req: Request, res: Response, next: NextFunction) {
    try {
      const postId: bigint = BigInt(req.params.id);
      await updatePost(postId, req, res);
      return res.status(200).json({
        message: `Post with ID: ${postId} updated successfully`,
        post: req.post,
      });
    } catch (error) {
      return res
        .status(400)
        .json({ error: "Someting went wrong.", detail: error });
    }
  }

  @Route("delete", "/:id", authenticateToken)
  async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      const postId: bigint = BigInt(req.params.id);
      await deletePost(postId, req, res);
      return res.status(200).json({
        message: `Post with ID: ${postId} deleted successfully`,
        postId: postId,
      });
    } catch (error) {
      return res
        .status(400)
        .json({ error: "Someting went wrong.", detail: error });
    }
  }

  @Route("post", "/:id/upvote", authenticateToken)
  async upvotePost(req: Request, res: Response, next: NextFunction) {
    try {
      const postId: bigint = BigInt(req.params.id);
      await votePost(postId, 1, req, res);
      return res.status(200).json({
        message: `Post with ID: ${postId} upvoted successfully`,
        upvote: req.post?.upvote,
      });
    } catch (error) {
      return res
        .status(400)
        .json({ error: "Someting went wrong.", detail: error });
    }
  }

  @Route("post", "/:id/downvote", authenticateToken)
  async downvotePost(req: Request, res: Response, next: NextFunction) {
    try {
      const postId: bigint = BigInt(req.params.id);
      await votePost(postId, -1, req, res);
      return res.status(200).json({
        message: `Post with ID: ${postId} downvoted successfully`,
        upvote: req.post?.upvote,
      });
    } catch (error) {
      return res
        .status(400)
        .json({ error: "Someting went wrong.", detail: error });
    }
  }
}

export default PostsController;
