var express = require('express');
var request = require('request');
var config = require('../config/config.js');
var fs = require('fs');
var d3 = require('d3-dsv');
var async = require('async');
var router = express.Router();


/* GET team listing. */
router.get('/', function(req, res) {

  var url = 'https://docs.google.com/spreadsheets/d/' + config.api.team.id + '/pub';

  var params = {
    'gid':config.api.team.gid,
    'single':true,
    'output':'tsv'
  };

  request(
    { url: url, qs: params},
    function (error, response, body) {
    if (!error && response.statusCode == 200) {

      var json = d3.tsvParse(body.replace(/"/g, ""));

      var translatedFields = {
        'en' : [
          'role_en',
          'bio_html_en'
        ],
        'fr': [
          'role_fr',
          'bio_html_fr'
        ]
      }

      var json_fr = json.map(function(d){

        var elm = {};
        for(field in d){
          elm[field] = d[field]
        }

        translatedFields.en.forEach(function(f){
          delete elm[f]
        })

        translatedFields.fr.forEach(function(f){
          elm[f.replace('_fr','')] = elm[f]
          delete elm[f]
        })

        return elm
      })

      var json_en = json.map(function(d){

        var elm = {};
        for(field in d){
          elm[field] = d[field]
        }

        translatedFields.fr.forEach(function(f){
          delete elm[f]
        })

        translatedFields.en.forEach(function(f){
          elm[f.replace('_en','')] = elm[f]
          delete elm[f]
        })

        return elm
      })

      var files = [
        {lang:'fr', content: json_fr},
        {lang:'en', content: json_en}
      ]

      async.each(files, function (file, callback) {

          fs.writeFile(config.api.team.path + 'team_' + file.lang +'.json', JSON.stringify(file.content, null, 4), function (err) {
            if(err){
              callback(err)
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
