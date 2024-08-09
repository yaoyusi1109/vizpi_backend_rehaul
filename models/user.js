const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    first_name: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    middle_name: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    last_name: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    nick_name: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    session_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    code_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    session_list: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: true
    },
    quiz_stats:{
      type: DataTypes.JSON,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    
  }, {
    sequelize,
    tableName: 'user',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "user_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
