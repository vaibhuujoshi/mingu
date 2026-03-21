import UserModel from "../models/user.js";
import bcrypt from "bcrypt";

async function userSignup(data) {
    const { email, password, firstName, lastName } = data;

    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
        throw new Error("USER_ALREADY_EXISTS");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
        email,
        password: hashedPassword,
        firstName,
        lastName
    })

    return user;
}

async function userSignin(data) {
    const { email, password } = data;

    const user = await UserModel.findOne({ email });

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        throw new Error("INVALID_PASSWORD");
    }

    return user;
}

async function getUser(userId) {
    const user = await UserModel.findById(userId).select("-password");

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    return user;
}

export { userSignup, userSignin, getUser };