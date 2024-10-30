import mongoose, { Document, Schema } from "mongoose";

export interface IRecipe extends Document {
  recipeId: string;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
  summary: string;
  ingredients: {
    id: string;
    name: string;
    amount: number;
    unit: string;
  }[];
  instructions: {
    number: number;
    instruction: string;
  }[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isVeryHealthy: boolean;
  healthScore: number;
}

const recipeSchema = new Schema<IRecipe>({
  recipeId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  image: { type: String, required: true },
  readyInMinutes: { type: Number },
  servings: { type: Number },
  sourceUrl: { type: String },
  summary: { type: String },
  ingredients: [
    {
      id: { type: String },
      name: { type: String },
      amount: { type: Number },
      unit: { type: String },
    },
  ],
  instructions: [
    {
      number: { type: Number },
      instruction: { type: String },
    },
  ],
  isVegetarian: { type: Boolean, default: false },
  isVegan: { type: Boolean, default: false },
  isGlutenFree: { type: Boolean, default: false },
  isVeryHealthy: { type: Boolean, default: false },
  healthScore: { type: Number, default: 0 },
});

const Recipe = mongoose.model<IRecipe>("Recipe", recipeSchema);
export default Recipe;
