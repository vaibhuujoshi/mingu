import { z } from "zod";

const signupSchema = z.object({
    email: z.string().min(3).max(100).email(),
    password: z.string()
        .min(8, { message: "Password should have minimum length of 8" })
        .max(15, "Password is too long")
        .regex(/^(?=.*[A-Z]).{8,}$/, {
            message:
                "Should Contain at least one uppercase letter and have a minimum length of 8 characters.",
        }),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(0).max(100)
});

const signinSchema = z.object({
    email: z.string().min(3).max(100).email(),
    password: z.string()
        .min(8, { message: "Password should have minimum length of 8" })
        .max(15, "Password is too long")
        .regex(/^(?=.*[A-Z]).{8,}$/, {
            message:
                "Should Contain at least one uppercase letter and have a minimum length of 8 characters.",
        })
});

export { signupSchema, signinSchema };