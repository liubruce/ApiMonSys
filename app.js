var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var editTask = require('./routes/edittask');
var apiservice = require('./routes/apiservice');

//从此后面的require 是Bruce Liu自己书写的程序
var schedule = require('node-schedule');
var taskconfig = require('./taskschedule/taskconfig.js');

var callSoapApi = require('./taskschedule/callSoapApi');

//增加日志输出 by Bruce
var log4js = require('log4js');
log4js.configure({
    appenders: [
        {type: 'console'}, //控制台输出
        {
            type: 'file', //文件输出
            filename: 'logs/access.log',
            maxLogSize: 1024,
            backups: 3,
            category: 'normal'
        }
    ]
});
var logger4js = log4js.getLogger('normal');
logger4js.setLevel('INFO');

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(log4js.connectLogger(logger4js, {level: log4js.levels.INFO}));

app.use('/', routes);
app.use('/edittask', editTask);
app.use('/v2',apiservice);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


taskconfig(schedule);


/*
 connection.connect();
 connection.query('use apimonitor')
 connection.query('select * from taskapiinfo', function(err, rows, fields) {
 if (err) throw err;
 for(var i=0; i<rows.length; i++){
 //var result = rows[i];
 //console.log('The solution is: ', rows[i].task_id + rows[i].task_name + ' ' + rows[i].frequency);
 var j = schedule.scheduleJob('/' + rows[i].frequency + ' * * * * * *',  callSoapApi(rows[i].api_url));
 //var res=url.parse(rows[i].api_url,true);
 //console.log(url.format(res));
 break;
 }

 });
 connection.end();
 */

/*

 var j = schedule.scheduleJob('0/5 * * * * * ？',  function(){
 console.log('The answer to life, the universe, and everything!'+ Date());
 });



 var rule = new schedule.RecurrenceRule();

 var times = [];

 for(var i=1; i<60; i= i+ 5){

 times.push(i)

 }

 rule.second = times;

 //rule.second = [2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,];



 var j = schedule.scheduleJob(rule, function(){
 callSoapApi('');

 console.log('任务执行!'+ Date());
 });
 */


/*
 var schedule = require('node-schedule');

 var rule = new schedule.RecurrenceRule();
 rule.second = 5;
 // minute = 42;

 var j = schedule.scheduleJob(rule, require('./callSoapApi'));
 */
module.exports = app;
