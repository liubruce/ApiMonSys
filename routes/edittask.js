var express = require('express');
var router = express.Router();
var connection = require('../database/dbsource.js');
var schedule = require('node-schedule');
var callSoapApi = require('../taskschedule/callSoapApi');
var log4js = require('../applog').logger;
var qs = require('querystring');
var http = require('http');
var searchData = require('../service/searchData');

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
                    "frequency": 0,
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
                    "frequency": req.query.frequency,
                    "api_type": "SOAP",
                    "api_method": req.query.api_method,
                    "api_url": req.query.api_url,
                    "status": 1,
                    "monitor_id": '0',
                    "operationname": req.query.operationname,
                    "params": req.query.params
                };
                console.log(req.query);
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
            //if (schedule.scheduledJobs[req.body.taskid.toString()])  schedule.cancelJob(req.body.taskid.toString());
            linkTaskMonitor(req.body.taskid, req.body.monitor, req.body.apiurl, req.body.apimethod, req.body.operationname,
                req.body.params, req.body.status, req.body.frequency);
            //newSchedule(req);
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
                linkTaskMonitor(req.body.taskid, req.body.monitor, req.body.apiurl, req.body.apimethod, req.body.operationname,
                    req.body.params, req.body.status, req.body.frequency);
                //newSchedule(req);
            }
        );
        res.redirect('/tasklists');
    }
});


function newSchedule(ifcancel, status, taskid, apiurl, frequency) {

//    if (typeof req.body.monitor === 'undefined') return;
    if (ifcancel === 1) {
        if (schedule.scheduledJobs[taskid.toString()])  schedule.cancelJob(taskid.toString());
        return;
    }

    if (status == 1) {
        function exectask(apiurl, taskid) { //+ rows[i].frequency
            callSoapApi.execGet(apiurl, taskid);
        }

        var startTime = 0;
        var times = [];
        if (parseInt(frequency) === 0) return;
        for (var j = startTime; j <= 60; j = j + parseInt(frequency)) {

            times.push(j)

        }
        var rule = new schedule.RecurrenceRule();
        rule.minute = times;
        startTime = startTime + 1;
        if (startTime > 1) startTime = 0;

        log4js.debug('times = ' + times);
        var oneJob = schedule.scheduleJob(taskid.toString(), rule, //startTime.toString()+ '/' + rows[i].frequency + ' * * * * *'
            function (taskid, apiurl) {
                exectask(apiurl, taskid, connection)
            }.bind(null, taskid, apiurl));
    }

}

function ifInArray(monitors, monitorid){

    for (var i=0; i< monitors; i++){
        if (parseInt(monitors[i]) === parseInt(monitorid)) return true;
    }
    return false;

}

function linkTaskMonitor(taskid, monitorids, apiurl, api_method, operationname, params, status, frequency) {

    var monitorarray = [];
    var monitors = [];
    var keepmonitors = [];
    if (!(typeof monitorids === 'undefined')) {
        monitors = monitorids.toString().split(",");
    }

    connection.query('select monitor_id from tasklinkmonitor where task_id =' + taskid, function (error, rows) {
        if (error) {
            log4js.debug("select tasklinkmonitor 数据错误 Error: " + error.message);
            //connection.end();
            return;
        }
        //写程序
        console.log('length=' + rows.length + 'monitors = '+ monitors);
        if (rows.length > 0) {
            for (var i = 0; i < rows.length; i++) {
                if (ifInArray(monitors, rows[i].monitor_id ) == true) //保留和更新任务
                {
                    console.log('保留和更新任务'+ rows[i].monitor_id);
                    monitorarray.push(rows[i].monitor_id);
                    //keepmonitors.push(rows)
                    updateMonitorTask(rows[i].monitor_id, apiurl, taskid, api_method, operationname, params, status, frequency, 0);
                }
                else  //删除和取消任务
                {
                    console.log('删除'+ rows[i].monitor_id);
                    connection.query('delete from tasklinkmonitor where task_id =' + taskid + ' and monitor_id=' + rows[i].monitor_id);
                    updateMonitorTask(rows[i].monitor_id, apiurl, taskid, api_method, operationname, params, status, frequency, 1);

                }
            }
        }//else monitorarray = monitorarray.concat(monitors);

        for (var i = 0; i < monitors.length; i++) {
            if (ifInArray(monitorarray, monitors[i]) === false) {
                console.log('新增'+ monitors[i]);
                //新增
                connection.query('INSERT INTO tasklinkmonitor SET task_id = ?,monitor_id = ?', [taskid, monitors[i]],
                    function (error, results) {
                        if (error) {
                            log4js.debug("Write tasklinmonitor 数据错误 Error: " + error.message);
                            //connection.end();
                            return;
                        }
                        //console.log('INSERT INTO tasklinkmonitor SET task_id = %,monitor_id = %', [taskid, monitorarray[j]]);
                        log4js.debug('Inserted: ' + results.affectedRows + ' row.');
                        log4js.debug('Id inserted: ' + results.insertId);
                    });
                updateMonitorTask(monitors[i], apiurl, taskid, api_method, operationname, params, status, frequency, 0);
            }
        }

    });
}

function updateMonitorTask(monitor_id, apiurl, taskid, api_method, operationname, params, status, frequency, ifcancel) {
    if (parseInt(monitor_id) === 0) {
        newSchedule(ifcancel, status, taskid, apiurl, frequency);
    } else {

        var selectStr = 'select * from monitorsite where id=' + monitor_id;
        console.log(selectStr);
        connection.query(selectStr,
            function (error, rows) {
                if (error) {
                    log4js.debug("select monitorsite 数据错误 Error: " + error.message);
                    //connection.end();
                    return;
                }
                //写程序
                if (rows.length > 0) {
                    updateRemoteSchedule(rows[0].address, rows[0].port, apiurl, taskid, api_method, operationname, params, status, frequency, ifcancel,monitor_id);
                }
            });
    }
}

function updateRemoteSchedule(address, port, apiurl, taskid, api_method, operationname, params, status, frequency, ifcancel, monitor_id) {

    var post_data = {
        apiurl: apiurl, taskid: taskid, api_method: api_method, operationname: operationname, params: params,
        status: status, frequency: frequency, ifcancel: ifcancel
    };//这是需要提交的数据

    var content = qs.stringify(post_data);

    var options = {
        host: address,
        port: port,
        path: '/v2/update/schedule/',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': content.length
        }
    };

    //console.log(options);
    var req = http.request(options, function (res) {
        var _data = '';
        res.on('data', function (chunk) {
            _data += chunk;
        });
        res.on('end', function () {
            console.log("\n--->>\nresult:", _data)
            searchData.updateMonitorStatus(1,'更新了任务ID=' + taskid, monitor_id);
        });
    });

    req.on('error', function (e) {
            //writeApiData(connection, currentTime,0, 0, taskid, 0, 0);
            //writefaultdata(connection,currentTime,taskid, e.message);

            console.error('网络问题:' + e.message); // + res.statusCode);

            searchData.updateMonitorStatus(0,'监测点失联：' + e.message, monitor_id);

        }
    );
    req.write(content);

    req.end();


}


module.exports = router;
