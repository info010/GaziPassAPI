import { lepton  } from "@thehadron/lepton";

export const loginSchema = lepton.object({
    email: lepton.string(),
    password: lepton.string(),
    turnstileToken: lepton.string()
});

export const signUpSchema = lepton.object({
    username: lepton.string(),
    email: lepton.string(),
    password: lepton.string(),
    repassword: lepton.string(),
    turnstileToken: lepton.string()
});

export const recoveryPasswordSchema = lepton.object({
    email: lepton.string(),
    turnstileToken: lepton.string()
})

export const recoveryUpdateSchema = lepton.object({
    password: lepton.string(),
    repassword: lepton.string(),
    url: lepton.string(),
    turnstileToken: lepton.string()
})

export const SecretPayloadSchema = lepton.object({
    email: lepton.string(),
    token: lepton.string(),
    expires_at: lepton.bigint(),
    create_at: lepton.bigint()
});

export const PublisherSchema = lepton.object({
    id: lepton.bigint(),
    username: lepton.string(),
    email: lepton.string(),
    verification: lepton.string().optional(),
});

export const PostSchema = lepton.object({
    id: lepton.bigint(),
    title: lepton.string(),
    description: lepton.string(),
    upvote: lepton.uint32(),
    tags: lepton.array(lepton.string()),
    url: lepton.string(),
    publisher: PublisherSchema
});

export const UserSchema = PublisherSchema.extend({
    signupTime: lepton.bigint(),
    posts: lepton.array(PostSchema),
    favorites: lepton.array(PostSchema),
    following_tags: lepton.array(lepton.string()),
    following_publishers: lepton.array(PublisherSchema),
});

export const AuthUserSchema = PublisherSchema.omit(["verification"]).extend({
    password: lepton.string()
});

export type SecretPayload = lepton.infer<typeof SecretPayloadSchema>

export type AuthUser = lepton.infer<typeof AuthUserSchema>

export type Publisher = lepton.infer<typeof PublisherSchema>

export type Post = lepton.infer<typeof PostSchema>
 
export type User = lepton.infer<typeof UserSchema>