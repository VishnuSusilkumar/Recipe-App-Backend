"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const recipeController_1 = require("../controller/recipeController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const recipeRouter = express_1.default.Router();
recipeRouter.get("/all", recipeController_1.getAllRecipes);
recipeRouter.get("/search", authMiddleware_1.isAuthenticated, recipeController_1.searchRecipes);
recipeRouter.get("/:recipeId", recipeController_1.getRecipeDetails);
recipeRouter.post("/save", authMiddleware_1.isAuthenticated, recipeController_1.saveRecipePreference);
recipeRouter.get("/saved-recipes", authMiddleware_1.isAuthenticated, recipeController_1.getUserSavedRecipes);
recipeRouter.get("/saved-recipes/:id", authMiddleware_1.isAuthenticated, recipeController_1.getRecipeById);
recipeRouter.delete("/delete/:recipeId", authMiddleware_1.isAuthenticated, recipeController_1.deleteRecipe);
exports.default = recipeRouter;
