import { Request, Response } from "express";
import * as bcrypt from "bcrypt";

import getToken from "../util/getToken";
import userRepository from "../persistence/repositories/userRepository";
import userSchema from "../validation/user";
import redisClient from "../redis/redisClient";
import { EXPIRY_TIME } from "../util/constants";
import saveLogs from "../util/saveLogs";

export const signup = async (req: Request, res: Response) => {
  try {
    const { error } = userSchema.validate({ ...req.body, required: true });

    if (error) {
      const errorMessage = error.details[0].message;
      saveLogs("Registration Attempt", "Validation errors", false);

      return res.status(400).json({ error: errorMessage });
    }

    const { email: userEmail, password: userPassword } = req.body;
    const foundUser = await userRepository.getUserByEmail(userEmail);

    if (foundUser) {
      saveLogs("Registration Attempt", "Email already exists", false);

      return res.status(400).json({ error: "This email already exists" });
    }

    const hash = await bcrypt.hash(userPassword, 10);
    const body = {
      ...req.body,
      password: hash,
    };

    const { id, email, role } = await userRepository.insertUser(body);
    const token = getToken(id, email, role);

    await redisClient.zAdd("usersId", { score: id, value: `user:${id}` });
    await redisClient.hSet(`user:${id}`, {
      id,
      ...req.body,
      role: "user",
      password: "",
      createdAt: "",
    });

    await redisClient.expire(`user:${id}`, EXPIRY_TIME);

    saveLogs("Registration Attempt", "Successful", true);

    return res.status(201).json({
      message: "User added successfully",
      token,
      id,
    });
  } catch (error: any) {
    return res.status(500).json({ error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const { error } = userSchema.validate({ email });

    if (error) {
      const errorMessage = error.details[0].message;
      saveLogs("Login Attempt", "Validation errors", false);

      return res.status(400).json({ error: errorMessage });
    }

    const foundUser = await userRepository.getUserByEmail(email);

    if (!foundUser) {
      saveLogs("Login Attempt", "User not found", false);

      return res.status(404).json({ error: "User not found" });
    } else {
      const isValid = await bcrypt.compare(password, foundUser.password);

      if (!isValid) {
        saveLogs("Login Attempt", "Invalid credentials", false);

        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = getToken(foundUser.id, foundUser.email, foundUser.role);

      saveLogs("Login Attempt", "Successful", true);

      return res.status(200).json({
        token,
        id: foundUser.id,
      });
    }
  } catch (error: any) {
    return res.status(500).json({ error });
  }
};
