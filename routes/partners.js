var express = require('express');
var request = require('request');
var config = require('../config/config.js');
var fs = require('fs');
var router = express.Router();


/* GET partners listing. */
router.get('/', function(req, res) {

  var url = 'https://docs.google.com/spreadsheets/d/' + config.api.partners.id + '/pub';

  var params = {
    'gid':config.api.partners.gid,
    'single':true,
    'output':'tsv'
  };

  request(
    { url: url, qs: params},
    function (error, response, body) {
    if (!error && response.statusCode == 200) {

      fs.writeFile(config.api.projects.path + 'partners.tsv', body, function(err) {
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
