var express = require('express');
var router = express.Router();
var schedule = require('node-schedule');
var connection = require('../database/dbsource.js');


/* GET home page. */
router.get('/', function(req, res, next) {

  connection.query('select * from taskapiinfo', function(err, rows, fields) {
    if (err) throw err;
    var success = '任务列表';
    res.render('index', { title: success, schedule: schedule, rows: rows });
  });

});

module.exports = router;
