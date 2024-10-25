import express, { Router } from "express";
import {
  registerUser,
  login,
  activateUser,
  logout,
  getUserProfile,
} from "../controller/userController";
import { isAuthenticated } from "../middleware/authMiddleware";

const router: Router = express.Router();

router.post("/register", registerUser);

router.post("/activate", activateUser);

router.post("/login", login);

router.get("/profile", isAuthenticated, getUserProfile);

router.post("/logout", logout);

export default router;
