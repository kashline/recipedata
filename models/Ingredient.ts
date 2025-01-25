import { DataTypes, Model } from "sequelize";
import sequelize from "./connection.js";

/**
 * Model for an ingredient containing the ingredient name.
 */
export default class Ingredient extends Model {}

Ingredient.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    }
  },
  {
    sequelize,
    modelName: "Ingredient",
  },
);
