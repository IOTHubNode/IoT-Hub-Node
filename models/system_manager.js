'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class system_manager extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  system_manager.init({
    account: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'system_manager',
  });
  return system_manager;
};