import { Request, Response, NextFunction } from "express";
import { Controller } from "@/server/decorators/controller";
import { Route } from "@/server/decorators/route";
import { MySQLGet } from "@/server/decorators/mysql/get";
import { MySQLGetAll } from "@/server/decorators/mysql/getAll";
import { MySQLCreate } from "@/server/decorators/mysql/create";
import { MySQLDelete } from "@/server/decorators/mysql/delete";
import { MySQLUpdate } from "@/server/decorators/mysql/update";
import { MySQLQuery } from "@/server/decorators/mysql/query";

@Controller("/users")
class UserController {
  
  @Route("get", "/get/all")
  @MySQLGetAll("users")
  getAll(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlGetAll);
  }

  @Route("get", "/get/:id")
  @MySQLGet("users")
  get(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlGet);
  }

  @Route("post", "/create")
  @MySQLCreate("users")
  create(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlGetAll);
  }

  @Route("delete", "/delete/:id")
  @MySQLDelete("users")
  delete(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlGetAll);
  }

  @Route("put", "/update/:id")
  @MySQLUpdate("users")
  update(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlGetAll);
  }

  @Route("post", "/search")
  @MySQLQuery("users")
  query(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlGetAll);
  }
}

export default UserController;