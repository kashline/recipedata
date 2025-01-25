import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "./connection.js";
import Recipe from "./Recipe.js";

/**
 * Model of a recipe's steps containing the id, step, step number, and associated recipe_id
 */
export default class RecipeStep extends Model {}

RecipeStep.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    recipe_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Recipe,
        key: "id",
      },
    },
    step_number: {
      type: DataTypes.INTEGER,
    },
    ingredients: {
      type: DataTypes.ARRAY(DataTypes.JSON)
    }
  },
  {
    sequelize,
    modelName: "RecipeStep",
  },
);

Recipe.hasMany(RecipeStep, { foreignKey: "recipe_id" });
RecipeStep.belongsTo(Recipe, { foreignKey: "recipe_id" });
