const sequelize = require("../postgre/db")
const initModels = require("../models/init-models")
const user = require("../models/user")

const Code = initModels(sequelize).code
const User = initModels(sequelize).user
const Session = initModels(sequelize).session

const initSqlJs = require('sql.js');
var _ = require('lodash');

exports.list = async () => {
  try {
    return await Code.findAll()
  } catch (err) {
    console.log(err)
  }
}

exports.getCodeById = async (id) => {
  try {
    return await Code.findByPk(id)
  } catch (err) {
    console.log(err)
  }
}

exports.getCodesByUserId = async (id) => {
  try {
    return await Code.findAll({
      where: {
        creater_id: id
      }
    })
  } catch (err) {
    console.log(err)
  }
}

exports.getCodeByUserId = async (userId) => {
  try {
    const user = await User.findByPk(userId)

    if (!user) {
      console.log('User not found')
      return
    }

    if (user.code_id == null) {
      console.log('Code not found')
      return
    }

    const code = await Code.findByPk(user.code_id)

    return code
  } catch (err) {
    console.log(err)
  }
}

exports.createCode = async (code) => {
  try {
    return await Code.create(code)
  } catch (err) {
    console.log(err)
  }
}

exports.updateCode = async (id, code) => {
  try {
    return await Code.update(code, {
      where: {
        id: id
      },
    })
  } catch (err) {
    console.log(err)
  }
}

exports.deleteCode = async (id) => {
  try {
    return await Code.destroy({
      where: {
        id: id,
      },
    })
  } catch (err) {
    console.log(err)
  }
}

exports.addCodeToUser = async (userId, code) => {
  try {
    return await sequelize.transaction(async (t) => {
      const newCode = await this.createCode(code, { transaction: t })
      let user = {
        code_id: newCode.id
      }
      console.log(user)
      await User.update(user, {
        where: {
          id: userId
        },
        transaction: t
      })
      return newCode
    })
  } catch (err) {
    console.log(err)
    throw err
  }
}

exports.getCodesBySessionId = async (sessionId) => {
  try {
    return await Code.findAll({
      where: {
        session_id: sessionId
      }
    })
  } catch (err) {
    console.log(err)
  }
}

exports.getCodeByUserInSession = async (sessionId,userId) => {
  try {
    return await Code.findAll({
      where: {
        session_id: sessionId,
        creater_id: userId
      },
      order: [[ 'created_time', 'DESC']]
    })
  } catch (err) {
    console.log(err)
  }
}
exports.runCode = async (code1,code2,type,sessionId) => {
  console.log(type)
  try {
    const SQL = await initSqlJs();
    // Load the db
    const db1 = new SQL.Database();
    let session = await Session.findByPk(sessionId)
    console.log(session)
    let code = await Code.findByPk(session.test_code.starter)
    let sqlstr = code.content;
    db1.run(sqlstr);
    
    const db2 = new SQL.Database(db1.export());
    if(type == "Schema"){
      let sqlShowSchema = `SELECT 
    name
FROM 
    sqlite_schema
WHERE 
    type ='table' AND 
    name NOT LIKE 'sqlite_%';`;
      let sqltables1 = ``;
      let sqltables2 = ``;
      
      db1.run(code1);
      db2.run(code2);
      let stmtSchema1 = db1.exec(sqlShowSchema);
      let stmtSchema2 = db2.exec(sqlShowSchema);
      let tables1 = stmtSchema1[0].values
      let tables2 = stmtSchema1[0].values
      for(let i = 0; i < tables1.length;i++){
        sqltables1 = sqltables1 + `SELECT * FROM ${tables1[i]};
        `
      }
      for(let i = 0; i < tables2.length;i++){
        sqltables2 = sqltables2 + `SELECT * FROM ${tables2[i]};
        `
      }
      console.log(tables1)
      console.log(sqltables1)
      let stmtTables1 = db1.exec(sqltables1);
      let stmtTables2 = db2.exec(sqltables2);
      console.log(stmtTables1)
      const binaryArray1 = db1.export();
      console.log(binaryArray1)
      const binaryArray2 = db2.export();
      if(isEqual(binaryArray1, binaryArray2)){
        return {result:100,data:[...stmtSchema1,...stmtTables1], expected:[...stmtSchema2,...stmtTables2]}
      }
      else{
        return {result:0,data:[...stmtSchema1,...stmtTables1], expected:[...stmtSchema2,...stmtTables2]}
      }
    }
    else{
      console.log(code1)
      let stmt1 = db1.exec(code1);
      let stmt2 = db2.exec(code2);
      console.log(stmt1)
      console.log(stmt2)
      if(isEqual(stmt1, stmt2)){
        return {result:100,data:stmt1,expected:stmt2}
      }
      else{
        return {result:0,data:stmt1,expected:stmt2}
      }
    }
    
  } catch (err) {
    console.log(err.stack)
    console.log(err.message)
    console.log(console.log(Object.getOwnPropertyNames(err)))
    return {stack:err.stack,message:err.message+"\n"}
  }
}

exports.getSchema = async (sessionId) => {
  console.log(sessionId)
  try {
    const SQL = await initSqlJs();
    // Load the db
    const db1 = new SQL.Database();
    let session = await Session.findByPk(sessionId)
    console.log(session)
    let code = await Code.findByPk(session.test_code.starter)
    let sqlstr = code.content;
    db1.run(sqlstr);
    
    let sqlShowSchema = `SELECT 
  name as Tables
FROM 
  sqlite_schema
WHERE 
  type ='table' AND 
  name NOT LIKE 'sqlite_%';`;
    let sqltables1 = ``;
    let sqltables2 = ``;
    
    let stmtSchema1 = db1.exec(sqlShowSchema);
    let tables1 = stmtSchema1[0].values
    for(let i = 0; i < tables1.length;i++){
      sqltables1 = sqltables1 + `SELECT cid as column_id,name,type, "notnull" as "not_null",dflt_value as default_value,pk as primary_key FROM pragma_table_info("${tables1[i]}");
      `
    }
    console.log(tables1)
    console.log(sqltables1)
    let stmtTables1 = db1.exec(sqltables1);
    console.log(stmtTables1)
    const binaryArray1 = db1.export();
    console.log(binaryArray1)
    return {data:[...stmtSchema1,...stmtTables1]}
    
    
  } catch (err) {
    console.log(err.stack)
    console.log(err.message)
    console.log(console.log(Object.getOwnPropertyNames(err)))
    return {stack:err.stack,message:err.message+"\n"}
  }
}

function isEqual(arr1, arr2){
  if (arr1.length !== arr2.length) {
      return false
  }

  return arr1.every((value, index) => _.isEqual(value, arr2[index]))
}