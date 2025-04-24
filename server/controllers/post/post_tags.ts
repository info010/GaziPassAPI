import { Controller } from "@/server/decorators/controller";
import { MySQLCreate } from "@/server/decorators/mysql/create";
import { MySQLDelete } from "@/server/decorators/mysql/delete";
import { MySQLGet } from "@/server/decorators/mysql/get";
import { MySQLGetAll } from "@/server/decorators/mysql/getAll";
import { MySQLQuery } from "@/server/decorators/mysql/query";
import { Route } from "@/server/decorators/route";
import { Request, Response, NextFunction } from "express";

@Controller("/post-tags")
class PostTagController {

  @Route("get", "/get/all")
  @MySQLGetAll("post_tags")
  getAll(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlGetAll);
  }

  @Route("get", "/get/:post_id/:tag")
  @MySQLGet("post_tags")
  get(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlGet);
  }

  @Route("post", "/create")
  @MySQLCreate("post_tags")
  create(req: Request, res: Response, next: NextFunction) {
    return res.status(201).json(req.mysqlCreate);
  }

  @Route("delete", "/delete/:post_id/:tag")
  @MySQLDelete("post_tags")
  delete(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json({ message: "Post tag deleted" });
  }

  @Route("post", "/search")
  @MySQLQuery("post_tags")
  query(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlGetAll);
  }
}

export default PostTagController;