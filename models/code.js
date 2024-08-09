const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('code', {
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    passrate: {
      type: DataTypes.SMALLINT,
      allowNull: false
    },
    created_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    keystrokes: {
      type: DataTypes.ARRAY(DataTypes.JSON),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'code',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "code_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
