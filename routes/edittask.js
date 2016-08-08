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
    //console.log('taskid:' + req.query.taskid + ' action:' + req.query.action);

    var taskid = req.query.taskid;
    if (taskid) {
        switch (req.query.action) {
            case "edit":
                connection.query('select * from taskapiinfo where task_id=' + taskid, function (err, rows, fields) {
                    if (err) throw err;
                    var success = '任务修改';
                    connection.query('select * from monitorsite a left join (select monitor_id from  tasklinkmonitor' +
                        ' where task_id= ' + taskid + ') b on a.id = b.monitor_id;', function (err, monitorrows, fields) {

                        res.render('editTask', {
                            title: success,
                            rows: rows,
                            monitorrows: monitorrows,
                        });
                    });

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
                    "status": 1,
                    "monitor_id": '0',
                    "operationname": '',
                    "params": ''
                };
                var monitoridrows = [];
                connection.query('select * from monitorsite', function (err, monitorrows, fields) {
                    res.render('editTask', {
                        title: success,
                        rows: rows,
                        monitorrows: monitorrows,
                        monitoridrows: monitoridrows
                    });
                });
                break;
            case "copy":
                var success = '新增任务';
                var rows = [];
                rows.push(0, {});
                rows[0] = {
                    "task_id": 0,
                    "task_name": req.query.task_name,
                    "task_desc": req.query.task_desc,
                    "freqency": 0,
                    "api_type": "SOAP",
                    "api_method": req.query.api_method,
                    "api_url": req.query.api_url,
                    "status": 1,
                    "monitor_id": '0',
                    "operationname": req.query.operationname,
                    "params": req.query.params
                };
                var monitoridrows = [];
                connection.query('select * from monitorsite', function (err, monitorrows, fields) {
                    res.render('editTask', {
                        title: success,
                        rows: rows,
                        monitorrows: monitorrows,
                        monitoridrows: monitoridrows
                    });
                });
                break;
            case "delete" :
                connection.query('delete from taskapiinfo where task_id=' + req.query.taskid, function (err, rows, fields) {
                    if (err) throw err;
                    //var success = '删除成功';
                    //res.render('editTask', {title: success, rows: rows});
                    res.redirect('/tasklists');
                });
                break;
        }

    }


    //res.render('editTask', { title: '任务修改', schedule: schedule, rows: rows });
});

router.post('/', function (req, res) {

    var monitorids = req.body.monitor;

    console.log('monitorids = ' + monitorids);

    console.log(req.body);
//改 up
    if (req.body.taskid > 0) {

        var userModSql = 'UPDATE taskapiinfo SET task_name = ?,task_desc = ?, frequency=?,api_type=?,api_method=?,' +
            'api_url=? ,status=?, operationname=?, params=? WHERE task_id = ?'; //

        var userModSql_Params = [req.body.taskname, req.body.taskdesc, req.body.frequency, req.body.apitype, req.body.apimethod,
            req.body.apiurl, req.body.status, req.body.operationname, req.body.params, req.body.taskid]; //,


        connection.query(userModSql, userModSql_Params, function (err, result) {
            if (err) {
                //console.log('[UPDATE ERROR] - ',err.message);
                log4js.debug(userModSql + ' ' + userModSql_Params);
                log4js.debug('[UPDATE ERROR] - ' + err.message);
                return;
            }
            log4js.debug(userModSql + ',,' + userModSql_Params);
            log4js.debug('----------UPDATE-------------');
            log4js.debug('UPDATE affectedRows', result.affectedRows);
            log4js.debug('******************************');
            //增加监控
            //改变schedule信息
            if (schedule.scheduledJobs[req.body.taskid.toString()])  schedule.cancelJob(req.body.taskid.toString());
            linkTaskMonitor(req.body.taskid, req.body.monitor, req.body.apimethod, req.body.operationname, req.body.params);
            newSchedule(req);
        });
        //res.send('修改完成！');
        res.redirect('/tasklists');
    } else {
        //新增任务
        var values = [req.body.taskname, req.body.taskdesc, req.body.frequency, req.body.apitype, req.body.apimethod,
            req.body.apiurl, req.body.status, new Date().getTime(), new Date().getTime(), req.body.operationname, req.body.params];

        //create_time   | response_time | status | task_id
        connection.query('INSERT INTO taskapiinfo SET task_name = ?,task_desc = ?, frequency=?,api_type=?,api_method=?,' +
            'api_url=? ,status=?,create_time=?,update_time=?, operationname=?, params=? ', values,
            function (error, results) {
                if (error) {
                    log4js.debug("Write API 监控数据错误 Error: " + error.message);
                    //connection.end();
                    return;
                }
                log4js.debug('Inserted: ' + results.affectedRows + ' row.');
                log4js.debug('Id inserted: ' + results.insertId);
                req.body.taskid = results.insertId;
                linkTaskMonitor(req.body.taskid, req.body.monitor, req.body.apimethod, req.body.operationname, req.body.params);
                newSchedule(req);
            }
        );
        res.redirect('/tasklists');
    }
});


function newSchedule(req) {

    if (typeof req.body.monitor === 'undefined') return;
    var monitorarray = [];
    monitorarray = req.body.monitor.toString().split(",");
    //console.log('不可能吗：' + monitorarray);
    for (i = 0; i < monitorarray.length; i++) {
        if ((monitorarray[i] === '0') && (req.body.status == 1)) {
            function exectask(apiurl, taskid) { //+ rows[i].frequency
                callSoapApi.execGet(apiurl, taskid);
            }

            var startTime = 0;
            var times = [];
            if (parseInt(req.body.frequency) === 0) return;
            for (var j = startTime; j <= 60; j = j + parseInt(req.body.frequency)) {

                times.push(j)

            }
            var rule = new schedule.RecurrenceRule();
            rule.minute = times;
            startTime = startTime + 1;
            if (startTime > 1) startTime = 0;

            log4js.debug('times = ' + times);
            var oneJob = schedule.scheduleJob(req.body.taskid.toString(), rule, //startTime.toString()+ '/' + rows[i].frequency + ' * * * * *'
                function (taskid, apiurl) {
                    exectask(apiurl, taskid, connection)
                }.bind(null, req.body.taskid, req.body.apiurl));
        }
    }
//    if ('0' in monitorarray) console.log('可能吗：' + monitorarray);


}


function linkTaskMonitor(taskid, monitorids,  api_method, operationname, params) {
    if (typeof monitorids === 'undefined') return;
    var monitorarray = [];
    monitorarray = monitorids.toString().split(",");
    console.log('monitorarray ===' + monitorarray);
    //var j = 0;
    connection.query('delete from tasklinkmonitor where task_id =' + taskid);
    for (i = 0; i < monitorarray.length; i++) {

        //console.log('monitorarray =' + monitorarray[i]);
        connection.query('INSERT INTO tasklinkmonitor SET task_id = ?,monitor_id = ?', [taskid, monitorarray[i]],
            function (error, results) {
                if (error) {
                    log4js.debug("Write tasklinmonitor 数据错误 Error: " + error.message);
                    //connection.end();
                    return;
                }
                //console.log('INSERT INTO tasklinkmonitor SET task_id = %,monitor_id = %', [taskid, monitorarray[j]]);
                log4js.debug('Inserted: ' + results.affectedRows + ' row.');
                log4js.debug('Id inserted: ' + results.insertId);
                //刷新监控点的任务
                if (!(parseInt(monitorarray[i]) === 0)) {
                    connection.query('select * from monitorsite where taskid=?,monitor_id=?', [taskid, monitorarray[i]],
                    function(error, rows) {
                        if (error) {
                            log4js.debug("Write tasklinmonitor 数据错误 Error: " + error.message);
                            //connection.end();
                            return;
                        }
                        //写程序
                        if (rows.length > 0){
                            updateRemoteSchedule(rows[0].address, rows[0].port, taskid, api_method, operationname, params)
                        }
                    });
                    }
                });
            }
}

function updateRemoteSchedule(address, port, apiurl, taskid, api_method, operationname, params) {

    var post_data = {
        apiurl: apiurl, taskid: taskid, api_method: api_method, operationname: operationname, params: params
    };//这是需要提交的数据

    var content = qs.stringify(post_data);

    var options = {
        host: address,
        port: port,
        path: '/v2/update/schedule/' + taskid + '.json',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': content.length
        }
    };
    // console.log("post options:\n", options);
    // console.log("content:", content);
    // console.log("\n");

    var req = http.request(options, function (res) {
        //    console.log("statusCode: ", res.statusCode);
        //    console.log("headers: ", res.headers);
        var _data = '';
        res.on('data', function (chunk) {
            _data += chunk;
        });
        res.on('end', function () {
            console.log("\n--->>\nresult:", _data)
        });
    });

    req.on('error', function (e) {
            //writeApiData(connection, currentTime,0, 0, taskid, 0, 0);
            //writefaultdata(connection,currentTime,taskid, e.message);
            console.error('网络问题:' + e.message); // + res.statusCode);
        }
    );
    req.write(content);

    req.end();


}

module.exports = router;
