import { Controller } from "@/server/decorators/controller";
import { MySQLDelete } from "@/server/decorators/mysql/delete";
import { MySQLGetAll } from "@/server/decorators/mysql/getAll";
import { MySQLUpdate } from "@/server/decorators/mysql/update";
import { Route } from "@/server/decorators/route";
import { authenticateToken } from "@/server/middleware/authenticateToken";
import { CreatePost } from "@/services/post/createPost";
import { GetPost } from "@/services/post/getPost";
import { Request, Response, NextFunction } from "express";

@Controller("/posts")
class PostController {

  @Route("get", "/getall")
  @MySQLGetAll("posts")
  getAll(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlGetAll);
  }

  @Route("get", "/:id")
  @GetPost()
  get(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.post);
  }

  @Route("post", "/create", authenticateToken)
  @CreatePost()
  create(req: Request, res: Response, next: NextFunction) {
    return res.status(201).json(req.post);
  }

  @Route("delete", "/delete/:id", authenticateToken)
  @MySQLDelete("posts")
  delete(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json({ message: "Post deleted" });
  }

  @Route("put", "/update/:id", authenticateToken)
  @MySQLUpdate("posts")
  update(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlUpdate);
  }

/*   @Route("post", "/search")
  @MySQLQuery("posts")
  query(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlGetAll);
  } */
}

export default PostController;