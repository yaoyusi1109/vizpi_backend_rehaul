const Sequelize = require('sequelize')

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('topic_analysis', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    type: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    session_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    sequelize,
    tableName: 'topic_analysis',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "topic_analysis_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  })
}
