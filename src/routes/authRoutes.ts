import express, { Router } from "express";
import {
  registerUser,
  login,
  refreshToken,
  activateUser,
  logout,
  getUserProfile,
  getUserSavedRecipes,
} from "../controller/userController";
import { isAuthenticated } from "../middleware/authMiddleware";

const authRouter: Router = express.Router();

authRouter.post("/register", registerUser);

authRouter.post("/activate", activateUser);

authRouter.post("/login", login);

authRouter.post("/refresh-token", refreshToken as express.RequestHandler);

authRouter.get("/profile", isAuthenticated, getUserProfile);

authRouter.post("/logout", logout);

authRouter.get(
  "/saved-recipes",
  isAuthenticated,
  getUserSavedRecipes as express.RequestHandler
);

export default authRouter;
