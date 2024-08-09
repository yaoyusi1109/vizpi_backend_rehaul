const Sequelize = require('sequelize')
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('group', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    progress: {
      type: DataTypes.JSON,
      allowNull: true
    },
    user_ids: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: false
    },
    session_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    group_round: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    group_type: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    code_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
  }, {
    sequelize,
    tableName: 'group',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "group_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  })
}
