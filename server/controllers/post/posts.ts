import { Controller } from "@/server/decorators/controller";
import { MySQLCreate } from "@/server/decorators/mysql/create";
import { MySQLDelete } from "@/server/decorators/mysql/delete";
import { MySQLGet } from "@/server/decorators/mysql/get";
import { MySQLGetAll } from "@/server/decorators/mysql/getAll";
import { MySQLQuery } from "@/server/decorators/mysql/query";
import { MySQLUpdate } from "@/server/decorators/mysql/update";
import { Route } from "@/server/decorators/route";
import { Request, Response, NextFunction } from "express";

@Controller("/posts")
class PostController {

  @Route("get", "/get/all")
  @MySQLGetAll("posts")
  getAll(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlGetAll);
  }

  @Route("get", "/get/:id")
  @MySQLGet("posts")
  get(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlGet);
  }

  @Route("post", "/create")
  @MySQLCreate("posts")
  create(req: Request, res: Response, next: NextFunction) {
    return res.status(201).json(req.mysqlCreate);
  }

  @Route("delete", "/delete/:id")
  @MySQLDelete("posts")
  delete(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json({ message: "Post deleted" });
  }

  @Route("put", "/update/:id")
  @MySQLUpdate("posts")
  update(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlUpdate);
  }

  @Route("post", "/search")
  @MySQLQuery("posts")
  query(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlGetAll);
  }
}

export default PostController;