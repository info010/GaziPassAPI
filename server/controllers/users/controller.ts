import { NextFunction, Request, Response } from 'express';
import { Controller } from '@/server/decorators/controller';
import { Route } from '@/server/decorators/route';
import { getUserById, getCurrentUser, addFavorite, removeFavorite } from './service';

@Controller('/users')
class UsersController {

    @Route('get', '/')
    async getAllUsers(req: Request, res: Response) {
        return res.status(200).json({ message: 'Getting All users' });
    }
    
    @Route('get', '/me')
    async getProfile(req: Request, res: Response) {
        await getCurrentUser(req, res)
        return res.status(200).json({ message: 'Getting current user profile', user: req.user });
    }
    
    @Route('get', '/:id')
    async getById(req: Request, res: Response) {
        const userId: bigint = BigInt(req.params.id);
        await getUserById(userId, req, res);
        return res.status(200).json({ message: `Getting user with ID: ${userId}`, user: req.user });
    }

    @Route('get', '/:id/posts')
    async getUserPosts(req: Request, res: Response) {
        const userId: bigint = BigInt(req.params.id);
        await getUserById(userId, req, res);
        return res.status(200).json({ message: `Getting posts for user with ID: ${userId}`, posts: req.user?.posts });
    }

    @Route('post', '/me/favorites')
    async getProfileFavorites(req: Request, res: Response) {
        await getCurrentUser(req, res);
        return res.status(200).json({ message: 'Getting current user favorites', favorites: req.user?.favorites });
    }

    @Route('post', '/me/favorites/:postId')
    async addProfileFavorite(req: Request, res: Response) {
        const postId: bigint = BigInt(req.params.postId);
        return await addFavorite(postId, req, res);
    }

    @Route('delete', '/me/favorites/:postId')
    async removeProfileFavorite(req: Request, res: Response) {
        const postId: bigint = BigInt(req.params.postId);
        return await removeFavorite(postId, req, res);
    }
    
    @Route('get', '/me/following-publishers')
    async getProfileFollowingPublishers(req: Request, res: Response) {
        await getCurrentUser(req, res);
        return res.status(200).json({ message: 'Getting current user following publishers', followingPublishers: req.user?.following_publishers });
    }

    @Route('post', '/me/following-tags')
    async getProfileFollowingTags(req: Request, res: Response) {
        await getCurrentUser(req, res);
        return res.status(200).json({ message: 'Getting current user following tags', followingTags: req.user?.following_tags });
    }

    @Route('patch', '/:id')
    async updateUser(req: Request, res: Response) {
        const userId = req.params.id;
        // Logic to update user by ID
        return res.status(200).json({ message: `Updating user with ID: ${userId}` });
    }

    @Route('delete', '/:id')
    async deleteUser(req: Request, res: Response) {
        const userId = req.params.id;
        // Logic to delete user by ID
        return res.status(200).json({ message: `Deleting user with ID: ${userId}` });
    }

/*     @Route('get', '/search')
    async searchUsers(req: Request, res: Response) {
        const query = req.query.q;
        // Logic to search users by query
        return res.status(200).json({ message: `Searching users with query: ${query}` });
    } */

}

