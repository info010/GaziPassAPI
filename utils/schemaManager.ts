import { lepton  } from "@thehadron/lepton";

export const loginSchema = lepton.object({
    email: lepton.string(),
    password: lepton.string(),
}).strict();

export const signUpSchema = lepton.object({
    username: lepton.string(),
    email: lepton.string(),
    password: lepton.string(),
    repassword: lepton.string(),
    turnstileToken: lepton.string()
}).strict();

export const recoveryPasswordSchema = lepton.object({
    email: lepton.string(),
    turnstileToken: lepton.string()
}).strict();

export const recoveryUpdateSchema = lepton.object({
    password: lepton.string(),
    repassword: lepton.string(),
    url: lepton.string(),
    turnstileToken: lepton.string()
}).strict();

export const AuthUserSchema = lepton.object({
    id: lepton.bigint(),
    username: lepton.string(),
    email: lepton.string(),
    password: lepton.string()
}).strict();

export const SecretPayloadSchema = lepton.object({
    email: lepton.string(),
    token: lepton.string(),
    expire_at: lepton.bigint()
}).strict();

export const PublisherSchema = AuthUserSchema.omit(["password"]).extend({
    role: lepton.string().optional(), 
}).strict();

export const PostSchema = lepton.object({
    id: lepton.bigint(),
    title: lepton.string(),
    description: lepton.string(),
    upvote: lepton.uint32(),
    tags: lepton.array(lepton.string()),
    url: lepton.string(),
    publisher: PublisherSchema
}).strict();

export const UserSchema = PublisherSchema.extend({
    posts: lepton.array(PostSchema),
    favorites: lepton.array(PostSchema),
    following_tags: lepton.array(lepton.string()),
    following_publishers: lepton.array(PublisherSchema),
}).strict();

export type Login = lepton.infer<typeof loginSchema>

export type SecretPayload = lepton.infer<typeof SecretPayloadSchema>

export type AuthUser = lepton.infer<typeof AuthUserSchema>

export type Publisher = lepton.infer<typeof PublisherSchema>

export type Post = lepton.infer<typeof PostSchema>
 
export type User = lepton.infer<typeof UserSchema>