import { Request, Response, NextFunction } from "express";
import { db } from "@/utils/db";
import { ResultSetHeader } from "mysql2";

export function RemoveFavorite() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      try {
        const user_id = req.params.user_id;
        const post_id = req.params.post_id;

        if (!user_id || !post_id) {
          return res.status(400).json({ error: "Missing required fields" });
        }

        const [result] = await db.query<ResultSetHeader>(
          "DELETE FROM user_favorites WHERE user_id = ? AND post_id = ?",
          [user_id ,post_id]
        ); 

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Favorite status not found" });
        }

        req.body = result.affectedRows > 0;
      } catch (error) {
        console.error("[RemoveFavorite Error]:", error);
        return res.status(500).json({ error: "Internal server error", detail: error });
      }

      return originalMethod.call(this, req, res, next);
    };

    return descriptor;
  };
}
