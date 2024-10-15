const { Client } = require('pg');
require("dotenv").config();


const ConnectPG_DB= async () => {
    const Pg_FETL_A1_Service ={
        user: process.env.FETLSQLA1_USER,
        host: process.env.FETLSQLA1_HOST,
        database: process.env.FETLSQLA1_DATABASE,
        password: process.env.FETLSQLA1_PASSWORD,
        port: process.env.FETLSQLA1_PORT,
    }
    const client = new Client(Pg_FETL_A1_Service);
    await client.connect(); 
    await client.query('SET timezone = \'Asia/Bangkok\'');

    return client;
};

const DisconnectPG_DB = async (client) => {
    await client.end(); 
}


module.exports = { ConnectPG_DB, DisconnectPG_DB };

