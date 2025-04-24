import http from "http"
import express, { RequestHandler } from "express"
import logging from '@/server/config/loggins';

import { loggingHandler } from "@/server/middleware/loggingHandler";
import { corsHandler } from "@/server/middleware/corsHandler";
import { routeNotFound } from '@/server/middleware/routeNotFound';
import { server, SERVER_HOSTNAME, SERVER_PORT } from "@/server/config/config";
import "reflect-metadata";
import { defineRoutes } from "@/server/modules/routes";
import MainController from "@/server/controllers/main";

export const application = express();
export let httpServer: ReturnType<typeof http.createServer>;

export const Main = () => {
    logging.log("Initilazin GaziPassAPI");
    application.use(express.urlencoded({ extended: true }));
    application.use(express.json());
    
    logging.log("Logging & Configuration");

    application.use(loggingHandler);
    application.use(corsHandler as RequestHandler);

    logging.log("Define Controller Routing")
    defineRoutes([MainController], application);

    /*
    application.get("/main/healthcheck", (req, res, next) => {
        return res.status(200).json({
            hello: "world!"
        });
    });
    */

    logging.log("Define Controller Routing");
    application.use(routeNotFound);

    logging.log("Start Server");
    httpServer = http.createServer(application);
    httpServer.listen(server.SERVER_PORT, () => {
        logging.info("Server started: " + SERVER_HOSTNAME + ":" + SERVER_PORT);
    });
}

export const Shutdown = (callback: any) => httpServer && httpServer.close(callback);

Main();