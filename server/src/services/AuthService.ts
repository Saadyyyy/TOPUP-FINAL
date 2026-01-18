import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel, User } from "../models/UserModel";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export class AuthService {
  static async login(username: string, password: string) {
    const user = await UserModel.findByUsername(username);
    if (!user) {
      throw { statusCode: 401, message: "Invalid credentials" };
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw { statusCode: 401, message: "Invalid credentials" };
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    return { user, token };
  }

  static async register(userData: User) {
    // Check if user exists
    const existingUser = await UserModel.findByUsername(userData.username);
    if (existingUser) {
      throw { statusCode: 400, message: "User already exists" };
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(userData.password_hash, salt);

    const newUser = await UserModel.create({
      ...userData,
      password_hash,
    });

    return newUser;
  }
}
