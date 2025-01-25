import { z } from "zod";

const ingredientSchema = z.object({
  name: z.string(),
  quantity: z.union([z.string(), z.number()]),
  unit: z.string(), // e.g., "grams", "cups"
  tags: z.array(z.string()),
});

const stepSchema = z.object({
  step_number: z.number().int(), // Step number
  description: z.string(),
  ingredients: z
    .array(
      z.object({
        name: z.string(), // Ingredient name
        quantity: z.union([z.string(), z.number()]), // Quantity for this step
        unit: z.string(), // Unit of measurement
      })
    ),
});

export const recipeSchema = z
  .object({
    title: z.string(),
    description: z.string(), // Brief description of the recipe
    ingredients: z
      .array(ingredientSchema),
    steps: z.array(stepSchema),
    preparationTime: z.number(), // Time in minutes
    cookingTime: z.number(), // Time in minutes
    servings: z.number(), // Number of servings
    tags: z.array(z.string()),
  })
  // This could be useful but we're allowing things like 'bunch' and 'to taste' for quantities which we can't EASILY use to verify step -> ingredient mapping
  // quantities sum to the total required quantity for each ingredient.

//   .refine(
//     (data: {
//       ingredients: Array<{ name: string; quantity?: string | number }>;
//       steps: Array<{
//         ingredients?: Array<{ name: string; quantity?: string | number }>;
//       }>;
//     }) => {
//       // Map to track the total usage of each ingredient
//       const ingredientUsage: Record<string, number> = {};

//       // Sum ingredient quantities from steps
//       data.steps.forEach((step) => {
//         step.ingredients?.forEach(({ name, quantity }) => {
//           if (typeof quantity === "number") {
//             ingredientUsage[name] = (ingredientUsage[name] || 0) + quantity;
//           }
//         });
//       });

//       // Compare summed quantities with ingredient declarations
//       return data.ingredients.every((ingredient) => {
//         const totalUsed = ingredientUsage[ingredient.name] || 0;
//         return (
//           !ingredient.quantity ||
//           (typeof ingredient.quantity === "number" &&
//             totalUsed === ingredient.quantity)
//         );
//       });
//     },
//     {
//       message:
//         "The total quantities of ingredients in steps do not match the declared quantities.",
//     }
//   );
