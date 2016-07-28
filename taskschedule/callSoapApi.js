/**
 * Created by bruceliu on 16/7/18.
 */

var pubfunc = require("../service/pubfunctions");
var log4js = require('../applog').logger;
/**
 * HOW TO Make an HTTP Call - GET
 */
// options for GET


function createtablestr(tableSuffix) {
    var createtablestr = "CREATE TABLE IF NOT EXISTS `apimonitordata" + tableSuffix + "` (" +
        "`id` bigint(20) NOT NULL AUTO_INCREMENT,`create_time` bigint(20) NOT NULL," +
        "`response_time` float NOT NULL," +
        "`status` int(11) NOT NULL,`task_id` bigint(20) NOT NULL," +
        "`availrate` bigint(20),`correctrate` bigint(20),`monitorid` bigint(20), PRIMARY KEY (`id`)" +
        ") ENGINE=InnoDB AUTO_INCREMENT=15180 DEFAULT CHARSET=utf8;";

    return createtablestr;
}

function createhourtable(tableSuffix) {
    var createtablestr = "CREATE TABLE IF NOT EXISTS `apimonitordata_hour" + tableSuffix + "` (" +
        "`id` bigint(20) NOT NULL AUTO_INCREMENT," +
        "`monitorid` bigint(20), " +
        "`task_id` bigint(20) NOT NULL," +
        "`hourtime` bigint(20) NOT NULL," +
        "`min_response_time` float NOT NULL," +
        "`max_response_time` float NOT NULL," +
        "`available` bigint(20)," +
        "`correctness` bigint(20)," +
        "`total` int(11)," +
        "`total_response_time` float NOT NULL," +
        "PRIMARY KEY (`id`)" +
        ") ENGINE=InnoDB AUTO_INCREMENT=15180 DEFAULT CHARSET=utf8;";

    return createtablestr;
}

function caculateHourData(connection, datestr, responseTime, taskid, availrate, correctrate) {

    connection.query(createhourtable(datestr));


    var hourtime = new Date(pubfunc.getDatewithoutHMS(new Date())).getTime();


    var selectSql = 'select * from apimonitordata_hour' + datestr + ' where task_id=' + taskid + ' and hourtime=' + hourtime + '; ';


    connection.query(selectSql,
        function (error, rows, fields) {
            if (error) {
                log4js.debug("Select hour data Error: " + error.message);
                return;
            } else {
                if (rows.length > 0) {
                    var min_response_time;
                    var max_response_time;
                    var available = rows[0].available + availrate;
                    var correctness = rows[0].correctness + correctrate;
                    var total = rows[0].total + 1;
                    var total_response_time = parseFloat(rows[0].total_response_time) + parseFloat(responseTime);
                    if (rows[0].min_response_time < responseTime) min_response_time = responseTime;
                    else min_response_time = rows[0].min_response_time;

                    if (rows[0].max_response_time < responseTime) max_response_time = responseTime;
                    else max_response_time = rows[0].max_response_time;


                    var updateStr = 'update  apimonitordata_hour' + datestr + ' SET min_response_time = ?, max_response_time = ?,' +
                        'available = ?, correctness = ?, total = ?, total_response_time = ?' + ' where task_id=' + taskid + ' and hourtime=' + hourtime;
                    var values = [min_response_time, max_response_time, available, correctness, total, total_response_time];
                    log4js.debug('updateStr:' + updateStr);
                    log4js.debug('values:' + values);
                    connection.query(updateStr, values,
                        function (error, results) {
                            if (error) {
                                log4js.debug("Update API Hour 监控数据错误 Error: " + error.message);
                                //connection.end();
                                return;
                            }
                            //Caculate Hour and Day data

                            log4js.debug('Updated: ' + results.affectedRows + ' row.');
                            log4js.debug('Id Updated: ' + results.insertId);
                        }
                    );
                } else {

                    var insertStr = 'insert into  apimonitordata_hour' + datestr + ' SET min_response_time = ?, max_response_time = ?,' +
                        'available = ?, correctness = ?, task_id=? , hourtime = ? , total = ?, total_response_time = ? ';
                    var values = [responseTime, responseTime, availrate, correctrate, taskid, hourtime, 1, responseTime];
                    log4js.debug('insertStr:' + insertStr);
                    connection.query(insertStr, values,
                        function (error, results) {
                            if (error) {
                                log4js.debug("Write API Hour 监控数据错误 Error: " + error.message);
                                //connection.end();
                                return;
                            }
                            //Caculate Hour and Day data
                            log4js.debug('Inserted: ' + results.affectedRows + ' row.');
                            log4js.debug('Id inserted: ' + results.insertId);
                        }
                    );
                }

            }
        });


}


function writeApiData(statusCode, responseTime, taskid, availrate, correctrate) {


    var connection = require('../database/dbsource.js');

    //create_time   | response_time | status | task_id

    var datestr = pubfunc.formatNow(new Date());
    connection.query(createtablestr(datestr));

    var currentTime = new Date().getTime();
    var values = [currentTime, responseTime, statusCode, taskid, availrate, correctrate];

    var insertSql = 'INSERT INTO apimonitordata' + datestr + ' SET create_time = ?, response_time = ? , ' +
        'status = ?, task_id=?, availrate=?, correctrate=?';
    //console.log(insertSql);
    connection.query(insertSql, values,
        function (error, results) {
            if (error) {
                log4js.debug("Write API 监控数据错误 Error: " + error.message);
                //connection.end();
                return;
            }
            //Caculate Hour and Day data
            caculateHourData(connection, datestr, responseTime, taskid, availrate, correctrate);

            log4js.debug('Inserted: ' + results.affectedRows + ' row.');
            log4js.debug('Id inserted: ' + results.insertId);
        }
    );
    //GetData(client);
}
function execGet(apiurl, taskid) {

    var https = require('http');


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
    log4js.debug('任务开始：' + taskid + " " + Date());

    // do the GET request
    var time = process.hrtime();
// [ 1800216, 25 ]

    //connection.connect();

    var reqGet = https.request(optionsget,
        function (res) {
            log4js.debug("statusCode: ", res.statusCode + Date());

            //setTimeout(() =>
            //{
            var diff = process.hrtime(time);
            // [ 1, 552 ]
            var responseTime = ((diff[0] * 1e9 + diff[1]) / 1000000).toFixed(2); //000
            log4js.debug('耗时 %d 毫秒' + ' ' + taskid, responseTime);
            //写入数据库


            if (res.statusCode >= 200 && res.statusCode < 300) {
                var availrate = 1, correctrate = 1;
            } else
                var availrate = 0, correctrate = 0;

            writeApiData(res.statusCode, responseTime, taskid, availrate, correctrate);

            //schedule.job
            //console.log(`Benchmark took ${diff[0] * 1e9 + diff[1]} nanoseconds`);
            // benchmark took 1000000527 nanoseconds
            //  },
            //  1000);

            // uncomment it for header details
            //	console.log("headers: ", res.headers);


            res.on('data', function (d) {
                console.info('GET result:\n');
                //process.stdout.write(d);
                var diffdata = process.hrtime(time);
                // [ 1, 552 ]
                console.log('responseTime = ' + responseTime);
                console.log('responseTime data = ' + ((diffdata[0] * 1e9 + diffdata[1]) / 1000000).toFixed(2));
                console.info('\n\nCall completed');

            });

        }); //.bind(null,connection,taskid)

    reqGet.end();
    reqGet.on('error', function (e) {
            writeApiData(0, 0, taskid, 0, 0);
            console.error('网络问题:' + e + ' statuscode：'); // + res.statusCode);
        }
    );

    log4js.debug("调用结束 " + taskid);

    reqGet.on('response', function (response) {

        log4js.debug("statusCode2222: " + taskid + ' ', response.statusCode + Date());

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

