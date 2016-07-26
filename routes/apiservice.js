var express = require('express');
var router = express.Router();
var schedule = require('node-schedule');
var connection = require('../database/dbsource.js');
var pubfuncs = require('../service/pubfunctions');


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

router.get('/open/available/:id', function (req, res, next) {

    var taskid = (req.params.id).toUpperCase().replace(/.JSON/, "");

    var selectStr = 'select response_time, task_id, availrate, correctrate,DATE_FORMAT(FROM_UNIXTIME(create_time/1000),' +
        '"%Y-%m-%d %H:%i:%S") as create_time from apimonitordata' + pubfuncs.formatNow(new Date()) + ' where task_id=' + taskid; //+ ' and create_time>' + currentDate

    if (((typeof req.query.start_date === 'undefined') && (typeof req.query.end_date === 'undefined'))) {
        var currentDate = pubfuncs.getDatewithoutHMS(new Date())
        //console.log(currentDate);
        currentDate = new Date(currentDate);
        //console.log(currentDate);
        currentDate = currentDate.getTime();
        //console.log(currentDate);
        selectStr = selectStr + ' and create_time>=' + currentDate;
        //console.log(selectStr);
        connection.query(selectStr, function (err, rows, fields) {
            if (err) res.json(err);
            else {


                //var success = '任务列表';
                //res.render('index', { title: success, schedule: schedule, rows: rows });
                if (rows.length > 0)
                    res.json(rows);
                else
                    res.json('没有数据')
            }
        });
    }
    else {

        var start_date = req.query.start_date.replace(/'/, "").replace(/'/, "");
        start_date = new Date(start_date);
        var end_date = req.query.end_date.replace(/'/, "").replace(/'/, "");
        end_date = new Date(end_date);

        if ((start_date.toString() === 'Invalid Date') || (end_date.toString() === 'Invalid Date')) {
            res.json('日期格式错误！');
            return;
        }        //console.log(start_date);
        start_date = start_date.getTime();
        end_date = end_date.getTime();

        if (start_date > end_date) {
            res.json('开始日期要小于结束日期！');
            return;
        }

        if ((end_date - start_date) > 86400 * 1000 * 7) {
            res.json('日期范围不能超过7天！');
            return;
        }
        if (pubfuncs.formatNow(new Date(start_date)) === pubfuncs.formatNow(new Date(end_date))) {

            var selectStr = 'select response_time, task_id, availrate, correctrate,DATE_FORMAT(FROM_UNIXTIME(create_time/1000),' +
                '"%Y-%m-%d %H:%i:%S") as create_time from apimonitordata' + pubfuncs.formatNow(new Date(start_date)) + ' where task_id=' + taskid; //+ ' and create_time>' + currentDate
            selectStr = selectStr + ' and create_time>=' + start_date + ' and create_time <=' + end_date;
            connection.query(selectStr, function (err, rows, fields) {
                if (err) res.json(err);
                else {
                    if (rows.length > 0)
                        res.json(rows);
                    else
                        res.json('没有数据')
                }
            });
        } else {
            var newRows = [];
            var datemax = Math.ceil((end_date - start_date) / (86400 * 1000));
            var caculateRows = 0;
            for (var i = 0; i <= datemax; i++) {
                var caculateDate = start_date + i * 86400 * 1000;
                var dateInfo = pubfuncs.getDateYMD(new Date(caculateDate));
                if (i > 0) caculateDate = new Date(dateInfo + ' 0:0:0').getTime();
                var caculateEnd = new Date(dateInfo + ' 23:59:59').getTime();

                caculateEnd = (caculateEnd > end_date)  ? end_date : caculateEnd;

                var selectStr = 'select response_time, status, task_id, availrate, correctrate,DATE_FORMAT(FROM_UNIXTIME(create_time/1000),' +
                    '"%Y-%m-%d %H:%i:%S") as create_time from apimonitordata' + pubfuncs.formatNow(new Date(caculateDate)) + ' where task_id=' + taskid; //+ ' and create_time>' + currentDate
                selectStr = selectStr + ' and create_time>=' + caculateDate + ' and create_time <=' + caculateEnd;
                  //  （caculateEnd > end_date ）? end_date : caculateEnd;

                connection.query(selectStr, function (err, rows, fields) {
                    if (err) res.json(err);
                    else {
                        newRows.push(rows);
                        caculateRows = caculateRows +1;
                        console.log('caculateRows:' + caculateRows + ' datemax:' + datemax);
                        console.log('selectstr' + selectStr);
                        if (caculateRows > datemax)
                        {
                           // create_time, response_time status task_id availrate correctrate
                            //i = 0;
                            res.json(newRows);
                        }
                    }

                });
                //break;
            }

            //console.log('间隔日期：' + Math.ceil((end_date - start_date) / (86400*1000)));
        }


    }


    //for (var i=0; i< req.)
    //res.json(selectStr + ' length: ' +  req.query.length );

});

module.exports = router;
