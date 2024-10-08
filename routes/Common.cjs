const express = require("express");
const router = express.Router();
const Common = require("../WorkService/Model_common_API.cjs");




router.get("/common/getData",Common.GetData);
router.get("/common/genSerial",Common.genSerial);
router.post("/common/insertData",Common.insertData);
router.get("/common/getDttable",Common.GetDttable);
router.get("/common/GetCountDashboard",Common.GetCountDashboard);
router.get("/common/insertIcon",Common.insertIcon);
router.get("/common/getOutSum",Common.getOutSum);
router.get("/common/GetDttableAll",Common.GetDttableAll);
router.get("/common/getfac",Common.getFac);
router.get("/common/getCheckSerial",Common.getCheckSerial);
router.get("/common/getCheckIdCodeAdmin",Common.getCheckIdCodeAdmin);
router.get("/common/getCheckIdCodeUser",Common.getCheckIdCodeUser);
router.get("/common/getIPaddress",Common.getIPaddress);

module.exports = router;
