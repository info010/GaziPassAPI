import { Request, Response, NextFunction } from "express";

export const functionHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const originalSend = res.send;

  res.send = function (body?: any): Response {
    const err = new Error();
    const stack = err.stack?.split("\n");

    if (stack) {
      const handlerLine = stack.find(line =>
        line.includes("at") &&
        line.includes(".ts") &&
        !line.includes("node_modules")
      );

      if (handlerLine) {
        const match = handlerLine.trim().match(/at (\w+)/);
        if (match && match[1]) {
          const functionName = match[1];
          console.log(`[FunctionHandler] Called function: ${functionName}`);
        }
      }
    }

    return originalSend.call(this, body);
  };

  next();
};
