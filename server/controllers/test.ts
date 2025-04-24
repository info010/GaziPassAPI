import { Request , Response , NextFunction } from "express";
import { Controller } from "@/server/decorators/controller";
import { Route } from "@/server/decorators/route";
import Joi from "joi";
import { Validate } from "@/server/middleware/validate";

const postHealthCheckValidation = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email()
});

@Controller()
class TestController {
    @Route("get", "/healthcheck")
    getHealthCheck(req: Request, res: Response, next: NextFunction) {
        logging.log("Healthcheck called successfully!");
        return res.status(200).json({ hello : "world" });
    }

    @Route("post", "/healthcheck")
    @Validate(postHealthCheckValidation)
    postHealthCheck(req: Request, res: Response, next: NextFunction) {
        logging.log("Healthcheck called successfully!");
        return res.status(200).json({ hello : "world", ...req.body});
    }
}

export default TestController;