import { Controller } from "@/server/decorators/controller";
import { MySQLCreate } from "@/server/decorators/mysql/create";
import { MySQLDelete } from "@/server/decorators/mysql/delete";
import { MySQLGet } from "@/server/decorators/mysql/get";
import { MySQLGetAll } from "@/server/decorators/mysql/getAll";
import { MySQLQuery } from "@/server/decorators/mysql/query";
import { Route } from "@/server/decorators/route";
import { Request, Response, NextFunction } from "express";

@Controller("/user-following-tags")
class UserFollowingTagsController {

  @Route("get", "/get/all")
  @MySQLGetAll("user_following_tags")
  getAll(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlGetAll);
  }

  @Route("get", "/get/:user_id/:tag")
  @MySQLGet("user_following_tags")
  get(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlGet);
  }

  @Route("post", "/create")
  @MySQLCreate("user_following_tags")
  create(req: Request, res: Response, next: NextFunction) {
    return res.status(201).json(req.mysqlCreate);
  }

  @Route("delete", "/delete/:user_id/:tag")
  @MySQLDelete("user_following_tags")
  delete(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json({ message: "User following tag deleted" });
  }

  @Route("post", "/search")
  @MySQLQuery("user_following_tags")
  query(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlGetAll);
  }
}

export default UserFollowingTagsController;