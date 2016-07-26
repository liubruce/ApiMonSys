/**
 * Created by bruceliu on 16/7/18.
 */

var pubfunc = require("../service/pubfunctions");
/**
 * HOW TO Make an HTTP Call - GET
 */
// options for GET


function createtablestr(tableSuffix){
    var createtablestr = "CREATE TABLE IF NOT EXISTS `apimonitordata" + tableSuffix + "` (" +
        "`id` bigint(20) NOT NULL AUTO_INCREMENT,`create_time` bigint(20) NOT NULL," +
        "`response_time` float NOT NULL," +
        "`status` int(11) NOT NULL,`task_id` bigint(20) NOT NULL," +
        "`availrate` bigint(20),`correctrate` bigint(20),`monitorid` bigint(20), PRIMARY KEY (`id`)" +
        ") ENGINE=InnoDB AUTO_INCREMENT=15180 DEFAULT CHARSET=utf8;";

    return createtablestr;
}


function writeApiData(statusCode,responseTime,taskid, availrate, correctrate) {

    var values = [new Date().getTime(), responseTime, statusCode, taskid, availrate, correctrate];

    var connection = require('../database/dbsource.js');

    //create_time   | response_time | status | task_id

    var datestr = pubfunc.formatNow(new Date());
    connection.query(createtablestr(datestr));
    var insertSql = 'INSERT INTO apimonitordata' + datestr + ' SET create_time = ?, response_time = ? , ' +
        'status = ?, task_id=?, availrate=?, correctrate=?';
    //console.log(insertSql);
    connection.query(insertSql, values,
        function (error, results) {
            if (error) {
                console.log("Write API 监控数据错误 Error: " + error.message);
                //connection.end();
                return;
            }
            console.log('Inserted: ' + results.affectedRows + ' row.');
            console.log('Id inserted: ' + results.insertId);
        }
    );
    //GetData(client);
}
function execGet(apiurl, taskid) {

    var https = require('http');
    //global.tasks = [];
//    connection.query('select * from taskapiinfo', function(err, rows, fields) {


    //console.log(apiurl);

//var res=url.parse(rows[i].api_url,true);
    //console.log(url.format(res));

    var optionsget = apiurl;
    /*{
     host: 'wsf.cdyne.com', // here only the domain name
     // (no http/https !)
     port: 80,
     path: '/WeatherWS/Weather.asmx?wsdl', // the rest of the url with parameters if needed
     method: 'GET' // do GET
     }; */

    // console.info('Options prepared:');
    // console.info(optionsget);
    console.info('任务开始：' + taskid + " " + Date());

    // do the GET request
    var time = process.hrtime();
// [ 1800216, 25 ]

    //connection.connect();

    var reqGet = https.request(optionsget,
        function (res) {
            console.log("statusCode: ", res.statusCode + Date());

            //setTimeout(() =>
            //{
            var diff = process.hrtime(time);
            // [ 1, 552 ]
            var responseTime = ((diff[0] * 1e9 + diff[1]) / 1000000000).toFixed(2);
            console.log('耗时 %d 秒' + ' ' + taskid, responseTime);
            //写入数据库


            if (res.statusCode >= 200 && res.statusCode < 300) {
                var availrate = 1, correctrate =1;
            }else
                var availrate = 0, correctrate =0;

            writeApiData(res.statusCode,responseTime,taskid, availrate, correctrate);

            //schedule.job
            //console.log(`Benchmark took ${diff[0] * 1e9 + diff[1]} nanoseconds`);
            // benchmark took 1000000527 nanoseconds
            //  },
            //  1000);

            // uncomment it for header details
            //	console.log("headers: ", res.headers);

            /*
             res.on('data', function (d) {
             console.info('GET result:\n');
             process.stdout.write(d);
             console.info('\n\nCall completed');
             }); */

        }); //.bind(null,connection,taskid)

    reqGet.end();
    reqGet.on('error', function (e) {
            writeApiData(0,0,taskid, 0, 0);
            console.error('网络问题:' + e + ' statuscode：'); // + res.statusCode);
        }
    );

    console.log("调用结束 " + taskid);

    reqGet.on('response', function (response) {

        console.log("statusCode2222: " + taskid + ' ', response.statusCode + Date());

        var schedule = require('node-schedule');
        var connection = require('../database/dbsource.js');
        if (schedule.scheduledJobs['T_2']) {
            var result = schedule.cancelJob('T_2');
            for (i = 3; i < 12; i++) {
                result = schedule.cancelJob('T_' + i);
            }
            if (result) {
                var success = 'success'; //console.log('jobs canceled');
            }
        }


    })

}

module.exports.execGet = execGet;
module.exports.createtablestr = createtablestr;

