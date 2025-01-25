import { DataTypes, Model } from "sequelize";
import sequelize from "./connection.js";
import Ingredient from "./Ingredient.js";
import Recipe from "./Recipe.js";
export default class RecipeIngredient extends Model {
}
/**
 * Model for a recipe's ingredients and quantities.  Contains associated recipe_id, ingredient_id, and quantity
 */
RecipeIngredient.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    quantity: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    recipe_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Recipe,
            key: "id",
        },
    },
    ingredient_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Ingredient,
            key: "id",
        },
    },
}, {
    sequelize,
    modelName: "RecipeIngredient",
});
Recipe.belongsToMany(Ingredient, {
    through: RecipeIngredient,
    foreignKey: "recipe_id",
    onDelete: "CASCADE",
});
Ingredient.belongsToMany(Recipe, {
    through: RecipeIngredient,
    foreignKey: "ingredient_id",
});
