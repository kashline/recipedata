import { DataTypes, Model } from "sequelize";
import sequelize from "./connection.js";

/**
 * Model for a recipe.  Contains the name, difficulty, length, mealdb_id, image url, and video url.
 */
export default class Recipe extends Model {
}

Recipe.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // *** Changed name to title
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: { type: DataTypes.STRING(512) },
    difficulty: {
      type: DataTypes.STRING,
    },
    // *** Replaced length with prep/cook time
    preparationTime: {
      type: DataTypes.INTEGER,
    },
    cookingTime: {
      type: DataTypes.INTEGER,
    },
    // *** Removed mealdb_id
    image: {
      type: DataTypes.STRING,
    },
    video: {
      type: DataTypes.STRING,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING)
    },
    servings: {
      type: DataTypes.INTEGER
    }
  },
  {
    sequelize,
    modelName: "Recipe",
  }
);
