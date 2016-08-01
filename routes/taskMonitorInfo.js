/**
 * Created by bruceliu on 16/7/31.
 */

var express = require('express');
var router = express.Router();
var schedule = require('node-schedule');
var connection = require('../database/dbsource.js');

var searchData = require('../service/searchData');

router.get('/taskmonitorinfo/:id', function(req, res, next) {

    searchData.searchMonitorRawData(req, res, 'VIEW', 'taskmonitordata');

});


module.exports = router;

