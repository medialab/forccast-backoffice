var express = require('express');
var request = require('request');
var config = require('../config/config.js');
var fs = require('fs');
var cheerio = require('cheerio');
var async = require('async');
var router = express.Router();


/* GET texts listing. */
router.get('/', function(req, res) {

  var urls = []
  var output = {};

  for(var key in config.api.images.url) {
    var value = config.api.images.url[key];
    urls.push(value)
  }

  async.eachSeries(urls, function (url, callback) {

      var getPageCollback = function(msg){
        if(msg.status == 'error'){
          callback(msg);
        }else {
          if(msg.continue){
            getPage(url,msg.continue, getPageCollback )
          }else{
            callback();
          }
        }
      }

      getPage(url,1,getPageCollback)

  }, function (err) {

      if (err) {
          res.send({status:'error', message:err});
      }
      else {
          fs.writeFile(config.api.images.path + 'images.json', JSON.stringify(output), function(err){
            if(err){
              res.send({status:'error', message:err})
            }else {
              res.send({status:'ok', message:'The images were saved!'})
            }
          })

      }
  });


  function getPage(url, pageNumber, callback){
    var headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0'
    };

    request(
      { url: url+pageNumber, headers: headers},
      function (error, response, body) {
      if (!error && response.statusCode == 200) {

        var $ = cheerio.load(body);
        $('.post').each(function(){
          var id = $(this).attr('id');
          var img = $(this).find('img').attr('src')
          output[id] = img?img:'';
        })

        //featured posts
        $('.slides li').not('.clone').each(function(){
          var id = $(this).find('article').attr('id');
          var img = $(this).find('.post-thumbnail').find('img').attr('src');
          output[id] = img?img:'';
        })


        callback({status:'ok', continue: pageNumber+1})

      }else if (!error && response.statusCode == 404) {

        callback({status:'ok'})

      }else{
        var msg = {status:'error', message: error?error:body}
        callback(msg)
      }
    })

  }

});

module.exports = router;
