const express = require("express");
const oracledb = require('oracledb');
const app = express();
const port = 4002;
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


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  