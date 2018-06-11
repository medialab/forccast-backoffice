var express = require('express');
var request = require('request');
var config = require('../config/config.js');
var fs = require('fs');
var async = require('async');
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

      var json = JSON.parse(body);

      json = json.items;

      var json_fr = [],
          json_en = [];

      json.forEach(function(e){

        var hasDateTime = e.start.dateTime !== undefined ? true : false;

        console.log(e.start, e.start.dateTime && new Date(e.start.dateTime));
        var elm_fr = {
          htmlLink: e.htmlLink,
          location: e.location,
          start: hasDateTime ? e.start.dateTime : e.start.date,
          end: hasDateTime ? e.end.dateTime : e.end.date,
          hasDateTime: hasDateTime,
          hangoutLink: e.hangoutLink,
          summary: e.summary && e.summary.length ? e.summary.split('|')[0] : e.summary,
          description: e.description && e.description.length ? e.description.split('|')[0] : e.description
        }

        json_fr.push(elm_fr);

        var summary_en = e.summary && e.summary.length ? e.summary.split('|').length>1?e.summary.split('|')[1]:e.summary.split('|')[0] : e.summary;
        var description_en = e.description && e.description.length ?  e.description.split('|').length>1?e.description.split('|')[1]:e.description.split('|')[0] : e.description;

        var elm_en = {
          htmlLink: e.htmlLink,
          location: e.location,
          start: hasDateTime ? e.start.dateTime : e.start.date,
          end: hasDateTime ? e.end.dateTime : e.end.date,
          hasDateTime: hasDateTime,
          hangoutLink: e.hangoutLink,
          summary: summary_en,
          description: description_en
        }

        json_en.push(elm_en);

      })

      var files = [
        {lang:'fr', content: json_fr},
        {lang:'en', content: json_en}
      ]

      async.each(files, function (file, callback) {

          fs.writeFile(config.api.calendar.path + 'calendar_' + file.lang +'.json', JSON.stringify(file.content, null, 4), function (err) {
              if(err){
                callback(err);
              }else{
                callback();
              }
          });

      }, function (err) {

          if (err) {
              res.send({status:'error', message:err});
          }
          else {
              res.send({status:'ok', message:'The files were saved!'})
          }
      });

    }else{
      var msg = {status:'error', message: error?error:body}
      res.send(msg)
    }
  })

});

module.exports = router;
