const winston = require("winston");

const { createLogger, transports, format } = require("winston");
const { combine, timestamp, label, printf } = format;

require("dotenv").config();
require("winston-mongodb");

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const errorLogger = createLogger({
  transports: [
    new transports.File({
      filename: "error.log",
      level: "error",
      format: combine(label({ label: "ERROR" }), timestamp(), myFormat),
    }),
    new transports.MongoDB({
      level: "error",
      db: process.env.DBURI,
      options: {
        useUnifiedTopology: true,
      },
      collection: "error_logs",
      format: format.combine(format.timestamp(), format.json()),
    }),
  ],
});

module.exports = { errorLogger };
