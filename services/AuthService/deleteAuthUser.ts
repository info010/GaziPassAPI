import { Request, Response, NextFunction } from "express";

export function DeleteAuthUser() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      try {
        const id = req.params.id;

        if (!id) {
          return res.status(400).json({ error: "Missing ID parameter." });
        }

        const result_user = await sql.deleteOne("users", ["id"], id);
        
        if (result_user.affectedRows === 0) {
          return res.status(404).json({ error: "User not found" });
        }
        
        await sql.deleteOne("user_favorites", ["user_id"], id);
        await sql.deleteOne("user_following_publishers", ["user_id"], id);
        await sql.deleteOne("user_following_tags", ["user_id"], id);

        const result_auth_user = await sql.deleteOne("auth_users", ["id"], id);

        if (result_auth_user.affectedRows === 0) {
          return res.status(404).json({ error: "AuthUser not found" });
        }

        req.body = result_user.affectedRows > 0 || result_auth_user.affectedRows > 0;
      } catch (error) {
        console.error("[DeleteAuthUser Error]:", error);
        return res.status(500).json({ error: "Delete failed", detail: error });
      }

      return originalMethod.call(this, req, res, next);
    };

    return descriptor;
  };
}
