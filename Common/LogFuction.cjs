const fs = require("fs");
const path = require("path");
const moment = require("moment");
function writeLogError(err, query) {
  const currentDate = moment().format("DD-MM-YYYY");
  const fullTime = moment().format("DD-MM-YYYY HH:mm:ss");
  const logFileName = `${currentDate}.log`;
  const logFilePath = path.join("./Log/", logFileName);

  const timeStampedMessage = `[${fullTime}] ERROR : ${err}\n  QUERY : ${query} \n -------------------------------------------------------------- \n`;
  if (!fs.existsSync(path.join("./Log/"))) {
    fs.mkdirSync(path.join("./Log/"));
  }
  fs.appendFile(logFilePath, timeStampedMessage, (err) => {
    if (err) {
      console.error("Error writing log file:", err);
    }
  });
}
module.exports = { writeLogError };
