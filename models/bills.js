'use strict';
module.exports = (sequelize, DataTypes) => {
  const bills = sequelize.define('bills', {
    rent_mort: DataTypes.FLOAT,
    water: DataTypes.FLOAT,
    electricity: DataTypes.FLOAT,
    gas: DataTypes.FLOAT
  }, {});
  bills.associate = function(models) {
    // associations can be defined here
    bills.belongsTo(models.user);
  };
  return bills;
};