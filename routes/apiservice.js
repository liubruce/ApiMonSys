var express = require('express');
var router = express.Router();
var schedule = require('node-schedule');
var connection = require('../database/dbsource.js');
var pubfuncs = require('../service/pubfunctions');
var callSoapApi = require('../taskschedule/callSoapApi');
var log4js = require('../applog').logger;

/* GET home page. */
router.get('/open/taskLists.json', function (req, res, next) {

    connection.query('select task_id, api_url,frequency,status,task_desc,task_name' +
        ' from taskapiinfo', function (err, rows, fields) {
        if (err) throw res.json(err);
        //var success = '任务列表';
        //res.render('index', { title: success, schedule: schedule, rows: rows });
        res.json(rows);
    });

});

//v2/open/available/${task_id}.json

router.post('/open/task/:id',function(req,res){
    //console.log(req.body);
    //需要写入数据库

    callSoapApi.writeApiData(connection,req.body.currentTime,req.body.statusCode, req.body.responseTime,
        req.body.taskid, req.body.availrate, req.body.correctrate, req.body.monitorid);

    res.json('ok');
});



router.get('/open/taskFaultLists.json', function (req, res, next) {
    var selectStr = 'select task_id,DATE_FORMAT(FROM_UNIXTIME(fault_time/1000),"%Y-%m-%d %H:%i:%S") as fault_time ,errormessage from taskfaultinfo order by task_id';

    connection.query(selectStr, function (err, rows, fields) {
        if (err) throw res.json(err + ' select:' + selectStr);
        //var success = '任务列表';
        //res.render('index', { title: success, schedule: schedule, rows: rows });
        res.json(rows);
    });

});

router.get('/open/taskFaultAggr.json', function (req, res, next) {
    var selectStr = 'select task_id, count(*) as faultnums from taskfaultinfo group by task_id';

    connection.query(selectStr, function (err, rows, fields) {
        if (err) throw res.json(err + ' select:' + selectStr);
        //var success = '任务列表';
        //res.render('index', { title: success, schedule: schedule, rows: rows });
        res.json(rows);
    });

});


module.exports = router;
