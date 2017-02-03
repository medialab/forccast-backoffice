var express = require('express');
var request = require('request');
var config = require('../config/config.js');
var fs = require('fs');
var router = express.Router();


/* GET events listing. */
router.get('/', function(req, res) {

  var url = 'https://www.googleapis.com/calendar/v3/calendars/' + config.api.calendar.calendarId + '/events';

  var params = {
    key: config.api.calendar.apiKey,
    timeMin: new Date()
  };

  request(
    { url: url, qs: params},
    function (error, response, body) {
    if (!error && response.statusCode == 200) {

      fs.writeFile(config.api.calendar.path + 'calendar.json', body, function(err) {
          if(err) {
              res.send({status:'error', message:err});
              return;
          }
          res.send({status:'ok', message:'The file was saved!'})
      });

    }else{
      var msg = {status:'error', message: error}
      res.send(msg)
    }
  })

});

module.exports = router;
