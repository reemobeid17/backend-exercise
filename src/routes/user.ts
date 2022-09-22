import { Router } from "express";

import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user";
import { isAuth, isAdmin } from "../middleware/auth";

const userRouter = Router();

userRouter.get("/", getAllUsers);
userRouter.get("/:id", getUserById);
userRouter.put("/:id", isAuth, updateUser);
userRouter.delete("/:id", isAuth, isAdmin, deleteUser);

export default userRouter;
