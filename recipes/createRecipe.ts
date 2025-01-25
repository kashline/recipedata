import Recipe from "../models/Recipe.js";
import {
  RecipeZype,
  RecipeIngredientZodel,
  RecipeStepZodel,
} from "../Recipe.js";
import createIngredient from "./createIngredients.js";
import createRecipeIngredient from "./createRecipeIngredient.js";
import createRecipeStep from "./createRecipeStep.js";
import _ from "lodash";

export default async function createRecipe(recipe: RecipeZype) {
  try {
      const res = await Recipe.findOrCreate({
        where: {
          title: recipe.title,
        },
        defaults: {
        title: recipe.title,
        description: recipe.description,
        difficulty: recipe.difficulty,
        preparationTime: recipe.preparationTime,
        cookingTime: recipe.cookingTime,
        image: "undefined",
        video: "undefined",
        tags: recipe.tags,
        servings: recipe.servings,
        }
      }).catch((err) => {
        console.log(err);
      });
      if (res === null || typeof res !== 'object'){
        throw new Error('CreateRecipe findOrCreate returned null or non-object')
      }
      recipe.Ingredients.map(async (ingredient) => {
        const newIngredient = await createIngredient(ingredient);
        await createRecipeIngredient(
          RecipeIngredientZodel.parse({
            quantity: ingredient.RecipeIngredient.quantity,
            recipe_id: res[0].dataValues.id,
            ingredient_id: newIngredient?.dataValues.id,
          })
        );
      });
      recipe.RecipeSteps.map(async (step) => {
        await createRecipeStep(
          RecipeStepZodel.parse({
            description: step.description,
            recipe_id: res[0].dataValues.id,
            step_number: step.step_number,
            ingredients: step.ingredients
          })
        );
      });
    return 1;
  } catch (error) {
    console.log(`There was an error in createRecipe: ${error}`);
  }
}
