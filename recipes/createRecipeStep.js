import RecipeStep from "../models/RecipeStep.js";
export default async function createRecipeStep(recipeStep) {
    try {
        await RecipeStep.sync().catch((err) => {
            console.log(err);
        });
        await RecipeStep.destroy({
            where: {
                recipe_id: recipeStep.recipe_id,
            },
        });
        const res = await RecipeStep.findOrCreate({
            where: {
                recipe_id: recipeStep.recipe_id,
                step_number: recipeStep.step_number,
            },
            defaults: {
                ...recipeStep,
            },
        }).catch((err) => {
            console.log(err);
        });
        return res;
    }
    catch (error) {
        console.log(`There was an error in createRecipeSteps: ${error}`);
    }
}
