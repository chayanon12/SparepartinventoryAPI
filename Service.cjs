const express = require("express");
const oracledb = require('oracledb');
const app = express();
const port = 9002;
const Common = require("./routes/Common.cjs");
const cors = require('cors');
oracledb.initOracleClient({
  // tnsAdmin: "D:\\app\\\Chayanon.I\\product\\11.2.0\\client_2\\network\\admin",
  tnsAdmin: process.env.TNS_ADMIN,
});
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], // เพิ่ม headers ที่จำเป็น
}));
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === 'OPTIONS') {
    return res.sendStatus(200);  
  }
  next();
});

app.use("/Sparepart/api", require("./routes/Common.cjs"));

app.get("/", async (req, res) => {
  let connection;

  try {
    connection = await oracledb.getConnection({
      user: 'qad',
      password: 'qad',
      connectString: 'TCIX01'
    });
    const result = await connection.execute(
      `BEGIN
         :cursor := PR.POZ_REPORT.RPT_POZ(:po_no);
       END;`,
      {
        po_no: '2E705260',  
        cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
      }
    );
    const cursor = result.outBinds.cursor;
    let row;
    const rows = [];
    while ((row = await cursor.getRow())) {
      rows.push(row);
    }
    await cursor.close();

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error occurred');
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  