/**
 * Created by bruceliu on 16/7/18.
 */

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : '127.0.0.1',
    user     : 'root',
    password : 'CAdemo123'
});


module.exports = connection;
/*
connection.connect();


connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
    if (err) throw err;
    console.log('The solution is: ', rows[0].solution);
});

connection.end();

    */