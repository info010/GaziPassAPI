import { Request, Response, NextFunction } from "express";
import { Controller } from "@/server/decorators/controller";
import { MySQLCreate } from "@/server/decorators/mysql/create";
import { MySQLDelete } from "@/server/decorators/mysql/delete";
import { MySQLGet } from "@/server/decorators/mysql/get";
import { MySQLQuery } from "@/server/decorators/mysql/query";
import { Route } from "@/server/decorators/route";

@Controller("/secret-payloads")
class SecretPayloadController {

  @Route("get", "/get/:email")
  @MySQLGet("secret_payloads")
  get(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlGet);
  }

  @Route("post", "/create")
  @MySQLCreate("secret_payloads")
  create(req: Request, res: Response, next: NextFunction) {
    return res.status(201).json(req.mysqlCreate);
  }

  @Route("delete", "/delete/:email")
  @MySQLDelete("secret_payloads")
  delete(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json({ message: "Secret payload deleted" });
  }

  @Route("post", "/search")
  @MySQLQuery("secret_payloads")
  query(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlGetAll);
  }
}

export default SecretPayloadController;