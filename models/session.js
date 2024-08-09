const Sequelize = require('sequelize')
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('session', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    creater_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    crn: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    enable_chat: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    grouped: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    stu_num: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false
    },
    task: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    test_code: {
      type: DataTypes.JSON,
      allowNull: true
    },
    test_list: {
      type: DataTypes.ARRAY(DataTypes.JSON),
      allowNull: true
    },
    created_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('now')
    },
    url: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    identity_list: {
      type: DataTypes.ARRAY(DataTypes.JSON),
      allowNull: true
    },
    group_round: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    regrouping: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    type: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    quiz: {
      type: DataTypes.JSON,
      allowNull: true
    },
    enable_quiz: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
  }, {
    sequelize,
    tableName: 'session',
    schema: 'public',
    hasTrigger: true,
    timestamps: false,
    indexes: [
      {
        name: "session_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  })
}
