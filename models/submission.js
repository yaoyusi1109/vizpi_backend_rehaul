const Sequelize = require('sequelize')
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('submission', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    code_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    session_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    error: {
      type: DataTypes.JSON,
      allowNull: true
    },
    created_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('now')
    },
    result_list: {
      type: DataTypes.ARRAY(DataTypes.BOOLEAN),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'submission',
    schema: 'public',
    hasTrigger: true,
    timestamps: false,
    indexes: [
      {
        name: "submission_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  })
}
