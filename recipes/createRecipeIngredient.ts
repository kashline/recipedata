import RecipeIngredient from "../models/RecipeIngredient.js";
import { RecipeIngredientZype } from "../Recipe.js";

export default async function createRecipeIngredient(
  recipeIngredient: RecipeIngredientZype,
) {
  try {
    await RecipeIngredient.sync().catch((err) => {
      console.log(err);
    });
    const res = await RecipeIngredient.findOrCreate({
      where: {
        recipe_id: recipeIngredient.recipe_id,
        ingredient_id: recipeIngredient.ingredient_id,
      },
      defaults: {
        ...recipeIngredient,
      },
    }).catch((err) => {
      console.log(err);
    });
    if (res![0].dataValues.quantity !== recipeIngredient.quantity) {
      res![0].set({
        quantity: recipeIngredient.quantity,
      });
      await res![0].save({ fields: ["quantity"] });
    }
  } catch (error) {
    console.log(`There was an error in createRecipeIngredient: ${error}`);
  }
}
