import { Controller } from "@/server/decorators/controller";
import { MySQLCreate } from "@/server/decorators/mysql/create";
import { MySQLDelete } from "@/server/decorators/mysql/delete";
import { MySQLGet } from "@/server/decorators/mysql/get";
import { MySQLGetAll } from "@/server/decorators/mysql/getAll";
import { MySQLUpdate } from "@/server/decorators/mysql/update";
import { Route } from "@/server/decorators/route";
import { Request, Response, NextFunction } from "express";

@Controller("/publishers")
class PublisherController {

  @Route("get", "/get/all")
  @MySQLGetAll("publishers")
  getAll(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlGetAll);
  }

  @Route("get", "/get/:id")
  @MySQLGet("publishers")
  get(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlGet);
  }

  @Route("post", "/create")
  @MySQLCreate("publishers")
  create(req: Request, res: Response, next: NextFunction) {
    return res.status(201).json(req.mysqlCreate);
  }

  @Route("delete", "/delete/:id")
  @MySQLDelete("publishers")
  delete(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json({ message: "Publisher deleted" });
  }

  @Route("put", "/update/:id")
  @MySQLUpdate("publishers")
  update(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlUpdate);
  }
}

export default PublisherController;