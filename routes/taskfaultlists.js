/**
 * Created by bruceliu on 16/7/31.
 */

var express = require('express');
var router = express.Router();
var schedule = require('node-schedule');
var connection = require('../database/dbsource.js');


/* GET home page. */
router.get('/taskfaults/:id', function(req, res, next) {
    var whereStr = '';
    if (req.params.id) {
        var taskid = (req.params.id).toUpperCase().replace(/.JSON/, "");
        whereStr = ' where task_id = ' + taskid;

    }
    connection.query('select *, DATE_FORMAT(FROM_UNIXTIME(fault_time/1000),"%Y-%m-%d %H:%i:%S") as faulttime ' +
        ' from taskfaultinfo ' + whereStr + ' order by task_id', function (err, rows, fields) {
        if (err) throw err;
        var success = '故障列表';
        res.render('taskfaults', {title: success, schedule: schedule, rows: rows});
    });

});

router.get('/taskFaultAggr', function(req, res, next) {
    var selectStr = 'select a.task_id, count(*) as faultnums, b.task_name from taskfaultinfo a left join taskapiinfo b ' +
        'on a.task_id=b.task_id group by a.task_id';

    connection.query(selectStr, function (err, rows, fields) {
        if (err) throw err;
        var success = '故障汇总';
        res.render('taskfaultAggr', {title: success, schedule: schedule, rows: rows});
    });

});

module.exports = router;

