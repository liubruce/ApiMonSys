var express = require('express');
var router = express.Router();
var schedule = require('node-schedule');
var connection = require('../database/dbsource.js');
var pubfuncs = require('../service/pubfunctions');
var callSoapApi = require('../taskschedule/callSoapApi');
var log4js = require('../applog').logger;


router.get('/open/taskhour/:id', function (req, res, next) {

    var taskid = (req.params.id).toUpperCase().replace(/.JSON/, "");

    var fieldstr = 'select max_response_time, min_response_time,round(total_response_time/total,2) as avg_response_time, task_id, ' +
        'available, correctness,DATE_FORMAT(FROM_UNIXTIME(hourtime/1000),"%Y-%m-%d %H:%i:%S") as hour_time ';

    var selectStr = fieldstr +' from apimonitordata_hour' + pubfuncs.formatNow(new Date()) + ' where task_id=' + taskid; //+ ' and create_time>' + currentDate

    if (((typeof req.query.start_date === 'undefined') && (typeof req.query.end_date === 'undefined'))) {
        var currentDate = pubfuncs.getDatewithoutHMS(new Date())
        //console.log(currentDate);
        currentDate = new Date(currentDate);
        //console.log(currentDate);
        currentDate = currentDate.getTime();
        //console.log(currentDate);
        selectStr = selectStr + ' and hour_time>=' + currentDate;
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

            var selectStr = fieldstr + ' from apimonitordata_hour' + pubfuncs.formatNow(new Date(start_date)) + ' where task_id=' + taskid; //+ ' and create_time>' + currentDate
            selectStr = selectStr + ' and hourtime>=' + start_date + ' and hourtime <=' + end_date;

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
            //var caculateRows = 0;
            for (var i = 0; i < datemax; i++) {
                var caculateDate = start_date + i * 86400 * 1000;
                var dateInfo = pubfuncs.getDateYMD(new Date(caculateDate));
                if (i > 0) caculateDate = new Date(dateInfo + ' 0:0:0').getTime();
                var caculateEnd = new Date(dateInfo + ' 23:59:59').getTime();

                caculateEnd = (caculateEnd > end_date)  ? end_date : caculateEnd;

                var selectStr = fieldstr + ' from apimonitordata_hour' + pubfuncs.formatNow(new Date(caculateDate)) + ' where task_id=' + taskid; //+ ' and create_time>' + currentDate
                selectStr = selectStr + ' and hourtime>=' + caculateDate + ' and hourtime <=' + caculateEnd;
                //  （caculateEnd > end_date ）? end_date : caculateEnd;
                log4js.debug('select : ' +  selectStr);
                connection.query(selectStr, function (err, rows, fields) {
                    if (err) res.json(err);
                    else {
                        newRows.push(rows);
                        //caculateRows = caculateRows +1;

                        if (newRows.length >= datemax)
                        {
                            res.json(newRows);
                        }
                    }

                });
                //break;
            }

            //console.log('间隔日期：' + Math.ceil((end_date - start_date) / (86400*1000)));
        }


    }

});

module.exports = router;
