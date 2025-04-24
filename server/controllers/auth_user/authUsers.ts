import { Controller } from "@/server/decorators/controller";
import { MySQLCreate } from "@/server/decorators/mysql/create";
import { MySQLDelete } from "@/server/decorators/mysql/delete";
import { MySQLGet } from "@/server/decorators/mysql/get";
import { MySQLGetAll } from "@/server/decorators/mysql/getAll";
import { MySQLQuery } from "@/server/decorators/mysql/query";
import { MySQLUpdate } from "@/server/decorators/mysql/update";
import { Route } from "@/server/decorators/route";
import { Request, Response, NextFunction } from "express";

@Controller("/auth-users")
class AuthUsersController {

  @Route("get", "/get/all")
  @MySQLGetAll("auth_users")
  getAll(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlGetAll);
  }

  @Route("get", "/get/:id")
  @MySQLGet("auth_users")
  get(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlGet);
  }

  @Route("post", "/create")
  @MySQLCreate("auth_users")
  create(req: Request, res: Response, next: NextFunction) {
    return res.status(201).json(req.mysqlCreate);
  }

  @Route("put", "/update/:id")
  @MySQLUpdate("auth_users")
  update(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlUpdate);
  }

  @Route("delete", "/delete/:id")
  @MySQLDelete("auth_users")
  delete(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json({ message: "Auth user deleted" });
  }

  @Route("post", "/search")
  @MySQLQuery("auth_users")
  query(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlGetAll);
  }
}

export default AuthUsersController;