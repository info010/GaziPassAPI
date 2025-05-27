import { Controller } from "@/server/decorators/controller";
import { Route } from "@/server/decorators/route";
import { Request, Response, NextFunction } from "express";

import { MySQLGetAll } from "@/server/decorators/mysql/getAll";
import { MySQLQuery } from "@/server/decorators/mysql/query";

import { CreateAuthUser } from "@/services/auth/createAuthUser";
import { DeleteAuthUser } from "@/services/auth/deleteAuthUser";
import { GetAuthUserByEmail } from "@/services/auth/getAuthUserByEmail";
import { GetAuthUserByID } from "@/services/auth/getAuthUserById";
import { UpdateAuthUser } from "@/services/auth/updateAuthUser";

@Controller("/auth-users")
class AuthUsersController {

  @Route("get", "/getAll")
  @MySQLGetAll("auth_users")
  getAll(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlGetAll);
  }

  @Route("get", "/getById/:id")
  @GetAuthUserByID()
  getById(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.authUser);
  }

  @Route("get", "/getByEmail/:email")
  @GetAuthUserByEmail()
  getByEmail(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.authUser);
  }

  @Route("post", "/create")
  @CreateAuthUser()
  create(req: Request, res: Response, next: NextFunction) {
    return res.status(201).json(req.authUser);
  }

  @Route("put", "/update/:id")
  @UpdateAuthUser()
  update(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.authUser);
  }

  @Route("delete", "/delete/:id")
  @DeleteAuthUser()
  delete(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json({ message: "Auth user deleted" });
  }

/*   @Route("post", "/search")
  @MySQLQuery("auth_users")
  query(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlQuery);
  } */
}

export default AuthUsersController;