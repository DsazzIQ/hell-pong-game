import { Logger, ILogObj, IMeta } from 'tslog';
import * as path from 'path';
import { createStream } from 'rotating-file-stream';
interface ILogObjMeta {
  [name: string]: IMeta;
}
enum LogLevel {
  Silly,
  Trace,
  Debug,
  Info,
  Warn,
  Error,
  Fatal
}

const logDirectory = path.join(__dirname, '..', 'logs');

const infoStream = createStream('info.log', {
  size: '10M', // rotate every 10 MegaBytes
  interval: '1d', // rotate daily
  path: logDirectory
});

const errorStream = createStream('error.log', {
  size: '10M', // rotate every 10 MegaBytes
  interval: '1d', // rotate daily
  path: logDirectory
});

const logger: Logger<ILogObj> = new Logger();

const logFormatter = (logObject: ILogObj & ILogObjMeta) => {
  const message = logObject[0];
  const { hostname, path, logLevelName, date } = logObject['_meta'];
  return `${date.toISOString()}|${hostname}|${logLevelName}| ${message} ${
    path ? '[' + path.filePathWithLine + ']' : ''
  }\n`;
};

logger.attachTransport((logObject) => {
  const { logLevelId } = logObject['_meta'];
  if (logLevelId <= LogLevel.Warn) {
    infoStream.write(logFormatter(logObject));
  }
});

logger.attachTransport((logObject) => {
  const { logLevelId } = logObject['_meta'];
  if (logLevelId >= LogLevel.Error) {
    errorStream.write(logFormatter(logObject));
  }
});

export default logger;
