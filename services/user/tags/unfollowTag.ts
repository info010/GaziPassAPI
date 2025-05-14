import { Request, Response, NextFunction } from "express";

export function UnfollowTag() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      try {
        const user_id = req.params.user_id;
        const tag = req.params.tag;

        if (!user_id || !tag) {
          return res.status(400).json({ error: "Missing required fields" });
        }

        const result = await sql.deleteOne("user_following_tags", ["user_id", "tag"], user_id, tag);

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Following status not found" });
        }

        req.body = result.affectedRows > 0;
      } catch (error) {
        console.error("[UnfollowTag Error]:", error);
        return res.status(500).json({ error: "Internal server error", detail: error });
      }

      return originalMethod.call(this, req, res, next);
    };

    return descriptor;
  };
}
