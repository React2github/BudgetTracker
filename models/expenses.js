'use strict';
module.exports = (sequelize, DataTypes) => {
  const expenses = sequelize.define('expenses', {
    gas: DataTypes.FLOAT,
    groceries: DataTypes.FLOAT,
    dining: DataTypes.FLOAT,
    other: DataTypes.FLOAT
  }, {});
  expenses.associate = function(models) {
    // associations can be defined here
    expenses.belongsTo(models.user);
  };
  return expenses;
};