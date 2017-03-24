var express = require('express');
var request = require('request');
var config = require('../config/config.js');
var fs = require('fs');
var d3 = require('d3-dsv');
var async = require('async');
var router = express.Router();


/* GET texts listing. */
router.get('/', function(req, res) {

  var baseUrl = 'https://api.github.com'
  var params = '/repos/' + config.api.texts.owner + '/' + config.api.texts.repo + '/contents/' + config.api.texts.folder;
  var headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0'
  };
  var url = baseUrl + params;

  request(
    { url: url, headers: headers},
    function (error, response, body) {
    if (!error && response.statusCode == 200) {

      var json = JSON.parse(body)
      async.eachSeries(json, function (file, callback) {

        request(
          { url: file.download_url, headers: headers},
          function (error, response, body) {
            if (!error && response.statusCode == 200) {
              fs.writeFile(config.api.texts.path + file.name, body, function (err) {
                if(err){
                  callback(err)
                }else{
                  callback();
                }

              });
            }else {
                var message = error?error:JSON.parse(body);
                callback(message)
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
