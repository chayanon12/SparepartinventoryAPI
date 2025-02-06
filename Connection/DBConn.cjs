const { Client } = require("pg");
const oracledb = require("oracledb");
require("dotenv").config();

oracledb.initOracleClient({
  // tnsAdmin: process.env.TNS_ADMIN,
  tnsAdmin: "D:\\app\\Chayanon.I\\product\\11.2.0\\client_1\\network\\admin\\",
});

const ConnectPG_DB = async () => {
  const Pg_FETL_A1_Service = {
    user: process.env.FETLSQLA1_USER,
    host: process.env.FETLSQLA1_HOST,
    database: process.env.FETLSQLA1_DATABASE,
    password: process.env.FETLSQLA1_PASSWORD,
    port: process.env.FETLSQLA1_PORT,
  };
  const client = new Client(Pg_FETL_A1_Service);
  await client.connect();
  await client.query("SET timezone = 'Asia/Bangkok'");

  return client;
};
const DisconnectPG_DB = async (client) => {
  await client.end();
};
const ConnectOracle_DB = async (ConnType) => {
  if (ConnType == "SE") {
    console.log(process.env.TNS_ADMIN);
    const Oracle_SE_DB_CENTER = {
      user: process.env.FETL_SE_USER,
      password: process.env.FETL_SE_PASSWORD,
      connectString: process.env.FETL_SE_CONNECTSTRING,
    };
    const connection = await oracledb.getConnection(Oracle_SE_DB_CENTER);
    return connection;
  }
};
const DisconnectOracleDB = async (connection) => {
  await connection.close();
};
module.exports = {
  ConnectPG_DB,
  DisconnectPG_DB,
  ConnectOracle_DB,
  DisconnectOracleDB,
};
