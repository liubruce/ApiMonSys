/**
 * Created by bruceliu on 16/7/22.
 */

function formatNow(currentdate){
    //var currentdate =  new Date();
    var datestr = currentdate.getFullYear().toString();
    var monthstr = (currentdate.getMonth() < 10 ? '0' + (currentdate.getMonth()+1) : (currentdate.getMonth()+1));//currentdate.getMonth() + 1;
    //if (monthstr < 10) monthstr = '0' + monthstr;
    var daystr = (currentdate.getDate() < 10 ? '0' + currentdate.getDate() : currentdate.getDate()); //currentdate.getDate();
    //if (daystr < 10) daystr = '0' + daystr;
    datestr = datestr + monthstr + daystr;
    return datestr;
}

function getDatewithoutHMS(currentdate){
    //var currentdate =  new Date();
    var datestr = currentdate.getFullYear().toString();
    var monthstr = (currentdate.getMonth() < 10 ? '0' + (currentdate.getMonth()+1) : (currentdate.getMonth()+1));//currentdate.getMonth() + 1;
    //if (monthstr < 10) monthstr = '0' + monthstr;
    var daystr = (currentdate.getDate() < 10 ? '0' + currentdate.getDate() : currentdate.getDate()); //currentdate.getDate();
    //if (daystr < 10) daystr = '0' + daystr;
    datestr = datestr + '-' + monthstr + '-' + daystr + ' ' + currentdate.getHours() + ' :0:0' ;
    return datestr;
}

module.exports.formatNow = formatNow;
module.exports.getDatewithoutHMS = getDatewithoutHMS;