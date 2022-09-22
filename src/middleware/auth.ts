import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import TokenPayload from "./../models/token";

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      const token = req.headers.authorization.split("Bearer ")[1];
      const payload = jwt.verify(token, process.env.JWT_SECRET!);
      req.user = payload as TokenPayload;
    } else {
      return res.status(404).json({ error: "No token found" });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      error,
    });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user.role === "admin") {
      next();
    } else {
      return res.status(401).json({
        error: "Unauthorized! You need to be an admin.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      error,
    });
  }
};
