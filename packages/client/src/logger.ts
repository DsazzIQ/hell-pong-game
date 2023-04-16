import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(info => {
      const { message } = info;
      const { name, line } = info.position;
      const method = info.method ? `:${info.method}` : '';
      return `[${name}${method}:${line}] ${message}`;
    })
  ),
  defaultMeta: { service: 'server' },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    }),
    new transports.File({
      filename: 'logs/info.log',
      format: format.combine(
        format.timestamp(),
        format.json()
      )
    }),
    new transports.File({
      level: 'error',
      filename: 'logs/error.log',
      format: format.combine(
        format.timestamp(),
        format.json()
      )
    })
  ]
});

export default logger;