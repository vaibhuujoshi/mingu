import { userSignup, userSignin, getUser } from "../services/userAuthService.js";
import { signupSchema, signinSchema } from "../validators/authValidator.js";
import generateToken from "../utils/generateToken.js";

async function userSignupHandler(req, res) {
    try {
        const parsed = signupSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(403).json({
                message: "Invalid Format"
            })
        }

        await userSignup(parsed.data);

        res.status(201).json({
            message: "You are signed up successfully"
        })

    } catch (err) {
        if (err.message === "USER_ALREADY_EXISTS") {
            return res.status(409).json({ message: err.message });
        }

        res.status(500).json({
            message: "There is some error from server side"
        })
    }
}

async function userSigninHandler(req, res) {
    try {
        const parsed = signinSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(403).json({
                message: "Invalid Format"
            })
        }

        const user = await userSignin(parsed.data);

        const token = generateToken(user._id, "user");

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 60 * 60 * 1000
        })

        res.status(200).json({
            message: "You are signed in Successfully"
        })

    } catch (err) {
        if (err.message === "USER_NOT_FOUND") {
            return res.status(404).json({ message: err.message });
        }

        if (err.message === "INVALID_PASSWORD") {
            return res.status(403).json({ message: err.message });
        }

        res.status(500).json({
            message: "There is some error from server side"
        })
    }
}

async function getUserHandler(req, res) {
    try {
        const user = await getUser(req.user.id);

        res.status(200).json(user);
    } catch (err) {
        if (err.message === "USER_NOT_FOUND") {
            return res.status(404).json({ message: err.message });
        }

        res.status(500).json({ message: "Server error" });
    }
}

export { userSignupHandler, userSigninHandler, getUserHandler };