import { hash, compare} from "bcryptjs"

export const hashPassword = (pwd: string) => hash(pwd, 10);
export const comparePassword = (pwd: string, hash: string) => compare(pwd, hash);