'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'expenses',
      'userId',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }
    )
    .then(() => {
      return queryInterface.addColumn(
        'bills',
        'userId',
        {
          type: Sequelize.INTEGER,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        }
      )
    })

  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'expenses',
      'userId'
    )
    .then(() => {
      return queryInterface.removeColumn(
        'bills',
        'userId'
      );
    })
  }
};
