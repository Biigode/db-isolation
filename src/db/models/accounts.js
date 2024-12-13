import { DataTypes } from "sequelize";
import { sequelize } from "../sequelize.js";

const Accounts = sequelize.define("accounts", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
});

export { Accounts };
