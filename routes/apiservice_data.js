var express = require('express');
var router = express.Router();
var schedule = require('node-schedule');
var connection = require('../database/dbsource.js');
var searchData = require('../service/searchData');
var callSoapApi = require('../taskschedule/callSoapApi');
var log4js = require('../applog').logger;

router.get('/open/task/:id', function (req, res, next) {
    searchData.searchMonitorRawData(req, res, 'API', 'JSON');

});

router.get('/open/alltask', function (req, res, next) {
    searchData.searchMonitorRawData(req, res, 'API', 'JSON');

});

router.get('/open/alltaskbyapp', function (req, res, next) {
    if (typeof req.query.app_id === 'undefined')
    {
        res.json('请输入业务系统编号！');
    }

    searchData.searchMonitorRawData(req, res, 'API', 'JSON', req.query.app_id);

});


router.get('/open/taskhour/:id', function (req, res, next) {

    searchData.searchMonitorData(req, res, 'hour');

});


router.get('/open/taskday/:id', function (req, res, next) {

    searchData.searchMonitorData(req, res, 'day');

});

module.exports = router;
