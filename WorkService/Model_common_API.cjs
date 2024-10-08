const { ConnectPG_DB, DisconnectPG_DB } = require("../Connection/DBConn.cjs");
const { writeLogError } = require("../Common/LogFuction.cjs");
const Fac = process.env.FacA1;
const fs = require("fs");

module.exports.GetData = async function (req, res) {
  var query = "";
  try {
    const strType = req.query.strType;
    const strPlantCode = req.query.strPlantCode;
    const strAbbrName = req.query.strAbbrName;
    const strTypename = req.query.strTypename;
    const client = await ConnectPG_DB();
    const json_data = {
      strType: strType,
      strPlantCode: strPlantCode,
      strAbbr: strAbbrName,
      strTypename: strTypename,
    };
    const json_convertdata = JSON.stringify(json_data);
    console.log(json_convertdata)
    query += ` SELECT * FROM "SE".spi_getdata('${json_convertdata}'); `;
    const result = await client.query(query);
    if (strType == "SERIAL") {
      let data = [];
      console.log("in");
      for (let i = 0; i < result.rows.length; i++) {
        data.push({ serial: result.rows[i].serialnumber });
      }
      res.status(200).json(data);
    } else if (strType == "DDL") {
      let data = [];
      for (let i = 0; i < result.rows.length; i++) {
        data.push({
          typeid: result.rows[i].typeid,
          typename: result.rows[i].typename,
        });
      }
      res.status(200).json(data);
    } else {
      res.status(200).json(result.rows);
    }
    DisconnectPG_DB(client);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

module.exports.GetDttable = async function (req, res) {
  var query = "";
  try {
    // const strPlantCode = req.query.strPlantCode;
    const client = await ConnectPG_DB();
    const json_data = {
      strPlantCode: Fac,
    };
    const json_convertdata = JSON.stringify(json_data);
    // query += ` SELECT * FROM "SE".spi_getDttable('${json_convertdata}'); `;
    query += `select 
              encode(sps.type_icon, 'base64') AS type_icon,
              sps.type_name ,
              spi.quantity ,
              spi.user_service,
              spi.quantity as onHands     
              from "SE".spi_product_item spi ,"SE".spi_product_store sps 
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
module.exports.GetDttableAll = async function (req, res) {
  var query = "";
  try {
    const client = await ConnectPG_DB();
    const json_data = {
      strPlantCode: Fac,
    };
    const json_convertdata = JSON.stringify(json_data);
    query += ` SELECT * FROM "SE".spi_getDttable('${json_convertdata}'); `;

    const result = await client.query(query);
    res.status(200).json(result.rows);
    DisconnectPG_DB(client);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.GetCountDashboard = async function (req, res) {
  var query = "";
  try {
    const client = await ConnectPG_DB();
    const json_data = {
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
module.exports.insertData = async function (req, res) {
  var query = "";
  try {
    const client = await ConnectPG_DB();
    let { dataList } = req.body;
    const json_convertdata = JSON.stringify(dataList);
    console.log(json_convertdata);
    query += ` CALL "SE".SPI_INSERT_DATA('[${json_convertdata}]','') `;

    const result = await client.query(query);
    if (result.rows[0].p_error == "") {
      res.status(200).json({ result: "Success" });
      return;
    } else {
      writeLogError(result.rows[0].p_error, query);
      if (
        result.rows[0].p_error ==
        `duplicate key value violates unique constraint "spi_product_action_serial_number_key"`
      ) {
        res.status(203).json({ result: "Duplicate" });
      } else if (result.rows[0].p_error == "Already Out") {
        res.status(204).json({ result: "Already Out" });
      } else if (result.rows[0].p_error == "Item_wrong") {
        res.status(205).json({ result: "Item_wrong" });
      } else {
        res.status(400).json({ result: result.rows[0].p_error });
      }
    }
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

module.exports.genSerial = async function (req, res) {
  var query = "";
  try {
    const strType = req.query.strType;
    const strPlantCode = req.query.strPlantCode;
    let strItem = req.query.strItem;
    const strItemID = req.query.strItemId;
    const strQty = parseInt(req.query.quantity);
    if (strItem == ''){
      console.log('in')
      const client = await ConnectPG_DB();
      let querySearch = 	`select type_id ,type_abbr from "SE".spi_product_store where spi_product_store.remark ='ACTIVE' and type_id= '${strItemID}' order by type_id `
      const resultX = await client.query(querySearch);
      strItem = resultX.rows[0].type_abbr;
      DisconnectPG_DB(client);
    }
    if (isNaN(strQty) || strQty <= 0) {
      return res.status(400).json({ message: "Invalid quantity specified." });
    }

    const client = await ConnectPG_DB();
    const json_data = {
      strType: strType,
      strPlantCode: strPlantCode,
      strItem: strItem,
      strItemId: strItemID,
    };
    const json_convertdata = JSON.stringify(json_data);
    
    query += ` SELECT * FROM "SE".spi_getdata('${json_convertdata}'); `;
    const result = await client.query(query);
    let existingSerialNumbers = result.rows[0].serialnumber;

    const generateSerialNumbers = (existingSerialNumbers, strItem, count) => {
      let serialNumbers = [];
      let baseSerialNumber = `${strItem}0000000001`;
      if (existingSerialNumbers === "") {
        let serialNumberInt = parseInt(
          baseSerialNumber.slice(strItem.length),
          10
        );

        while (serialNumbers.length < count) {
          let newSerialNumber = `${strItem}${serialNumberInt
            .toString()
            .padStart(10, "0")}`;
          serialNumbers.push(newSerialNumber);
          serialNumberInt += 1;
        }
      } else {
        let startingSerial = existingSerialNumbers;
        let serialNumberInt =
          parseInt(startingSerial.slice(strItem.length), 10) + 1;
        while (serialNumbers.length < count) {
          let newSerialNumber = `${strItem}${serialNumberInt
            .toString()
            .padStart(10, "0")}`;
          serialNumbers.push(newSerialNumber);
          serialNumberInt += 1;
        }
      }
      return serialNumbers;
    };

    const newSerialNumbers = generateSerialNumbers(
      existingSerialNumbers,
      strItem,
      strQty
    );
    let x = [];
    for (let i = 0; i < newSerialNumbers.length; i++) {
      x.push({ serial: newSerialNumbers[i] });
    }
    res.status(200).json(x);

    DisconnectPG_DB(client);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

module.exports.insertIcon = async function (req, res) {
  const images_path = "./assets/ram.png";
  var query = "";
  const icon = fs.readFileSync(images_path);
  try {
    const client = await ConnectPG_DB();

    query += `  UPDATE "SE".spi_product_store
      SET type_icon = $1
      WHERE type_id = $2`;
    const values = [icon, 24];
    const result = await client.query(query, values);
    res.status(200).json({ message: result });
    DisconnectPG_DB(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.getOutSum = async function (req, res) {
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
          FROM "SE".spi_product_item spi,
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

module.exports.getFac = async function (req, res) {
  var query = "";
  try {
    const client = await ConnectPG_DB();
    const json_data = {
      strPlantCode: Fac,
    };
    const json_convertdata = JSON.stringify(json_data);
    query += ` select distinct cc_ctr,cc_desc from "CUSR".cu_mfgpro_cc_mstr where cc_active = '1' order by cc_ctr ASC`;
    const result = await client.query(query);
    res.status(200).json(result.rows);
    DisconnectPG_DB(client);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

module.exports.getCheckSerial = async function (req, res) {
  var query = "";
  try {
    const client = await ConnectPG_DB();
    const { serial_number } = req.query;
    console.log(serial_number);
    if (serial_number == "") {
      query += `select 
      sps.type_name ,spa.serial_number,spa.movement_type ,
      to_char(spa.create_date,'DD/MM/YYYY HH:MI:SS') as Scan_in_Date,
      spa.admin_id,
      spa.user_id as user_dept,
      to_char(spa.update_date ,'DD/MM/YYYY HH:MI:SS') as Scan_out_Date,
      spa.product_status ,
      spa.admin_scan_out As admin_out_id
      from 
      "SE".spi_product_action spa ,"SE".spi_product_store sps
      where
      spa.item_id = sps.type_id 
`;
    } else {
      query += `select 
      sps.type_name ,spa.serial_number,spa.movement_type ,
      to_char(spa.create_date,'DD/MM/YYYY HH:MI:SS') as Scan_in_Date,
      spa.admin_id,
      spa.user_id as user_dept,
      to_char(spa.update_date ,'DD/MM/YYYY HH:MI:SS') as Scan_out_Date,
      spa.product_status ,
      spa.admin_scan_out As admin_out_id
      from 
      "SE".spi_product_action spa ,"SE".spi_product_store sps
      where
      spa.item_id = sps.type_id 
      and
      spa.serial_number = '${serial_number}'
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

module.exports.getCheckIdCodeAdmin = async function (req, res) {
  var query = "";
  try {
    const client = await ConnectPG_DB();
    const { empcode } = req.query;

    query += ` SELECT t.empcode ,t.ename ,t.esurname ,t.work_location
          FROM "CUSR".cu_user_humantrix  t
          where t.cost_center like '%180'
          and t.status  = 'Active'
          and t.empcode = '${empcode}'
  `;
  console.log(query);
    const result = await client.query(query);
    res.status(200).json(result.rows);
    DisconnectPG_DB(client);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};

module.exports.getCheckIdCodeUser = async function (req, res) {
  var query = "";
  try {
    const client = await ConnectPG_DB();
    const { empcode } = req.query;

    query += ` select t.empcode ,t.ename ,t.esurname ,t.work_location ,t.cost_center ,t.department ,t.process ,t.division ,t.status
               FROM "CUSR".cu_user_humantrix  t
               where t.status  = 'Active'
               and t.empcode = '${empcode}'
  `;
    const result = await client.query(query);
    res.status(200).json(result.rows);
    DisconnectPG_DB(client);
  } catch (error) {
    writeLogError(error.message, query);
    res.status(500).json({ message: error.message });
  }
};
module.exports.getIPaddress = async (req, res) => {
  try {
    const clientIp = req.connection.remoteAddress;
    const ip = clientIp.includes(":") ? clientIp.split(":").pop() : clientIp;
 
    res.status(200).send({ ip: ip });
  } catch (error) {
    writeLogError(err.message, "Cannot get IP address");
    res.status(500).json({ message: error.message });
  }
};
