import { Request, Response, NextFunction } from "express";

export function UnfollowPublisher() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      try {
        const user_id = req.params.user_id;
        const publisher_id = req.params.publisher_id;

        if (!user_id || !publisher_id) {
          return res.status(400).json({ error: "Missing required fields" });
        }

        const result = await sql.deleteOne("user_following_publishers", ["user_id", "publisher_id"], user_id, publisher_id);

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Following status not found" });
        }

        req.body = result.affectedRows > 0;
      } catch (error) {
        console.error("[UnfollowPublisher Error]:", error);
        return res.status(500).json({ error: "Internal server error", detail: error });
      }

      return originalMethod.call(this, req, res, next);
    };

    return descriptor;
  };
}
