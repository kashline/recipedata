import Ingredient from "../models/Ingredient.js";
import { IngredientZype } from "../Recipe.js";

export default async function createIngredient(ingredient: IngredientZype) {
  try {
    await Ingredient.sync().catch((err) => {
      console.log(err);
    });
    const res = await Ingredient.findOrCreate({
      where: {
        name: ingredient.name,
      },
      defaults: {
        name: ingredient.name,
        tags: ingredient.tags
      },
    }).catch((err) => {
      console.log(err);
    });
    return await res![0].save();
  } catch (error) {
    console.log(`There was an error in createIngredient: ${error}`);
  }
}
