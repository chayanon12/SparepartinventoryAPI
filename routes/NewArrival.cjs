const express = require("express");
const router = express.Router();
const NewArr = require("../WorkService/Model_newarrival_API.cjs");

router.get("/getmenuname",NewArr.getmenuname);
router.get("/getChart",NewArr.getChart);
router.get("/GetCountNewarrDashboard",NewArr.GetCountNewarrDashboard);
router.get("/GetDttableNewArr",NewArr.GetDttableNewArr);
router.get("/getDataReportNewArr",NewArr.getDataReportNewArr);
router.get("/getTypeNewArr",NewArr.getTypeNewArr);
router.post("/insertnewtypeNewArr",NewArr.insertnewtypeNewArr);
router.get('/getdataRequestNumber',NewArr.getdataRequestNumber);
router.get('/getSerialRequestNumberPostgres',NewArr.getSerialRequestNumberPostgres);
router.post('/setReqNoStatusData',NewArr.setReqNoStatusData);
router.get('/getProductItemsNewArr',NewArr.getProductItemsNewArr);
router.get('/getDatableFixedFac',NewArr.getDatableFixedFac);



module.exports = router;
