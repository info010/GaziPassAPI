import http from "http";
import express, { RequestHandler } from "express";
import logging from "@/server/config/loggins";

import { loggingHandler } from "@/server/middleware/loggingHandler";
import { corsHandler } from "@/server/middleware/corsHandler";
import { routeNotFound } from "@/server/middleware/routeNotFound";
import { server, SERVER_HOSTNAME, SERVER_PORT } from "@/server/config/config";
import "reflect-metadata";
import { defineRoutes } from "@/server/modules/routes";
import { checkConnection, createTables } from "@/utils/db";
import { declareHandler } from "./middleware/declareHandler";
import AuthController from "@/server/controllers/auth/controller";
import UsersController from "@/server/controllers/users/controller";
import PostsController from "@/server/controllers/posts/controller";
import { jsonHandler } from "./middleware/jsonHandler";
// import { functionHandler } from "./middleware/functionHandler";
import cookieParser from "cookie-parser";

export const application = express();
export let httpServer: ReturnType<typeof http.createServer>;

export const Main = async () => {
  logging.log("Initilazin GaziPassAPI");
  application.use(express.urlencoded({ extended: true }));
  application.use(express.json());
  application.use(jsonHandler);
//  application.use(functionHandler);

  logging.log("Logging & Configuration");

  await checkConnection();
  await createTables();

  application.use(declareHandler);
  application.use(loggingHandler);
  application.use(corsHandler as RequestHandler);
  application.use(cookieParser());

  logging.log("Define Controller Routing");
  defineRoutes(
    [
      AuthController,
      UsersController,
      PostsController,
    ],
    application
  );

  logging.log("Define Controller Routing");
  application.use(routeNotFound);

  logging.log("Start Server");
  httpServer = http.createServer(application);
  httpServer.listen(server.SERVER_PORT, () => {
    logging.info("Server started: " + SERVER_HOSTNAME + ":" + SERVER_PORT);
  });
};

export const Shutdown = (callback: any) =>
  httpServer && httpServer.close(callback);

Main();
