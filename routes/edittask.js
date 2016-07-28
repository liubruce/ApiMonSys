var express = require('express');
var router = express.Router();
var connection = require('../database/dbsource.js');
var schedule = require('node-schedule');
var callSoapApi = require('../taskschedule/callSoapApi');
var log4js = require('../applog').logger;

/* GET users listing. */
router.get('/', function (req, res, next) {
    //console.log(req.query.taskid);
    //res.send(req.query.taskid);

    //console.log('select * from taskapiinfo where task_id=' + req.query.taskid);
    if (req.query.taskid) {
        switch (req.query.action) {
            case "edit":
                connection.query('select * from taskapiinfo where task_id=' + req.query.taskid, function (err, rows, fields) {
                    if (err) throw err;
                    var success = '任务修改';
                    res.render('editTask', {title: success, rows: rows});
                });
                break;
            case "add":
                var success = '新增任务';
                var rows = [];
                rows.push(0, {});
                rows[0] = {
                    "task_id": 0,
                    "task_name": "",
                    "task_desc": "",
                    "freqency": 0,
                    "api_type": "SOAP",
                    "api_method": "get",
                    "api_url": "",
                    "status": 1
                };
                res.render('editTask', {title: success, rows: rows});
                break;
            case "delete" :
                connection.query('delete from taskapiinfo where task_id=' + req.query.taskid, function (err, rows, fields) {
                    if (err) throw err;
                    //var success = '删除成功';
                    //res.render('editTask', {title: success, rows: rows});
                    res.redirect('/');
                });
                break;
        }

    }


    //res.render('editTask', { title: '任务修改', schedule: schedule, rows: rows });
});

router.post('/', function (req, res) {
    // console.log('body:' + req.body);
//{"taskid":"8","taskname":"4G","taskdesc":"","frequency":"15","apitype":"SOAP","apimethod":"GET","apiurl":"http://wsf.cdyne.com/WeatherWS/Weather.asmx?wsdl","status":"false"}
    if (req.body.taskid > 0) {
        var userModSql = 'UPDATE taskapiinfo SET task_name = ?,task_desc = ?, frequency=?,api_type=?,api_method=?,' +
            'api_url=? ,status=? WHERE task_id = ?'; //

        var userModSql_Params = [req.body.taskname, req.body.taskdesc, req.body.frequency, req.body.apitype, req.body.apimethod,
            req.body.apiurl, req.body.status, req.body.taskid]; //,
//改 up
        connection.query(userModSql, userModSql_Params, function (err, result) {
            if (err) {
                //console.log('[UPDATE ERROR] - ',err.message);
                log4js.debug(userModSql + ' ' + userModSql_Params);
                res.send('[UPDATE ERROR] - ' + err.message);
                return;
            }
            log4js.debug('----------UPDATE-------------');
            log4js.debug('UPDATE affectedRows', result.affectedRows);
            log4js.debug('******************************');
            //改变schedule信息
            if (schedule.scheduledJobs[req.body.taskid.toString()])  schedule.cancelJob(req.body.taskid.toString());
            newSchedule(req);
        });
        //res.send('修改完成！');
        res.redirect('/');
    } else {
        //新增任务
        var values = [req.body.taskname, req.body.taskdesc, req.body.frequency, req.body.apitype, req.body.apimethod,
            req.body.apiurl, req.body.status, new Date().getTime(),new Date().getTime()];

        //create_time   | response_time | status | task_id
        connection.query('INSERT INTO taskapiinfo SET task_name = ?,task_desc = ?, frequency=?,api_type=?,api_method=?,' +
            'api_url=? ,status=?,create_time=?,update_time=?', values,
            function (error, results) {
                if (error) {
                    log4js.debug("Write API 监控数据错误 Error: " + error.message);
                    //connection.end();
                    return;
                }
                log4js.debug('Inserted: ' + results.affectedRows + ' row.');
                log4js.debug('Id inserted: ' + results.insertId);
                newSchedule(req);
            }
        );
        res.redirect('/');
    }
});


function newSchedule(req){
    if (req.body.status == 1) {
        function exectask(apiurl, taskid) { //+ rows[i].frequency
            callSoapApi.execGet(apiurl, taskid);
        }

        var startTime = 0;
        var times = [];

        for (var j = startTime; j <= 60; j = j + req.body.frequency) {

            times.push(j)

        }
        var rule = new schedule.RecurrenceRule();
        rule.minute = times;
        startTime = startTime + 1;
        if (startTime > 1) startTime = 0;

        log4js.debug(times);
        var oneJob = schedule.scheduleJob(req.body.taskid.toString(), rule, //startTime.toString()+ '/' + rows[i].frequency + ' * * * * *'
            function (taskid, apiurl) {
                exectask(apiurl, taskid, connection)
            }.bind(null, req.body.taskid, req.body.apiurl));
    }


}
module.exports = router;
