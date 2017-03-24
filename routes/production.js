var express = require('express');
var request = require('request');
var config = require('../config/config.js');
var fs = require('fs');
var d3 = require('d3-dsv');
var async = require('async');
var router = express.Router();
var exec = require('child_process').exec;


/* GET texts listing. */
router.get('/', function(req, res) {

  var path = config.api.production.path;
  var file = config.api.production.file;
  var command = 'cd ' + path +' && node ' + file;

  execute(command, function(data){
    res.send(data)
  })


  function execute(command, callback){
      exec(command, function(error, stdout, stderr){
        var msg;
        if(error){
          msg = {status:'error', message: error}
          callback(msg);
        }else if(stderr){
          msg = {status:'error', message: stderr}
          callback(msg);
        }else{
          var s = stdout.replace('\n','')
          if(s === 'ok'){
            msg = {status:'ok', message: 'forccast built'}
            callback(msg);
          }else{
            msg = {status:'error', message: stdout}
            callback(msg);
          }
        }

      });
  };

});

module.exports = router;
