import { Request, Response, NextFunction } from "express";
import { Controller } from "@/server/decorators/controller";
import { Route } from "@/server/decorators/route";
import { MySQLGetAll } from "@/server/decorators/mysql/getAll";
import { MySQLQuery } from "@/server/decorators/mysql/query";
import { GetUser } from "@/services/user/getUser";
import { FollowTag } from "@/services/user/tags/followTag";
import { UnfollowTag } from "@/services/user/tags/unfollowTag";
import { FollowPublisher } from "@/services/user/publishers/followPublisher";
import { UnfollowPublisher } from "@/services/user/publishers/unfollowPublisher";
import { AddFavorite } from "@/services/user/favoriteposts/addFavoritePost";
import { RemoveFavorite } from "@/services/user/favoriteposts/removeFavoritePost";
import { UpdateUser } from "@/services/user/updateUser";
import { authenticateToken } from "@/server/middleware/authenticateToken";

@Controller("/users")
class UserController {
  
  @Route("get", "/getall")
  @MySQLGetAll("users")
  getAll(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlGetAll);
  }

  @Route("get", "/get/:id")
  @GetUser()
  get(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.user);
  }

  @Route("post", "/follow-tag")
  @FollowTag()
  followTag(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json({ message: "Tag's followed" });
  }

  @Route("delete", "/unfollow-tag/:user_id/tag/:tag")
  @UnfollowTag()
  unfollowTag(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json({ message: "Tag's unfollowed" });
  }

  @Route("get", "/getTags/:id")
  @GetUser()
  getFollowingTags(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.user?.following_tags);
  }

  @Route("post", "/follow-publisher")
  @FollowPublisher()
  followPublisher(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json({ message: "Publisher's followed" });
  }

  @Route("delete", "/unfollow-publisher/:user_id/publisher/:publisher_id")
  @UnfollowPublisher()
  unfollowPublisher(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json({ message: "Publisher's unfollowed" });
  }

  @Route("get", "/getPublishers/:id")
  @GetUser()
  getFollowingPublisher(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.user?.following_publishers);
  }

  @Route("post", "/add-favorite")
  @AddFavorite()
  addFavorite(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json({ message: "Post's added favorites" });
  }

  @Route("delete", "/remove-favorite/:user_id/post/:post_id")
  @RemoveFavorite()
  removeFavorite(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json({ message: "Post's removed favorites" });
  }

  @Route("get", "/getFavorites/:id")
  @GetUser()
  getFavorites(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.user?.favorites);
  }

  @Route("put", "/update/:id")
  @UpdateUser()
  update(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.user);
  }

  @Route("post", "/search")
  @MySQLQuery("users")
  query(req: Request, res: Response, next: NextFunction) {
    return res.status(200).json(req.mysqlGetAll);
  }
}

export default UserController;