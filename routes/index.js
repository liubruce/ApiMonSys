var express = require('express');
var router = express.Router();
var schedule = require('node-schedule');
var connection = require('../database/dbsource.js');


/* GET home page. */
router.get('/', function(req, res, next) {

/*
  if (schedule.scheduledJobs['T_2']) {
    var result = schedule.cancelJob('T_2'  );
    for (i=3;i<12;i++){
      result = schedule.cancelJob('T_'+i  );
    }
    if (result) {
      var success = 'success'; //console.log('jobs canceled');
    }
  }

*/

  connection.query('select * from taskapiinfo', function(err, rows, fields) {
    if (err) throw err;
    var success = '任务列表';
    res.render('index', { title: success, schedule: schedule, rows: rows });
  });

});

module.exports = router;
