const {
  ConnectPG_DB,
  DisconnectPG_DB,
  ConnectOracle_DB,
  DisconnectOracleDB,
} = require("../Connection/DBConn.cjs");
const { writeLogError } = require("../Common/LogFuction.cjs");
const Fac = process.env.FacA1;
const fs = require("fs");

module.exports.getmenuname = async function (req, res) {
  var query = "";
  try {
    const client = await ConnectPG_DB();
    query += `  select  ROW_NUMBER() OVER (ORDER BY t.menu_id) AS id ,t.menu_name ,t.menu_icon
                from "SE".spi_inventory_menu t where t.menu_flag ='A' and t.page='All' 
                order by t.menu_id  `;
    const result = await client.query(query);
    res.status(200).json(result.rows);
    DisconnectPG_DB(client);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.getChart = async function (req, res) {
  var query = "";
  try {
    const client = await ConnectPG_DB();
    const json_data = {
      strPlantCode: Fac,
    };
    const json_convertdata = JSON.stringify(json_data);
    query += ` SELECT 
              sps.type_name,
              spi.type_id ,
              spi.user_service AS out_count
          FROM "SE".spi_product_new_item spi,
            "SE".spi_product_store sps 
          where spi.type_id = sps.type_id
          and spi.status='ACTIVE'
          order by type_id asc
  `;
    const result = await client.query(query);
    res.status(200).json(result.rows);
    DisconnectPG_DB(client);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.GetCountNewarrDashboard = async function (req, res) {
  var query = "";
  try {
    const client = await ConnectPG_DB();
    const json_data = {
      strType: "NewArrival",
      strPlantCode: Fac,
    };
    const json_convertdata = JSON.stringify(json_data);
    query += ` SELECT * FROM "SE".spi_Dashboard('${json_convertdata}'); `;
    const result = await client.query(query);

    res.status(200).json(result.rows);
    DisconnectPG_DB(client);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.GetDttableNewArr = async function (req, res) {
  var query = "";
  try {
    // const strPlantCode = req.query.strPlantCode;
    const client = await ConnectPG_DB();
    const json_data = {
      strPlantCode: Fac,
    };
    const json_convertdata = JSON.stringify(json_data);
    query += `select 
              encode(sps.type_icon, 'base64') AS type_icon,
              sps.type_name ,
              spi.quantity ,
              spi.user_service,
              spi.quantity as onHands     
              from "SE".spi_product_new_item spi ,"SE".spi_product_store sps 
              where spi.type_id =sps.type_id and sps.remark ='ACTIVE' 
  `;
    const result = await client.query(query);
    res.status(200).json(result.rows);
    DisconnectPG_DB(client);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.getProductItemsNewArr = async function (req, res) {
  var query = "";
  try {
    const client = await ConnectPG_DB();
    const { empcode } = req.query;

    query += ` 
              select 'All' as type_name ,0 as type_id
                union all
                select sps.type_name ,sps.type_id
                from "SE".spi_product_store sps 
                where sps.remark ='ACTIVE' and sps.item_type_flg = 'NEW' order by type_id asc
                

  `;
    const result = await client.query(query);
    res.status(200).json(result.rows);
    DisconnectPG_DB(client);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.getDataReportNewArr = async function (req, res) {
  var query = "";
  try {
    const client = await ConnectPG_DB();
    const { movementtype, datefrom, dateto, typename, dept ,fac} = req.query;
    query += ` SELECT 
        spa.plant_code,
        spa.item_broken_flg,
        sps.type_name,
        spa.serial_number,
        spa.item_name,
        spa.mac_address,
        spa.fix_assets_code,
        spa.movement_type,
        TO_CHAR(spa.create_date, 'DD/MM/YYYY HH24:MI:SS') AS Scan_in_Date,
        spa.admin_id,
        spa.user_id ,
        spa.user_id AS user_dept,
        spa.user_name as username,
        TO_CHAR(spa.update_date, 'DD/MM/YYYY HH24:MI:SS') AS Scan_out_Date,
        spa.product_status,
        spa.admin_scan_out AS admin_out_id,
        spa.user_dept as dept,
        spa.req_no as reqnumber,
        spa.pc_monitor_serial as  desktopmonitor,
        spa.pc_old_serial as olddesktopserial,
        spa.user_contact as usercontact,
        spa.remark as remark
    FROM 
        "SE".spi_product_action spa,"SE".spi_product_store sps 
    where
      spa.item_id = sps.type_id  
      and spa.item_type_flg ='NEW' `;
    if (movementtype !== "All") {
      query += ` and spa.movement_type = '${movementtype}'  `;
    }
    if (datefrom !== "") {
      query += ` and TO_CHAR(spa.create_date, 'YYYY-MM-DD') >= '${datefrom}'  `;
    }
    if (dateto != "") {
      query += ` and TO_CHAR(spa.create_date, 'YYYY-MM-DD') <= '${dateto}'  `;
    }
    if (typename != "0" && typename != "undefined" && typename != "All") {
      query += ` and spa.item_id = '${typename}'  `;
    }
    if (dept !== "" && dept !== "undefined") {
      query += ` and spa.user_dept = '${dept}'  `;
    }
    if (fac !== "" && fac !== "undefined" && fac !== "All") {
      query += ` and spa.plant_code = '${fac}'  `;
    }

    const result = await client.query(query);
    res.status(200).json(result.rows);
    DisconnectPG_DB(client);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.getTypeNewArr = async function (req, res) {
  var query = "";
  try {
    const client = await ConnectPG_DB();
    query = `
             select sps.type_id,sps.type_name,sps.type_product,sps.type_abbr from "SE".spi_product_store sps where  sps.remark = 'ACTIVE' and sps.item_type_flg ='NEW' order by sps.type_id asc
            `;
    const result = await client.query(query);
    res.status(200).json(result.rows);
    DisconnectPG_DB(client);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.setReqNoStatusData = async function (req, res) {
  var query = "";
  try {
    let { dataList } = req.body;
    const client = await ConnectPG_DB();
    const json_convertdata = JSON.stringify(dataList);
    query += ` CALL "SE".spi_insert_req_data('[${json_convertdata}]','') `;
    const result = await client.query(query);
    if (result.rows[0].p_error == "") {
      res.status(200).json({ result: "Success" });
      DisconnectPG_DB(client);
    }
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.insertnewtypeNewArr = async function (req, res) {
  var query = "";
  try {
    const { type_name, type_product, type_abbr } = req.body;
    const client = await ConnectPG_DB();
    const CheckDuplicateQuery = `select t.type_abbr from "SE".spi_product_store t`;
    const resultCheckingAbrr = await client.query(CheckDuplicateQuery);
    let isDuplicate = resultCheckingAbrr.rows.find(
      (x) => x.type_abbr === type_abbr
    );
    if (isDuplicate) {
      res.status(204).json({ state: "abbr is duplicate" });
      return;
    }
    query = `
            INSERT INTO "SE".spi_product_store
            (type_id, type_name,type_product,remark,item_type_flg,type_abbr)
            VALUES((select max(t.type_id)  + 1 from "SE".spi_product_store t ) , '${type_name}','${type_product}','ACTIVE','NEW','${type_abbr}');
            `;
    const result = await client.query(query);
    const query2 = `SELECT type_id FROM "SE".spi_product_store where type_name = '${type_name}'`;
    const result2 = await client.query(query2);
    if (result2.rows[0].type_id != "") {
      const type_id_v = result2.rows[0].type_id;
      const query3 = `INSERT INTO "SE".spi_product_new_item
      (plant_code, item_id, type_id, quantity, scan_in_date, status, user_service)
      VALUES('${Fac}', (select max(t.item_id) + 1 from "SE".spi_product_new_item t) , ${type_id_v}, 0, CURRENT_TIMESTAMP, 'ACTIVE', 0);`;
      const result3 = await client.query(query3);
      if (result3.rowCount > 0) {
        res.status(200).json({ state: "Success" });
      }
    }
    DisconnectPG_DB(client);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ state: "Error", message: error.message });
  }
};
module.exports.getSerialRequestNumberPostgres = async function (req, res) {
  var query = "";
  var queryOracle = "";
  const { strRequestNumber } = req.query;
  try {
    const client = await ConnectPG_DB();
    const clientOracle = await ConnectOracle_DB("SE");
    queryOracle = `SELECT C.SES_MSTR_DESC,T.SP_REQ_AMOUNT
              FROM SES_PROCESS T INNER JOIN SES_MASTER_CODE C ON C.SES_MSTRG_ID='3400' AND C.SES_MSTR_CODE=T.SP_REQ_ITEM_TYPE
              WHERE T.SP_REQ_NO = '${strRequestNumber}'`;
    query = `select t.serial_number  from "SE".spi_product_action t where t.req_no ='${strRequestNumber}' order by movement_id `;
    const result = await client.query(query);
    const resultOracle = await clientOracle.execute(queryOracle);
    if (resultOracle.rows.length === 0) {
      res.status(204).json({ message: "No data found" });
    } else {
      res
        .status(200)
        .json({
          item_type: resultOracle.rows[0][0],
          amount: resultOracle.rows[0][1],
          serial_number: result.rows[0] && result.rows ? result.rows : "",
        });
    }
    // res.status(200).json(result.rows);
    DisconnectPG_DB(client);
  } catch (error) {
    writeLogError(error.message, query);
    writeLogError(error.message, queryOracle);
    res.status(500).json({ message: error.message });
  }
};
module.exports.getdataRequestNumber = async function (req, res) {
  var query = "";
  var Conn;
  try {
    const { strRequestNumber } = req.query;
    Conn = await ConnectOracle_DB("SE");
    query = ` SELECT C.SES_MSTR_DESC,T.SP_REQ_AMOUNT
              FROM SES_PROCESS T INNER JOIN SES_MASTER_CODE C ON C.SES_MSTRG_ID='3400' AND C.SES_MSTR_CODE=T.SP_REQ_ITEM_TYPE
              WHERE T.SP_REQ_NO = '${strRequestNumber}'`;
    const result = await Conn.execute(query);
    if (result.rows.length === 0) {
      res.status(204).json({ message: "No data found" });
    } else {
      res
        .status(200)
        .json({ item_type: result.rows[0][0], amount: result.rows[0][1] });
    }
    DisconnectOracleDB(Conn);
  } catch (err) {
    writeLogError(err.message, query);
    res.status(500).json({ message: err.message });
    DisconnectOracleDB(Conn);
  }
};
module.exports.getDatableFixedFac = async function (req, res) {
  var query = "";
  try {
    const client = await ConnectPG_DB();
    const { plantCode } = req.query;
    query = `
            SELECT 
                spi.type_name,
                spa.item_id, 
                spa.plant_code, 
                COUNT(*) AS total_in_stock
            FROM "SE".spi_product_action spa
            JOIN "SE".spi_product_new_item sps ON spa.item_id = sps.item_id
            JOIN "SE".spi_product_store spi ON sps.type_id = spi.type_id
            WHERE spa.movement_type = 'IN' 
            AND spa.item_type_flg = 'NEW'
            AND spa.plant_code = '${plantCode}'
            GROUP BY spi.type_name, spa.item_id, spa.plant_code
            ORDER BY spa.item_id;
            `;
    const result = await client.query(query);
    res.status(200).json(result.rows);
    DisconnectPG_DB(client);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
}
