/**
 * Created by bruceliu on 16/7/30.
 */

var connection = require('../database/dbsource.js');
var pubfuncs = require('../service/pubfunctions');
var callSoapApi = require('../taskschedule/callSoapApi');
var log4js = require('../applog').logger;

function searchMonitorRawData(req, res, apiflag, resultPage, app_id){

    function output(res, result, apiflag){
        if (apiflag === 'API')
        res.json(result);
        else res.render(resultPage, {title: '任务监控实时数据', rows: result ,task_name: req.query.task_name});

    }

    var taskidStr = '';

//    console.log('id:::' + req.params.id);

    if (!(typeof req.params.id === 'undefined'))
    {
        var taskidStr = (req.params.id).toUpperCase().replace(/.JSON/, "");
        taskidStr = ' a.task_id=' + taskidStr + ' and ';
    }

    if (app_id) taskidStr = taskidStr + ' a.task_id in (select task_id from taskapiinfo where application_id=' + app_id + ' ) and ';


    console.log('taskidstr ' + taskidStr + ' ' + app_id);

    var selectStr = 'select a.response_time, a.task_id, b.task_name, a.availrate, a.correctrate,DATE_FORMAT(FROM_UNIXTIME(a.create_time/1000),' +
        '"%Y-%m-%d %H:%i:%S") as create_time, a.monitorid from apimonitordata' + pubfuncs.formatNow(new Date()) +
        ' a left join taskapiinfo b on a.task_id=b.task_id  where ' + taskidStr;

    if (((typeof req.query.start_date === 'undefined') && (typeof req.query.end_date === 'undefined'))) {
        var currentDate = pubfuncs.getDateYMD(new Date(), ' 0:0:0')
        //console.log(currentDate);
        currentDate = new Date(currentDate);
        //console.log(currentDate);
        currentDate = currentDate.getTime();
        //console.log(currentDate);
        selectStr = selectStr + '  a.create_time>=' + currentDate;
        //console.log(selectStr);
        connection.query(selectStr, function (err, rows, fields) {
            if (err) res.json(err.message);
            else {


                //var success = '任务列表';
                //res.render('index', { title: success, schedule: schedule, rows: rows });
                if (rows.length > 0)
                    //res.json(rows);
                    output(res,rows,apiflag);
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

            var selectStr = 'select a.response_time, a.task_id,b.task_name, a.availrate, a.correctrate,DATE_FORMAT(FROM_UNIXTIME(a.create_time/1000),' +
                '"%Y-%m-%d %H:%i:%S") as create_time, a.monitorid from apimonitordata' + pubfuncs.formatNow(new Date(start_date)) +
                ' a left join taskapiinfo b on a.task_id=b.task_id where ' +
                taskidStr;

            selectStr = selectStr + '  a.create_time>=' + start_date + ' and a.create_time <=' + end_date;

            connection.query(selectStr, function (err, rows, fields) {
                if (err) res.json(err.message);
                else {
                    if (rows.length > 0)
                        output(res,rows,apiflag);
                    else
                        res.json('没有数据')
                }
            });
        } else {
            var newRows = [];
            var datemax = Math.ceil((end_date - start_date) / (86400 * 1000));
            if (datemax === 1) datemax = 2;
            //var caculateRows = 0;
            for (var i = 0; i < datemax; i++) {
                var caculateDate = start_date + i * 86400 * 1000;
                var dateInfo = pubfuncs.getDateYMD(new Date(caculateDate), '');
                if (i > 0) caculateDate = new Date(dateInfo + ' 0:0:0').getTime();
                var caculateEnd = new Date(dateInfo + ' 23:59:59').getTime();

                caculateEnd = (caculateEnd > end_date)  ? end_date : caculateEnd;

                var selectStr = 'select a.response_time, a.status, a.task_id, b.task_name, a.availrate, a.correctrate,DATE_FORMAT(FROM_UNIXTIME(a.create_time/1000),' +
                    '"%Y-%m-%d %H:%i:%S") as create_time, a.monitorid from apimonitordata' + pubfuncs.formatNow(new Date(caculateDate)) +
                    ' a left join taskapiinfo b on a.task_id=b.task_id where '
                 + taskidStr;
                selectStr = selectStr + '  a.create_time>=' + caculateDate + ' and a.create_time <=' + caculateEnd;
                //  （caculateEnd > end_date ）? end_date : caculateEnd;
                log4js.debug('select : ' +  selectStr);
                connection.query(selectStr, function (err, rows, fields) {
                    if (err) res.json(err.message);
                    else {
                        newRows.push(rows);
                        //caculateRows = caculateRows +1;

                        if (newRows.length >= datemax)
                        {
                            output(res,rows,apiflag);
                            //res.json(newRows);
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
}

function searchMonitorData(req, res, flagStr) {
    var taskid = (req.params.id).toUpperCase().replace(/.JSON/, "");

    var fieldstr = 'select max_response_time, min_response_time,round(total_response_time/total,2) as avg_response_time, total, task_id,monitorid, ' +
        'available, correctness,DATE_FORMAT(FROM_UNIXTIME(' + flagStr + 'time/1000),"%Y-%m-%d %H:%i:%S") as ' + flagStr + 'time ';

    var selectStr = fieldstr + ' from apimonitordata_' + flagStr +  pubfuncs.formatNow(new Date()) + ' where task_id=' + taskid;

    if (((typeof req.query.start_date === 'undefined') && (typeof req.query.end_date === 'undefined'))) {
        if (flagStr == 'hour')
            var currentDate = pubfuncs.getDatewithoutHMS(new Date());
        else
            var currentDate = pubfuncs.getDateYMD(new Date(), '');
        //console.log(currentDate);
        currentDate = new Date(currentDate);
        //console.log(currentDate);
        currentDate = currentDate.getTime();
        //console.log(currentDate);
        selectStr = selectStr + ' and ' + flagStr + 'time>=' + currentDate;
        //console.log(selectStr);
        connection.query(selectStr, function (err, rows, fields) {
            if (err) res.json(err  +' ;SQL语句：' + selectStr);
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

            var selectStr = fieldstr + ' from apimonitordata_' + flagStr + pubfuncs.formatNow(new Date(start_date)) + ' where task_id=' + taskid; //+ ' and create_time>' + currentDate
            selectStr = selectStr + ' and ' + flagStr + 'time>=' + start_date + ' and ' + flagStr + 'time <=' + end_date;

            connection.query(selectStr, function (err, rows, fields) {
                if (err) res.json(err + ' ;SQL语句：' + selectStr);
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
                //log4js.debug('计算日期：' + caculateDate);
                var dateInfo = pubfuncs.getDateYMD(new Date(caculateDate),'');
                //log4js.debug('计算日期：' + dateInfo);

                if (i > 0) caculateDate = new Date(dateInfo + ' 0:0:0').getTime();
                var caculateEnd = new Date(dateInfo + ' 23:59:59').getTime();

                caculateEnd = (caculateEnd > end_date) ? end_date : caculateEnd;

                var selectStr = fieldstr + ' from apimonitordata_' + flagStr + pubfuncs.formatNow(new Date(caculateDate)) + ' where task_id=' + taskid; //+ ' and create_time>' + currentDate
                selectStr = selectStr + ' and ' + flagStr + 'time>=' + caculateDate + ' and ' + flagStr + 'time <=' + caculateEnd;
                //  （caculateEnd > end_date ）? end_date : caculateEnd;
                log4js.debug('select : ' + selectStr);
                connection.query(selectStr, function (err, rows, fields) {
                    if (err) res.json(err+ ' ;SQL语句：' + selectStr);
                    else {
                        newRows.push(rows);
                        //caculateRows = caculateRows +1;

                        if (newRows.length >= datemax) {
                            res.json(newRows);
                        }
                    }

                });
                //break;
            }

            //console.log('间隔日期：' + Math.ceil((end_date - start_date) / (86400*1000)));
        }


    }

}


function updateMonitorStatus(status,status_msg, monitorid){
    var updateStr = 'update monitorsite SET status=' + status + ', status_msg = "' + status_msg + '", heartbeat_time = ' + new Date().getTime() +
        ' where id=' + monitorid;
    //console.log(updateStr);
    connection.query(updateStr,
        function (error, results) {
            if (error) {
                log4js.debug("update monitorsite 数据错误 Error: " + error.message);
                return;
            }
            log4js.debug('Updated: ' + results.affectedRows + ' row.');
        });
}


module.exports.searchMonitorData = searchMonitorData;
module.exports.searchMonitorRawData = searchMonitorRawData;
module.exports.updateMonitorStatus= updateMonitorStatus;