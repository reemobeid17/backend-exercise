import { Request, Response } from "express";
import * as bcrypt from "bcrypt";

import userRepository from "../persistence/repositories/userRepository";
import userSchema from "../validation/user";
import redisClient from "../redis/redisClient";
import getCachedUsers from "../util/getCachedUsers";
import { EXPIRY_TIME } from "../util/constants";
import saveLogs from "../util/saveLogs";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10);
    const pageSize = parseInt(req.query.pageSize as string, 10);
    const usersId = await redisClient.zRange("usersId", 0, -1, { REV: true });

    let response = null;
    if (usersId.length) {
      if (page >= 0 && pageSize >= 0) {
        response = await getCachedUsers(usersId, page, pageSize);
      } else {
        response = await getCachedUsers(usersId);
      }
    } else {
      response = await userRepository.getUsers();

      for (const user of response) {
        await redisClient.hSet(`user:${user.id}`, user as any);
        await redisClient.expire(`user:${user.id}`, EXPIRY_TIME);
        await redisClient.zAdd("usersId", {
          score: user.id,
          value: `user:${user.id}`,
        });
      }
    }

    saveLogs("Get Multiple Users Attempt", "Successful", true);

    return res.status(200).json(response);
  } catch (error: any) {
    return res.status(500).json({ error });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const user = await redisClient.hGetAll(`user:${id}`);

    if (Object.keys(user).length) {
      saveLogs("Get a User Attempt", "Successful", true);

      return res.status(200).json(user);
    } else {
      const response = await userRepository.getUserById(id);
      if (!response) {
        saveLogs("Get a User Attempt", "User not found", false);

        return res.status(404).json({ error: "User not found" });
      }

      await redisClient.hSet(`user:${id}`, response as any);
      await redisClient.expire(`user:${id}`, EXPIRY_TIME);

      saveLogs("Get a User Attempt", "Successful", true);

      return res.status(200).json(response);
    }
  } catch (error: any) {
    return res.status(500).json({ error });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { body } = req;
    const { error } = userSchema.validate(body);
    if (error) {
      const errorMessage = error.details[0].message;
      return res.status(400).json({ error: errorMessage });
    }
    if (id !== req.user.id && req.user.role === "user") {
      saveLogs(
        "Update a User Attempt",
        "Unauthorized user editing attempt",
        false
      );

      return res
        .status(401)
        .json({ error: "You can't edit someone else's data" });
    }
    if (req.user.role !== "admin" && body.role) {
      saveLogs(
        "Update a User Attempt",
        "Unauthorized role editing attempt",
        false
      );

      return res
        .status(401)
        .json({ error: "You're unauthorized to change a role'" });
    }
    const foundUser = await userRepository.getUserByEmail(body.email);
    if (foundUser) {
      saveLogs("Update a User Attempt", "Email already exists", false);

      return res.status(400).json({ error: "This email already exists" });
    }

    if (body.password) {
      const hash = await bcrypt.hash(body.password, 10);
      body.password = hash;
    }

    const response = await userRepository.updateUser(id, body);
    await redisClient.hSet(`user:${id}`, response as any);
    await redisClient.expire(`user:${id}`, EXPIRY_TIME);

    saveLogs("Update a User Attempt", "Successful", true);

    return res.status(200).json(response);
  } catch (error: any) {
    return res.status(500).json({ error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { rowCount } = await userRepository.deleteUser(id);
    await redisClient.zRem("usersId", `user:${id}`);
    await redisClient.del(`user:${id}`);

    if (rowCount === 0) {
      saveLogs("Delete a User Attempt", "User not found", false);

      return res.status(404).json({ error: "User not found for deletion" });
    }

    saveLogs("Delete a User Attempt", "Successful", true);

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error });
  }
};
