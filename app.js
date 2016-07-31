var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var loggermorgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var editTask = require('./routes/edittask');
var apiservice = require('./routes/apiservice');
var apiservice_data = require('./routes/apiservice_data');
var taskfaults = require('./routes/taskfaultlists');

//从此后面的require 是Bruce Liu自己书写的程序
var schedule = require('node-schedule');
var taskconfig = require('./taskschedule/taskconfig.js');

var callSoapApi = require('./taskschedule/callSoapApi');
var log4js = require('./applog').logger;


var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(loggermorgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//app.use(log4js.connectLogger(logger4js, {level: log4js.levels.INFO}));
//调整日志输出格式
//app.use(log4js.connectLogger(logger4js, {level:log4js.levels.INFO, format:':method :url'}));

//app.use(log4js.connectLogger(logger4js, {level:log4js.levels.INFO, format:':method :url'}));

//var HTTP_LOG_FORMAT_DEV = ':method :url :status :response-time ms - :res[content-length]';
//app.use(log4js.connectLogger(logger4js, { level: 'auto', format: HTTP_LOG_FORMAT_DEV }));

//log4js.debug("collectTime=%s",collectTime);

//app.use(log4js.connectLogger(logger4js, {level: 'auto', format:':method :url'}));

app.use('/', routes);
app.use('/edittask', editTask);
app.use('/',taskfaults);
app.use('/v2',apiservice);
app.use('/v2',apiservice_data);

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
