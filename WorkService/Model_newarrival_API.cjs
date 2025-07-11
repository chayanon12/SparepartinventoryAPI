const {
  ConnectPG_DB,
  DisconnectPG_DB,
  ConnectOracle_DB,
  DisconnectOracleDB,
} = require("../Connection/DBConn.cjs");
const { writeLogError } = require("../Common/LogFuction.cjs");
const Fac = process.env.FacA1;
const fs = require("fs");
const oracledb = require("oracledb");
const nodemailer = require('nodemailer')
const SE = {
  user: "se",
  password: "se",
  connectString: "TCIX01",
};
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
    const { movementtype, datefrom, dateto, typename, dept, fac, req_no } =
      req.query;
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
        spa.remark as remark,
        spa.req_no as req_no 
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
    if (req_no !== "" && req_no !== undefined) {
      query += ` and spa.req_no = '${req_no}'  `;
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
    const Conn = await oracledb.getConnection(SE);
    queryOracle = `SELECT C.SES_MSTR_DESC,T.SP_REQ_AMOUNT,T.SP_REQ_BY 
              FROM SES_PROCESS T INNER JOIN SES_MASTER_CODE C ON C.SES_MSTRG_ID='3400' AND C.SES_MSTR_CODE=T.SP_REQ_ITEM_TYPE
              WHERE T.SP_REQ_NO = '${strRequestNumber}'`;
    query = `select t.serial_number  from "SE".spi_product_action t where t.req_no ='${strRequestNumber}' order by movement_id `;
    const result = await client.query(query);
    const resultOracle = await Conn.execute(queryOracle);
    if (resultOracle.rows.length === 0) {
      res.status(204).json({ message: "No data found" });
    } else {
      console.log(resultOracle);
      res.status(200).json({
        item_type: resultOracle.rows[0][0],
        amount: resultOracle.rows[0][1],
        serial_number: result.rows[0] && result.rows ? result.rows : "",
        req_by: resultOracle.rows[0][2],
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
const CUSR = {
  user: "cusr",
  password: "cusr",
  connectString: "TCIX01",
};
module.exports.getdataRequestNumber = async function (req, res) {
  let query = "";
  var Conn;
  const { strRequestNumber } = req.query;
  console.log(strRequestNumber);
  try {
    // Conn = await ConnectOracle_DB("SE");
    const Conn = await oracledb.getConnection(CUSR);
    query = ` SELECT C.SES_MSTR_DESC,T.SP_REQ_AMOUNT,T.SP_REQ_BY 
              FROM SE.SES_PROCESS T INNER JOIN SE.SES_MASTER_CODE C ON C.SES_MSTRG_ID='3400' AND C.SES_MSTR_CODE=T.SP_REQ_ITEM_TYPE
              WHERE T.SP_REQ_NO = '${strRequestNumber}'`;
    const result = await Conn.execute(query);
    if (result.rows.length === 0) {
      res.status(204).json({ message: "No data found" });
    } else {

      res
        .status(200)
        .json({ item_type: result.rows[0][0], amount: result.rows[0][1], req_by: result.rows[0][2] });
    }
    DisconnectOracleDB(Conn);
  } catch (err) {
    writeLogError(err.message, query);
    res.status(500).json({ message: err.message });
    DisconnectOracleDB(Conn);
  }
};
module.exports.getdataFromReqno = async function (req, res) {
  let query = "";
  var Conn;
  const { strRequestNumber } = req.query;
  console.log(strRequestNumber);
  try {
    // Conn = await ConnectOracle_DB("SE");
    const Conn = await oracledb.getConnection(CUSR);
    query = ` SELECT 
                S.SP_REQ_NO AS req_no,
                  T.EMPCODE AS id_code,
                  SUBSTR(T.ETITLE,0,1) || LOWER(SUBSTR(T.ETITLE,2)) || SUBSTR(T.ENAME,0,1) || LOWER(SUBSTR(T.ENAME,2))  AS name,
                  SUBSTR(T.ESURNAME,0,1) || LOWER(SUBSTR(T.ESURNAME,2))  AS surname,
                  S.SP_REQ_DEPT AS user_dept,
                  T.DIVISION as user_divition,
                  S.SP_REQ_AMOUNT AS SP_REQ_AMOUNT
              FROM 
                  SE.SES_PROCESS S
              INNER JOIN 
                  CUSR.CU_USER_HUMANTRIX T ON S.SP_REQ_BY = T.EMPCODE
              WHERE 
                  S.SP_REQ_NO =  '${strRequestNumber}'`;
    const result = await Conn.execute(query);
    if (result.rows.length === 0) {
      res.status(204).json({ message: "No data found" });
    } else {
      res
        .status(200)
        .json({
          req_no: result.rows[0][0], 
          id_code: result.rows[0][1], 
          user_name: result.rows[0][2] , 
          user_surname: result.rows[0][3], 
          user_req_dept: result.rows[0][4], 
          user_divition: result.rows[0][5],
          amount: result.rows[0][6]
        });
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
};
module.exports.getNotificationTransection = async function (req, res) {
  var query = "";
  try {
    const client = await ConnectPG_DB();
    const { strPlantCode } = req.query;
    query = `
         SELECT count(distinct t.trf_req_no) as notification_count
            FROM "SE".spi_product_transfer t where t.trf_status = 'PENDING' and t.trf_to_factory ='${strPlantCode}';
            `;
    const result = await client.query(query);
    res.status(200).json(result.rows);
    DisconnectPG_DB(client);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.getDatatoTranferbyReqNo = async function (req, res) {
  let query = "";
  let CheckDuplicateitems = "";
  try {
    const client = await ConnectPG_DB();
    const { strReqNo, strFac } = req.query;
    CheckDuplicateitems = ` SELECT t.* from "SE".spi_product_transfer t where t.trf_req_no = '${strReqNo}' and t.trf_status = 'PENDING' `;
    const resultCheckDuplicate = await client.query(CheckDuplicateitems);
    if (resultCheckDuplicate.rows.length > 0) {
      res.status(200).json({ message: "Duplicate Request Number" });
    } else {
      query = `
      SELECT 
          spa.plant_code as factory,
          spa.req_no as req_no ,
          spa.serial_number as serial_number,
          spa.product_status as product_status,
          spa.admin_id as admin_scanin,
          to_char(spa.create_date,'dd/mm/yyyy') as scan_in_date
            from "SE".spi_product_action spa
              where req_no ='${strReqNo}' 
                and product_status ='INSTOCK'
                and plant_code = '${strFac}'
      `;
      const result = await client.query(query);
      res.status(200).json(result.rows);
    }

    DisconnectPG_DB(client);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.getDatatoTranferbySerial = async function (req, res) {
  let query = "";
  let CheckDuplicateitems = "";
  try {
    const client = await ConnectPG_DB();
    const { strSerialNumber, strFac } = req.query;
    CheckDuplicateitems = ` SELECT t.* from "SE".spi_product_transfer t where t.trf_item_id = '${strSerialNumber}' and t.trf_status = 'PENDING' `;
    const resultCheckDuplicate = await client.query(CheckDuplicateitems);
    if (resultCheckDuplicate.rows.length > 0) {
      res.status(200).json({ message: "Serial Number is already send" });
    } else {
      query = `
      SELECT 
          spa.plant_code as factory,
          spa.req_no as req_no ,
          spa.serial_number as serial_number,
          spa.product_status as product_status,
          spa.admin_id as admin_scanin,
          to_char(spa.create_date,'dd/mm/yyyy') as scan_in_date
            from "SE".spi_product_action spa
              where serial_number ='${strSerialNumber}' 
                and product_status ='INSTOCK'
                and plant_code = '${strFac}'
      `;
      const result = await client.query(query);
      res.status(200).json(result.rows);
    }
    DisconnectPG_DB(client);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.RequestTrasferfactory = async function (req, res) {
  let query = "";
  let queryCheckExit = "";
  try {
    const client = await ConnectPG_DB();
    const { strItemsid, strReqNo, strFromfac, strTofac, strAdminid } = req.body;
    queryCheckExit = `select t.* from "SE".spi_product_transfer t where t.trf_req_no ='${strReqNo}' and t.trf_item_id='${strItemsid}' `;
    const resutlCheckingExit = await client.query(queryCheckExit);
    if (resutlCheckingExit.rows.length > 0) {
      query = ` UPDATE "SE".spi_product_transfer SET 
                  trf_from_factory = '${strFromfac}',
                  trf_to_factory = '${strTofac}',
                  trf_sent_by = '${strAdminid}',
                  trf_status = 'PENDING',
                  trf_update_date = now(),
                  trf_cancel_by = ''
                WHERE trf_req_no = '${strReqNo}' and trf_item_id = '${strItemsid}'
              `;
    } else {
      query = ` INSERT INTO "SE".spi_product_transfer
                    (
                      trf_transfer_id, 
                      trf_item_id, 
                      trf_req_no, 
                      trf_from_factory, 
                      trf_to_factory, 
                      trf_sent_by, 
                      trf_status, 
                      trf_create_date
                    )
                    VALUES
                    (
                    nextval('"SE".spi_product_transfer_trf_transfer_id_seq'::regclass), 
                    '${strItemsid}',
                    '${strReqNo}', 
                    '${strFromfac}', 
                    '${strTofac}', 
                    '${strAdminid}', 
                    'PENDING',
                    CURRENT_TIMESTAMP 
                    );`;
    }

    const result = await client.query(query);
    if (result.rowCount > 0) {
      res.status(200).json({ message: "Success" });
    } else {
      res.status(200).json({ message: "Failed" });
    }
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.CancelTransferfactory = async function (req, res) {
  let query = "";
  try {
    const client = await ConnectPG_DB();
    const { strReqNo, strAdminName } = req.body;
    query = `
          UPDATE "SE".spi_product_transfer
            SET 
            trf_status='CANCELED', 
            trf_update_date=CURRENT_TIMESTAMP,
            trf_cancel_by='${strAdminName}'
            WHERE 
           trf_status='PENDING' 
            and trf_req_no = '${strReqNo}'      
            `;
    const result = await client.query(query);
    if (result.rowCount > 0) {
      res.status(200).json({ message: "Success" });
    } else {
      res.status(200).json({ message: "Failed" });
    }
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.ReceivedTransferfactory = async function (req, res) {
  let query = "";
  let queryUpdateAction = "";
  try {
    const { strAdminName, strTofac, strReqNo, strstrSerialNo } = req.body;

    const client = await ConnectPG_DB();
    query = `
          UPDATE "SE".spi_product_transfer
            SET 
            trf_status='COMPLETED', 
            trf_received_date=CURRENT_TIMESTAMP,
            trf_received_by='${strAdminName}'
            WHERE 
            trf_status='PENDING'   
            and trf_req_no = '${strReqNo}'
            and trf_item_id = '${strstrSerialNo}'  
            `;

    const result = await client.query(query);
    if (result.rowCount > 0) {
      queryUpdateAction = `UPDATE "SE".spi_product_action 
                              SET
                                plant_code = '${strTofac}'
                              WHERE
                                req_no = '${strReqNo}'
                                and serial_number ='${strstrSerialNo}'
                              `;
      const resultUpdateAction = await client.query(queryUpdateAction);

      if (resultUpdateAction.rowCount > 0) {
        res.status(200).json({ message: "Success" });
      } else {
        res.status(200).json({ message: "Failed" });
      }
    } else {
      res.status(200).json({ message: "Failed" });
    }
  } catch (error) {
    writeLogError(error.message, query);
    writeLogError(error.message, queryUpdateAction);
    res.status(500).json({ message: error.message });
  }
};
module.exports.ShowTransfer = async function (req, res) {
  let query;
  try {
    const client = await ConnectPG_DB();
    const { strPlantCode, strFlg } = req.query;
    if (strFlg == "All") {
      query = `
      select distinct   
          spt.trf_req_no as req_no,
          -- spt.trf_item_id as serial_no,
          spt.trf_from_factory as send_from,
          spt.trf_sent_by as send_by,		
          to_char(spt.trf_create_date,'dd/mm/yyyy') as send_date
          from "SE".spi_product_transfer spt where spt.trf_status  = 'PENDING' and spt.trf_to_factory ='${strPlantCode}'
          `;
    } else {
      query = `
      select distinct   
          spt.trf_req_no as req_no,
          spt.trf_item_id as serial_no,
          spt.trf_from_factory as send_from,
          spt.trf_sent_by as send_by,		
          to_char(spt.trf_create_date,'dd/mm/yyyy') as send_date
          from "SE".spi_product_transfer spt where spt.trf_status  = 'PENDING' and spt.trf_to_factory ='${strPlantCode}'
          `;
    }

    const result = await client.query(query);
    res.status(200).json(result.rows);
    DisconnectPG_DB(client);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
const smtpConfig = {
  host: '10.17.220.200',
  port: 25, 
  secure: false, 
  auth: {
    user: 'SEInventorySystem@th.fujikura.com', 
    pass: ''
  }
};
const transporter = nodemailer.createTransport(smtpConfig);
module.exports.EmailSend = async function (req,res){
  let query ;
  const { strPlantCodeFrom,strPlantCodeDestination,strSubject,strDate,strTotalquantity} = req.body;
  try {   
    const client = await ConnectPG_DB();
    // query = `SELECT 
    //       t.user_email AS user_email
    //         FROM "CUSR".cu_user_m t
    //         JOIN "CUSR".cu_user_humantrix t2 ON t.user_emp_id = t2.empcode  
    //         WHERE 
    //             t.user_costcenter LIKE '%180'
    //             AND t.user_position <> ''
    //             and t2.status ='Active'
    //             AND t2.work_location = '${strPlantCodeDestination}'
    //             AND t2.pos_grade NOT IN ('TL1', 'TL2', 'TSL','TSX');
    // '
    let strEmailFormat = `
    <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Notification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
            <br><br>
            <br><br>
            <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                <tr>
                    <td align="center" style="padding: 20px 0; background-color: #b8e0d2; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                        <h2 style="color: #2a6f65; margin: 0;">📦 Delivery Notification </h2>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 20px;">
                        <p style="font-size: 16px; color: #333;">
                            Dear, SE ${strPlantCodeDestination} Team  
                            <br><br>
                            มีการส่งของจาก <strong>Factory ${strPlantCodeFrom}</strong> เข้ามาในระบบของคุณ โปรดตรวจสอบรายละเอียดของรายการเพื่อเตรียมรับอุปกรณ์ให้เรียบร้อย
                        </p>
                        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 6px; margin-top: 10px;">
                            <p style="margin: 0; color: #1a237e;">📝 รายละเอียด:</p>
                            <ul style="margin: 10px 0 0; padding-left: 20px; color: #1a237e;">
                                <li><strong>โรงงานต้นทาง:</strong> Factory ${strPlantCodeFrom}</li>
                                <li><strong>วันที่ส่ง:</strong> ${strDate} </li>
                                <li><strong>จำนวนอุปกรณ์:</strong> ${strTotalquantity} ชิ้น</li>
                            </ul>
                        </div>
                        <p style="font-size: 14px; color: #555; margin-top: 15px;">
                            กรุณาตรวจสอบข้อมูลผ่านระบบของคุณ และดำเนินการต่อให้เรียบร้อย
                        </p>
                        <div style="text-align: center; margin-top: 20px;">
                            <a href="http://10.17.100.183:4003/InventorymanagementSystem" style="text-decoration: none; background-color: #2a6f65; color: #fff; padding: 10px 20px; border-radius: 6px; font-size: 16px;">ตรวจสอบรายการ</a>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td align="center" style="padding: 15px; font-size: 12px; color: #777;">
                        <p style="margin: 0;">© 2025 fujikura electronics (thailand) ltd. All rights reserved.</p>
                    </td>
                </tr>
            </table>
            <br><br>
            <br><br>
            <br><br>
            <br><br>

        </body>
        </html>
        `
    let query2 = `SELECT unnest(string_to_array('Chayanon.i@th.fujikura.com', ',')) AS user_email;` 
    const result =  await client.query(query2);
    if(result.rows.length > 0){
      const emailList = result.rows.map(row => row.user_email);
      const mailOptions = {
        from: "SEInventorySystem@th.fujikura.com",
        to: emailList,
        subject: strSubject,
        html: strEmailFormat
      };
      if(await transporter.sendMail(mailOptions)){
        res.status(200).json({message:'Success',email:emailList});
      }else{
        res.status(204).json({message:'Can not send email'});
      }
    }else{
      res.status(204).json({message:'Not found'});
    }
    DisconnectPG_DB(client);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
}

