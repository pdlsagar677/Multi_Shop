const { createLogger, format, transports } = require("winston");

const isDev = process.env.NODE_ENV !== "production";

const logger = createLogger({
  level: isDev ? "debug" : "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    isDev
      ? format.combine(format.colorize(), format.printf(({ timestamp, level, message, stack }) => {
          return `${timestamp} ${level}: ${stack || message}`;
        }))
      : format.json()
  ),
  transports: [new transports.Console()],
  silent: process.env.NODE_ENV === "test",
});

module.exports = logger;
