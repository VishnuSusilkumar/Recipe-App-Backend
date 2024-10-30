"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controller/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const authRouter = express_1.default.Router();
authRouter.post("/register", userController_1.registerUser);
authRouter.post("/activate", userController_1.activateUser);
authRouter.post("/login", userController_1.login);
authRouter.post("/refresh-token", userController_1.refreshToken);
authRouter.get("/profile", authMiddleware_1.isAuthenticated, userController_1.getUserProfile);
authRouter.post("/logout", userController_1.logout);
authRouter.get("/saved-recipes", authMiddleware_1.isAuthenticated, userController_1.getUserSavedRecipes);
exports.default = authRouter;
