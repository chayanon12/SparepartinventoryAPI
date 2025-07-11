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
router.get('/getNotificationTransection',NewArr.getNotificationTransection);
router.get('/getDatatoTranferbyReqNo',NewArr.getDatatoTranferbyReqNo);
router.get('/getDatatoTranferbySerial',NewArr.getDatatoTranferbySerial);
router.post('/setTrasferfactory',NewArr.RequestTrasferfactory);
router.post('/setCancelTransferfactory',NewArr.CancelTransferfactory);
router.post('/setReceivedTransferfactory',NewArr.ReceivedTransferfactory);
router.get('/getShowTransfer',NewArr.ShowTransfer);
router.post('/EmailSend',NewArr.EmailSend);
router.get('/getdataFromReqno',NewArr.getdataFromReqno);



module.exports = router;
