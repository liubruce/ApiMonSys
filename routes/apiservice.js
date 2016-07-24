var express = require('express');
var router = express.Router();
var schedule = require('node-schedule');
var connection = require('../database/dbsource.js');
var pubfuncs = require('../service/pubfunctions');


/* GET home page. */
router.get('/open/taskLists.json', function (req, res, next) {

    connection.query('select * from taskapiinfo', function (err, rows, fields) {
        if (err) throw err;
        //var success = '任务列表';
        //res.render('index', { title: success, schedule: schedule, rows: rows });
        res.json(rows);
    });

});

//v2/open/available/${task_id}.json

router.get('/open/available/:id', function (req, res, next) {

    var taskid = (req.params.id).toUpperCase().replace(/.JSON/, "");
    var selectStr = 'select * from apimonitordata' +  pubfuncs.formatNow(new Date()) + ' where task_id=' + taskid; //+ ' and create_time>' + currentDate

    if (req.params.length > 1) {

        var start_date = new Date(req.params.start_date).getTime();
        var end_date = new Date(req.params.end_date).getTime();

        selectStr = selectStr + ' and create_time>=' + start_date + ' and create_time <=' + end_date;
    }
    else {
        var currentDate = new Date(pubfuncs.getDatewithoutHMS(new Date())).getTime();
        selectStr = selectStr + ' and create_time>=' + currentDate;

    }
    //for (var i=0; i< req.)
    //res.json(selectStr + ' length: ' +  req.query.length );

    connection.query(selectStr, function (err, rows, fields) {
        if (err) throw err;
        //var success = '任务列表';
        //res.render('index', { title: success, schedule: schedule, rows: rows });
        if (rows.length > 0)
            res.json(rows);
        else
            res.json('没有数据')
    });
});

module.exports = router;
