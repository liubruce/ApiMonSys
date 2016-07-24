/**
 * Created by bruceliu on 16/7/18.
 */
var callSoapApi = require('./callSoapApi');
var connection = require('../database/dbsource.js');
var pubfunc = require("../service/pubfunctions");

function createApiMonitorTable() {
    var date = new Date();
    var time = date.getTime()/1000;//转换成秒； 我们再将其转换成日期格式的：

    var date = new Date( (time + 86400) * 1000 );//.转换成第二天

    var dateStr = pubfunc.formatNow(date);
    //console.log(dateStr);
    connection.query(callSoapApi.createtablestr(dateStr));

    console.log("create table apimonitordata" + dateStr + " success!")
}

function createJobforCreateTable(schedule) {
    var rule = new schedule.RecurrenceRule();
    rule.hour = 23;
    rule.minute = 50;
//    console.log('taskid=' + rows[i].task_id + ' ' + times);
    var oneJob = schedule.scheduleJob('CreateTable', rule, //startTime.toString()+ '/' + rows[i].frequency + ' * * * * *'
        function () {
            createApiMonitorTable();
        });
}

function taskconfig(schedule) {


    var url = require("url");

    connection.connect();
    connection.query('use apimonitor');

    //schedule 一个创建数据表的任务

    createJobforCreateTable(schedule);

    //global.tasks = [];
    connection.query('select * from taskapiinfo', function (err, rows, fields) {
        if (err) throw err;
        var startTime = 0;
        for (var i = 0; i < rows.length; i++) {
            //var result = rows[i];
            //console.log('the solution is: ', rows[i].task_id + rows[i].task_name + ' ' + rows[i].frequency);
            // global.tasks.push(rows[i].task_id);
            if (rows[i].status == 0) {
                continue;
            }

            function exectask(apiurl, taskid) { //+ rows[i].frequency
                callSoapApi.execGet(apiurl, taskid)
            }

            var times = [];

            for (var j = startTime; j <= 60; j = j + rows[i].frequency) {

                times.push(j)

            }
            var rule = new schedule.RecurrenceRule();
            rule.minute = times;
            startTime = startTime + 1;
            if (startTime > 1) startTime = 0;

            console.log('taskid=' + rows[i].task_id + ' ' + times);
            var oneJob = schedule.scheduleJob(rows[i].task_id.toString(), rule, //startTime.toString()+ '/' + rows[i].frequency + ' * * * * *'
                function (taskid, apiurl) {
                    exectask(apiurl, taskid, connection)
                }.bind(null, rows[i].task_id, rows[i].api_url));

            //j.jobid = rows[i].task_id;

            //global.tasks.push(j);

            //var res=url.parse(rows[i].api_url,true);
            //console.log(url.format(res));
            //break;
        }

    });



    //connection.end();
    /*   var all_jobs = schedule.scheduledJobs;
     console.log('jobs' + schedule.scheduledJobs['T_1']);
     for(var i=0; i< all_jobs.length;i++){
     console.log(all_jobs[i]);
     } */
    //console.log(schedule.scheduledJobs[global.tasks[0]].name);

}


module.exports = taskconfig;
