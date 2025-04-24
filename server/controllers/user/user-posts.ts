import { Controller } from "@/server/decorators/controller";
import { MySQLCreate } from "@/server/decorators/mysql/create";
import { MySQLDelete } from "@/server/decorators/mysql/delete";
import { MySQLGet } from "@/server/decorators/mysql/get";
import { MySQLGetAll } from "@/server/decorators/mysql/getAll";
import { MySQLQuery } from "@/server/decorators/mysql/query";
import { Route } from "@/server/decorators/route";
import { Request, Response, NextFunction } from "express";

@Controller("/user-posts")
class UserPostController {

  @Route("get", "/get/all")
  @MySQLGetAll("user_posts")
  getAll(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlGetAll);
  }

  @Route("get", "/get/:user_id/:post_id")
  @MySQLGet("user_posts")
  get(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlGet);
  }

  @Route("post", "/create")
  @MySQLCreate("user_posts")
  create(req: Request, res: Response, next: NextFunction) {
    return res.status(201).json(req.mysqlCreate);
  }

  @Route("delete", "/delete/:user_id/:post_id")
  @MySQLDelete("user_posts")
  delete(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json({ message: "User post deleted" });
  }

  @Route("post", "/search")
  @MySQLQuery("user_posts")
  query(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlGetAll);
  }
}

export default UserPostController