import { z } from "zod";
import { UserRecipeZodel } from "./UserRecipeZodel.js";

export const RecipeIngredientZodel = z.object({
  id: z.number().optional(),
  quantity: z.string(),
  recipe_id: z.number().optional(),
  ingredient_id: z.number().optional(),
  name: z.string().optional(),
});

const IngredientZodel = z.object({
  id: z.number().optional(),
  name: z.string({ required_error: `"name" is required` }).toLowerCase().trim(),
  RecipeIngredient: RecipeIngredientZodel,
  // *** Added tags
  tags: z.array(z.string()),
});

export const RecipeStepZodel = z.object({
  id: z.number().optional(),
  // *** Renamed step to description
  description: z.string(),
  recipe_id: z.number().optional(),
  step_number: z.number(),
  // *** Added ingredients
  ingredients: z
  .array(
    z.object({
      name: z.string(), // Ingredient name
      quantity: z.union([z.string(), z.number()]), // Quantity for this step
      unit: z.string(), // Unit of measurement
    })
  ),
});

export const RecipeZodel = z.object({
  id: z
    .number()
    .nullish()
    .optional()
    .transform((x) => x ?? null),
    // *** Renamed name to title
  title: z.string({ required_error: `"title" is required` }).toLowerCase().trim(),
  difficulty: z.string({ required_error: `"difficulty" is required` }),
  description: z.string({ required_error: 'description is required'}),
  preparationTime: z.number({ required_error: `"preparationTime" is required` }),
  cookingTime: z.number({ required_error: `"cookingTime" is required` }),
  tags: z.array(z.string()),
  servings: z.number(),
  // *** Removed mealdb_id
  image: z
    .string()
    .nullish()
    .transform((x) => x ?? null),
  video: z
    .string()
    .nullish()
    .transform((x) => x ?? null),
  Ingredients: z.array(IngredientZodel),
  RecipeSteps: z.array(RecipeStepZodel).transform((steps) =>
    steps.map((step, index) => {
      return {
        ...step,
        step_number: index + 1,
      };
    }),
  ),
  // *** Just for testing
  // UserRecipes: z.array(UserRecipeZodel),
});

export type RecipeZype = z.infer<typeof RecipeZodel>;
export type IngredientZype = z.infer<typeof IngredientZodel>;
export type RecipeIngredientZype = z.infer<typeof RecipeIngredientZodel>;
export type RecipeStepZype = z.infer<typeof RecipeStepZodel>;
