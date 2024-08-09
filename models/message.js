const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('message', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    session_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    recipient_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    code_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    created_time: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    reactions: {
      type: DataTypes.JSON,
      allowNull: true
    },
    keystrokes: {
      type: DataTypes.ARRAY(DataTypes.JSON),
      allowNull: true
    },
    question_type:{
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'message',
    schema: 'public',
    hasTrigger: true,
    timestamps: false,
    indexes: [
      {
        name: "message_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
