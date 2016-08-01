var express = require('express');
var router = express.Router();
var schedule = require('node-schedule');
var connection = require('../database/dbsource.js');
var pubfuncs = require('../service/pubfunctions');

/* GET home page. */
router.get('/tasklists', function (req, res, next) {

    connection.query('select * from taskapiinfo', function (err, rows, fields) {
        if (err) throw err;
        //设置任务执行状态
        var newRows = [];
        rows.forEach(function (oneRow) {
            var selectStr = 'select availrate, status, DATE_FORMAT(FROM_UNIXTIME(create_time/1000),"%Y-%m-%d %H:%i:%S") as createtime' +
                ' from apimonitordata' + pubfuncs.formatNow(new Date()) + ' where task_id =' + oneRow.task_id +
                ' order by create_time desc limit 1';

            //console.log(selectStr);
            connection.query(selectStr, function (err, secondrows, fields) {
                if (err) throw err;
                //console.log(secondrows[0].task_id + "最后一次故障是 :" + secondrows[0].faulttime);
                if (secondrows.length > 0)
                    newRows.push(secondrows);
                else
                    newRows.push('{"availrate":"","status","","createtime":"今天没有执行"}');

                if (newRows.length === rows.length) {
                    // res.json(newRows);
                    //console.log(newRows[0][0].faulttime);
                    //console.log(fields);
                    //console.log(rows);
                    // res.render('taskfaultAggr', {title: success, rows: rows, faultRows: newRows});

                    var success = '任务列表';
                    res.render('index', {title: success, schedule: schedule, rows: rows, newRows: newRows});
                }

            });


        });

    });
});

    module.exports = router;
