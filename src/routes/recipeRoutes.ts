import express from "express";
import {
  getAllRecipes,
  searchRecipes,
  getRecipeDetails,
  saveRecipePreference,
  getUserSavedRecipes,
  getRecipeById,
  deleteRecipe,
} from "../controller/recipeController";
import { isAuthenticated } from "../middleware/authMiddleware";

const recipeRouter = express.Router();

recipeRouter.get("/all", getAllRecipes as express.RequestHandler);
recipeRouter.get(
  "/search",
  isAuthenticated,
  searchRecipes as express.RequestHandler
);
recipeRouter.get("/:recipeId", getRecipeDetails);
recipeRouter.post(
  "/save",
  isAuthenticated,
  saveRecipePreference as express.RequestHandler
);
recipeRouter.get(
  "/saved-recipes",
  isAuthenticated,
  getUserSavedRecipes as express.RequestHandler
);
recipeRouter.get(
  "/saved-recipes/:id",
  isAuthenticated,
  getRecipeById as express.RequestHandler
);
recipeRouter.delete(
  "/delete/:recipeId",
  isAuthenticated,
  deleteRecipe as express.RequestHandler
);

export default recipeRouter;
