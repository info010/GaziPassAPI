import { Request , Response , NextFunction } from "express";
import { Controller } from "@/server/decorators/controller";
import { Route } from "@/server/decorators/route";

@Controller()
class MainController {
    @Route("get", "/healthcheck")
    @Route("post", "/healthcheck")
    getHealthCheck(req: Request, res: Response, next: NextFunction) {
        logging.log("Healthcheck called successfully!");
        return res.status(200).json({ hello : "world", ...req.body});
    }
}

export default MainController;