import { Request, Response } from "express";
import mongoose from "mongoose";
import axios from "axios";
import Recipe from "../model/recipeModel";
import User from "../model/userModel";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const SPOONACULAR_API_URL = "https://api.spoonacular.com/recipes";
const API_KEY = process.env.SPOONACULAR_API_KEY;

export const getAllRecipes = async (req: Request, res: Response) => {
  const query = 10;

  try {
    const response = await axios.get(
      `${SPOONACULAR_API_URL}/complexSearch?apiKey=${API_KEY}&number=${query}`,
      {
        params: {
          addRecipeInformation: true,
        },
      }
    );


    res.json({ success: true, data: response.data.results });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch recipes" });
  }
};

export const searchRecipes = async (req: Request, res: Response) => {
  const { query } = req.query;

  if (!query) {
    return res
      .status(400)
      .json({ success: false, message: "Query is required" });
  }

  try {
    const response = await axios.get(`${SPOONACULAR_API_URL}/complexSearch`, {
      params: {
        query,
        number: 20,
        apiKey: API_KEY,
        addRecipeInformation: true,
      },
    });
    const recipes = response.data.results;

    res.status(200).json({ success: true, recipes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getRecipeDetails = async (req: Request, res: Response) => {
  const { recipeId } = req.params;

  try {
    const response = await axios.get(
      `${SPOONACULAR_API_URL}/${recipeId}/information`,
      {
        params: {
          apiKey: API_KEY,
        },
      }
    );

    const recipe = response.data;

    const ingredients = recipe.extendedIngredients.map((ingredient: any) => ({
      id: ingredient.id,
      name: ingredient.name,
      amount: ingredient.amount,
      unit: ingredient.unit,
    }));

    const instructions = recipe.analyzedInstructions[0]?.steps.map(
      (step: any) => ({
        number: step.number,
        instruction: step.step,
      })
    );

    const recipeDetails = {
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      readyInMinutes: recipe.readyInMinutes,
      servings: recipe.servings,
      sourceUrl: recipe.sourceUrl,
      summary: recipe.summary,
      ingredients,
      instructions,
    };

    res.status(200).json({ success: true, recipeDetails });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch recipe details" });
  }
};

export const saveRecipePreference = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.id;
  const { recipeId } = req.body;

  try {
    let recipe = await Recipe.findOne({ recipeId });

    if (!recipe) {
      const response = await axios.get(
        `${SPOONACULAR_API_URL}/${recipeId}/information`,
        {
          params: { apiKey: API_KEY },
        }
      );
      console.log("Response", response);

      const {
        id,
        title,
        image,
        readyInMinutes,
        servings,
        sourceUrl,
        summary,
        extendedIngredients,
        analyzedInstructions,
        vegetarian,
        vegan,
        glutenFree,
        veryHealthy,
        healthScore,
      } = response.data;

      const ingredients = extendedIngredients.map((ingredient: any) => ({
        id: ingredient.id,
        name: ingredient.name,
        amount: ingredient.amount,
        unit: ingredient.unit,
      }));

      const instructions = analyzedInstructions[0]?.steps.map((step: any) => ({
        number: step.number,
        instruction: step.step,
      }));

      recipe = new Recipe({
        recipeId: id,
        title,
        image,
        readyInMinutes,
        servings,
        sourceUrl,
        summary,
        ingredients,
        instructions,
        isVegetarian: vegetarian,
        isVegan: vegan,
        isGlutenFree: glutenFree,
        isVeryHealthy: veryHealthy,
        healthScore: healthScore,
      });

      await recipe.save();
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.savedRecipes.includes(recipe._id as mongoose.Types.ObjectId)) {
      return res
        .status(400)
        .json({ success: false, message: "Recipe already saved" });
    }

    user.savedRecipes.push(recipe._id as mongoose.Types.ObjectId);
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Recipe saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUserSavedRecipes = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.id;

  try {
    const user = await User.findById(userId).populate("savedRecipes");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.savedRecipes.length === 0) {
      return res
        .status(200)
        .json({ success: false, message: "No saved recipes found." });
    }

    res.status(200).json({ success: true, savedRecipes: user.savedRecipes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getRecipeById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    let recipe = await Recipe.findOne({ _id: id });

    if (!recipe) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }

    res.status(200).json({ success: true, recipeDetails: recipe });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch recipe" });
  }
};

export const deleteRecipe = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.id; 
  const { recipeId } = req.params; 

  try {

    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }

    await Recipe.deleteOne({ _id: recipeId });

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.savedRecipes = user.savedRecipes.filter(
      (savedRecipeId) => !savedRecipeId.equals(recipeId)
    );
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Recipe deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete recipe" });
  }
};
