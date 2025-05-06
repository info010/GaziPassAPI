import { Request, Response, NextFunction } from "express";

export const jsonHandler = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;

  res.json = function (data: any) {
    const replacer = (_key: string, value: any) => {
      return typeof value === 'bigint' ? value.toString() : value;
    };

    const json = JSON.stringify(data, replacer);
    res.setHeader('Content-Type', 'application/json');
    return res.send(json);
  };

  next();
};