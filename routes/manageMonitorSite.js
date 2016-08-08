/**
 * Created by bruceliu on 16/8/3.
 */

var express = require('express');
var router = express.Router();
var connection = require('../database/dbsource.js');
var pubfuncs = require('../service/pubfunctions');
var createGuid = require('../service/createGuid');
var log4js = require('../applog').logger;

router.get('/monitorlists', function (req, res, next) {
   // searchData.searchMonitorRawData(req, res, 'API', 'JSON');
    var success = '监测点列表';
    var whereStr = '';

    var selectStr = 'select * from monitorsite';
    //console.log(selectStr);
    connection.query(selectStr, function (err, rows, fields) {
        if (err) throw err;
        var success = '监测点列表';
        res.render('manageMonitorSite', {title: success, rows: rows});
    });


});

router.get('/editmonitor', function (req, res, next) {

    if (req.query.monitorid) {
        switch (req.query.action) {
            case "edit":
                connection.query('select * from monitorsite where id=' + req.query.monitorid, function (err, rows, fields) {
                    if (err) throw err;
                    var success = '修改监测点';
                    res.render('editMonitorSite', {title: success, rows: rows});
                });
                break;
            case "add":
                var success = '新建监测点';
                var rows = [];
                rows.push(0, {});
                var uuid = createGuid.guid();
                rows[0] = {
                    "monitor_name": "",
                    "monitor_desc": "",
                    "uuid": uuid,
                };
                res.render('editMonitorSite', {title: success, rows: rows});
                break;
            case "delete" :
                connection.query('delete from monitorsite where id=' + req.query.monitorid, function (err, rows, fields) {
                    if (err) throw err;
                    //var success = '删除成功';
                    //res.render('editTask', {title: success, rows: rows});
                    res.redirect('/monitorlists');
                });
                break;
        }

    }


});

router.post('/editmonitor', function (req, res) {
    // console.log('body:' + req.body);
//{"taskid":"8","taskname":"4G","taskdesc":"","frequency":"15","apitype":"SOAP","apimethod":"GET","apiurl":"http://wsf.cdyne.com/WeatherWS/Weather.asmx?wsdl","status":"false"}
    if (req.body.taskid > 0) {
        var userModSql = 'UPDATE monitorsite SET monitor_name = ?,monitor_desc = ? WHERE id = ?'; //

        var userModSql_Params = [req.body.monitorname, req.body.monitordesc,  req.body.monitorid]; //,
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

        });
        //res.send('修改完成！');
        res.redirect('/monitorlists');
    } else {
        //新增任务
        var values = [req.body.monitorname, req.body.monitordesc, req.body.uuid];

        console.log(req.body.monitorname +',' + req.body.monitordesc + ',' + req.body.uuid)
        //create_time   | response_time | status | task_id
        connection.query('INSERT INTO monitorsite SET monitor_name = ?,monitor_desc = ?, uuid=?', values,
            function (error, results) {
                if (error) {
                    log4js.debug("Write 监测点错误 Error: " + error.message);
                    //connection.end();
                    return;
                }
                log4js.debug('Inserted: ' + results.affectedRows + ' row.');
                log4js.debug('Id inserted: ' + results.insertId);
            }
        );
        res.redirect('/monitorlists');
    }
});


module.exports = router;
