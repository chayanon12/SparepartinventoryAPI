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
router.get("/common/getProductItems",Common.getProductItems);
router.post("/common/getUserLogin",Common.getUserLogin);
router.post("/common/getUserLoginWithSingleLogon",Common.getUserLoginWithSingleLogon);
router.get("/common/getDataReport",Common.getDataReport);
router.get("/common/getModifyData",Common.getModifyData);
router.post("/common/updateModifyData",Common.updateModifyData);
router.get("/common/getType",Common.getType);
router.post("/common/addNewType",Common.InsertNewtype);
router.get("/common/getCostcenter",Common.getCostcenter);
router.post("/common/setUpdatedata",Common.setUpdatedata);
router.get("/common/setBrokenItem",Common.setBrokenItem);
router.get("/common/GetDttableFixSerial",Common.GetDttableFixSerial);
router.get("/common/getDatableFixedFac",Common.getDatableFixedFac);
router.get("/common/getUserDeptName",Common.getUserDeptName);


module.exports = router;
