import { z } from "zod";

export const UserRecipeZodel = z.object({
  id: z.number().optional(),
  recipeId: z.number(),
  userSub: z.string(),
});

export type UserZype = z.infer<typeof UserRecipeZodel>;
