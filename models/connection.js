// 'use server'
import { Sequelize } from 'sequelize';
// const { Sequelize } = require("sequelize");
// const dialectOptions =
//   process.env.ENV !== "DEV" ? { ssl: { require: true } } : undefined;
const sequelize = new Sequelize({
    username: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    port: 5432,
    password: process.env.POSTGRES_PASSWORD,
    dialect: "postgres",
    // dialectModule: pg,
    logging: false,
    // dialectOptions: dialectOptions,
    define: {
        scopes: {
            excludeId: {
                attributes: { exclude: ["id", "createdAt", "updatedAt"] },
            },
        },
        timestamps: false,
    },
});
export default sequelize;
