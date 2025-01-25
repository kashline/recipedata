import { DataTypes, Model } from "sequelize";
import sequelize from "./connection.js";
/**
 * Model for a recipe.  Contains the name, difficulty, length, mealdb_id, image url, and video url.
 */
export default class Test extends Model {
}
Test.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: "Test",
});
