var express = require('express');
var request = require('request');
var config = require('../config/config.js');
var fs = require('fs');
var router = express.Router();


/* GET resources listing. */
router.get('/', function(req, res) {

  var url = 'https://docs.google.com/spreadsheets/d/' + config.api.resources.id + '/pub';

  var params = {
    'gid':config.api.resources.gid,
    'single':true,
    'output':'tsv'
  };

  request(
    { url: url, qs: params},
    function (error, response, body) {
    if (!error && response.statusCode == 200) {

      fs.writeFile(config.api.projects.path + 'resources.tsv', body, function(err) {
          if(err) {
              return res.send({status:'error', message:err});
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
