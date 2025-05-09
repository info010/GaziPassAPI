import { Request, Response, NextFunction } from "express";
import { Controller } from "@/server/decorators/controller";
import { MySQLDelete } from "@/server/decorators/mysql/delete";
import { MySQLQuery } from "@/server/decorators/mysql/query";
import { Route } from "@/server/decorators/route";
import { VerifyRecovery } from "@/services/AuthService/SecretPayloadService/vertifyRecovery";
import { GenerateRecovery } from "@/services/AuthService/SecretPayloadService/generateRecovery";

@Controller("/secret-payloads")
class SecretPayloadController {

  @Route("post", "/verify")
  @VerifyRecovery()
  get(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json({ message: "Secret payload is valid" });
  }

  @Route("post", "/generate")
  @GenerateRecovery()
  create(req: Request, res: Response, next: NextFunction) {
    return res.status(201).json(req.secretPayload);
  }

  @Route("delete", "/delete/:email")
  @MySQLDelete("secret_payloads")
  delete(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json({ message: "Secret payload deleted" });
  }

  @Route("post", "/search")
  @MySQLQuery("secret_payloads")
  query(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlQuery);
  }
}

export default SecretPayloadController;