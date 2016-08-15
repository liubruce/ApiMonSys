/**
 * Created by bruceliu on 16/7/31.
 */

var express = require('express');
var router = express.Router();
var schedule = require('node-schedule');
var connection = require('../database/dbsource.js');
var pubfuncs = require('../service/pubfunctions');


/* GET home page. */
router.get('/taskfaults/:id', function(req, res, next) {
    var whereStr = '';
    if (req.params.id) {
        var taskid = (req.params.id).toUpperCase().replace(/.JSON/, "");
        whereStr = ' where a.task_id = ' + taskid;

    }
    var selectStr = 'select a.*, DATE_FORMAT(FROM_UNIXTIME(a.fault_time/1000),"%Y-%m-%d %H:%i:%S") as faulttime, b.task_name ' +
        ' from taskfaultinfo a left join taskapiinfo b on a.task_id=b.task_id ' + whereStr + ' order by a.task_id, fault_time desc';
    console.log(selectStr);
    connection.query(selectStr, function (err, rows, fields) {
        if (err) throw err;
        var success = '故障列表';
        res.render('taskfaults', {title: success, schedule: schedule, rows: rows, task_name: req.query.task_name});
    });

});

router.get('/', function(req, res, next) {

    var selectStr = 'select a.task_id, count(*) as faultnums, b.task_name from taskfaultinfo a left join taskapiinfo b ' +
        'on a.task_id=b.task_id group by a.task_id';

    var newRows = [];
    connection.query(selectStr, function (err, rows, fields) {
        if (err) throw err;
        var success = '故障汇总, 当前时间：' + pubfuncs.getDatewithHMS(new Date());
        rows.forEach(function(oneRow){
            connection.query('select  DATE_FORMAT(FROM_UNIXTIME(fault_time/1000),"%Y-%m-%d %H:%i:%S") as faulttime ' +
                'from taskfaultinfo where task_id =' + oneRow.task_id + ' order by fault_time desc limit 1',function (err, secondrows, fields){
                if (err) throw err;
                //console.log(secondrows[0].task_id + "最后一次故障是 :" + secondrows[0].faulttime);
                newRows.push(secondrows);

                if (newRows.length === rows.length)
                {

                    res.render('taskfaultAggr', {title: success, rows: rows, faultRows: newRows});
                }

            });

//            connection.query('select * from apimonitordata' + pubfuncs.formatNow(new Date()), function (err, rows, fields){

            });
        //res.json(otherRows);
        //res.render('taskfaultAggr', {title: success, schedule: schedule, rows: rows, otherRows: otherRows});
    });
});

module.exports = router;

