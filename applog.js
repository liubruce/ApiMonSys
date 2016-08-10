/**
 * Created by bruceliu on 16/7/27.
 */


var log4js = require('log4js');

log4js.configure({

    appenders: [
        {
            type: 'console',
            category: "console"

        }, //控制台输出
        {
            type: "file",
            filename: 'logs/log.log',
            pattern: "_yyyy-MM-dd",
            maxLogSize: 20480,
            backups: 3,
            category: 'dateFileLog'

        }//日期文件格式
    ],
    replaceConsole: true,   //替换console.log
    levels:{
        dateFileLog: 'debug',
        console: 'debug'
    }
});

//
//app.use(log4js.connectLogger(logger4js, { level: 'auto', format: HTTP_LOG_FORMAT_DEV }));

var dateFileLog = log4js.getLogger('dateFileLog');
var consoleLog = log4js.getLogger('console');

exports.logger = consoleLog;

exports.use = function(app) {
    var HTTP_LOG_FORMAT_DEV = ':method :url :status :response-time ms - :res[content-length]';
    app.use(log4js.connectLogger(consoleLog, {level:'auto', format:HTTP_LOG_FORMAT_DEV}));
}