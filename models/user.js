'use strict';
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    budget: DataTypes.FLOAT
  }, {});
  user.associate = function(models) {
    // associations can be defined here
    user.hasMany(models.expenses);
    user.hasMany(models.bills);
  };
  return user;
};