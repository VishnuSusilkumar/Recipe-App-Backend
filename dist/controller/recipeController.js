"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRecipe = exports.getRecipeById = exports.getUserSavedRecipes = exports.saveRecipePreference = exports.getRecipeDetails = exports.searchRecipes = exports.getAllRecipes = void 0;
const axios_1 = __importDefault(require("axios"));
const recipeModel_1 = __importDefault(require("../model/recipeModel"));
const userModel_1 = __importDefault(require("../model/userModel"));
const SPOONACULAR_API_URL = "https://api.spoonacular.com/recipes";
const API_KEY = process.env.SPOONACULAR_API_KEY;
const getAllRecipes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = 10;
    try {
        const response = yield axios_1.default.get(`${SPOONACULAR_API_URL}/complexSearch?apiKey=${API_KEY}&number=${query}`, {
            params: {
                addRecipeInformation: true,
            },
        });
        res.json({ success: true, data: response.data.results });
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ success: false, message: "Failed to fetch recipes" });
    }
});
exports.getAllRecipes = getAllRecipes;
const searchRecipes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { query } = req.query;
    if (!query) {
        return res
            .status(400)
            .json({ success: false, message: "Query is required" });
    }
    try {
        const response = yield axios_1.default.get(`${SPOONACULAR_API_URL}/complexSearch`, {
            params: {
                query,
                number: 20,
                apiKey: API_KEY,
                addRecipeInformation: true,
            },
        });
        const recipes = response.data.results;
        res.status(200).json({ success: true, recipes });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.searchRecipes = searchRecipes;
const getRecipeDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { recipeId } = req.params;
    try {
        const response = yield axios_1.default.get(`${SPOONACULAR_API_URL}/${recipeId}/information`, {
            params: {
                apiKey: API_KEY,
            },
        });
        const recipe = response.data;
        const ingredients = recipe.extendedIngredients.map((ingredient) => ({
            id: ingredient.id,
            name: ingredient.name,
            amount: ingredient.amount,
            unit: ingredient.unit,
        }));
        const instructions = (_a = recipe.analyzedInstructions[0]) === null || _a === void 0 ? void 0 : _a.steps.map((step) => ({
            number: step.number,
            instruction: step.step,
        }));
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
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ success: false, message: "Failed to fetch recipe details" });
    }
});
exports.getRecipeDetails = getRecipeDetails;
const saveRecipePreference = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { recipeId } = req.body;
    try {
        let recipe = yield recipeModel_1.default.findOne({ recipeId });
        if (!recipe) {
            const response = yield axios_1.default.get(`${SPOONACULAR_API_URL}/${recipeId}/information`, {
                params: { apiKey: API_KEY },
            });
            console.log("Response", response);
            const { id, title, image, readyInMinutes, servings, sourceUrl, summary, extendedIngredients, analyzedInstructions, vegetarian, vegan, glutenFree, veryHealthy, healthScore, } = response.data;
            const ingredients = extendedIngredients.map((ingredient) => ({
                id: ingredient.id,
                name: ingredient.name,
                amount: ingredient.amount,
                unit: ingredient.unit,
            }));
            const instructions = (_b = analyzedInstructions[0]) === null || _b === void 0 ? void 0 : _b.steps.map((step) => ({
                number: step.number,
                instruction: step.step,
            }));
            recipe = new recipeModel_1.default({
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
            yield recipe.save();
        }
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        if (user.savedRecipes.includes(recipe._id)) {
            return res
                .status(400)
                .json({ success: false, message: "Recipe already saved" });
        }
        user.savedRecipes.push(recipe._id);
        yield user.save();
        res
            .status(200)
            .json({ success: true, message: "Recipe saved successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.saveRecipePreference = saveRecipePreference;
const getUserSavedRecipes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const user = yield userModel_1.default.findById(userId).populate("savedRecipes");
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.getUserSavedRecipes = getUserSavedRecipes;
const getRecipeById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        let recipe = yield recipeModel_1.default.findOne({ _id: id });
        if (!recipe) {
            return res
                .status(404)
                .json({ success: false, message: "Recipe not found" });
        }
        res.status(200).json({ success: true, recipeDetails: recipe });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to fetch recipe" });
    }
});
exports.getRecipeById = getRecipeById;
const deleteRecipe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { recipeId } = req.params;
    try {
        const recipe = yield recipeModel_1.default.findById(recipeId);
        if (!recipe) {
            return res
                .status(404)
                .json({ success: false, message: "Recipe not found" });
        }
        yield recipeModel_1.default.deleteOne({ _id: recipeId });
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        user.savedRecipes = user.savedRecipes.filter((savedRecipeId) => !savedRecipeId.equals(recipeId));
        yield user.save();
        res
            .status(200)
            .json({ success: true, message: "Recipe deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ success: false, message: "Failed to delete recipe" });
    }
});
exports.deleteRecipe = deleteRecipe;
