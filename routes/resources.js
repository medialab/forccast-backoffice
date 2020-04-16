var express = require('express');
var request = require('request');
var config = require('../config/config.js');
var fs = require('fs');
var d3 = require('d3-dsv');
var async = require('async');
var router = express.Router();
var extractCleanFileName = require('../helpers/extractCleanFileName');
var ensureDir = require('../helpers/ensureDir');


/* GET resources listing. */
router.get('/', function(req, res) {

  var url = 'https://docs.google.com/spreadsheets/d/' + config.api.resources.id + '/pub';
  var imagesToFetch = {};

  var params = {
    'gid':config.api.resources.gid,
    'single':true,
    'output':'tsv'
  };

  request(
    { url: url, qs: params},
    function (error, response, body) {
    if (!error && response.statusCode == 200) {

      var json = d3.tsvParse(body);

      var translatedFields = {
        'en' : [
          'name_en',
          'category_en',
          'presentation_en'
        ],
        'fr': [
          'name_fr',
          'category_fr',
          'presentation_fr'
        ]
      }

      var json_fr = json.map(function(d){

        var elm = {};
        for(field in d){
          elm[field.trim()] = d[field]
        }

        translatedFields.en.forEach(function(f){
          delete elm[f]
        })

        translatedFields.fr.forEach(function(f){
          elm[f.replace('_fr','')] = elm[f]
          delete elm[f]
        })

        // re-set image url in the perspective of fetching it
        if (elm.url_thumbnail) {
          var imageFileName = extractCleanFileName(elm.url_thumbnail);
          imagesToFetch[elm.url_thumbnail] = imageFileName;
          elm.url_thumbnail = '/../media/' + imageFileName;
        }

        return elm
      })

      var json_en = json.map(function(d){

        var elm = {};
        for(field in d){
          elm[field.trim()] = d[field]
        }

        translatedFields.fr.forEach(function(f){
          delete elm[f]
        })

        translatedFields.en.forEach(function(f){
          elm[f.replace('_en','')] = elm[f]
          delete elm[f]
        })

        // re-set image url in the perspective of fetching it
        if (elm.url_thumbnail) {
          var imageFileName = extractCleanFileName(elm.url_thumbnail);
          imagesToFetch[elm.url_thumbnail] = imageFileName;
          elm.url_thumbnail = '/../media/' + imageFileName;
        }
        

        return elm
      })

      var files = [
        {lang:'fr', content: json_fr},
        {lang:'en', content: json_en}
      ]

      async.each(files, function (file, callback) {

          fs.writeFile(config.api.resources.path + 'resources_' + file.lang +'.json', JSON.stringify(file.content, null, 4), function (err) {
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
              // ensuring the images folder exists
              ensureDir(config.api.resources.path + 'images/');
              // fetch all images and write them to the images folder
              async.each(Object.keys(imagesToFetch), function(url, callback) {
                var fileName = imagesToFetch[url]
                var output = config.api.projects.path + 'images/' + fileName;
                request({url: encodeURI(url), encoding: 'binary'}, function(error, response, body) {
                  if (error) {
                    // making image retrieval errors non blocking
                    console.error(error)
                    callback()
                  } else {
                    fs.writeFile(output, body, 'binary', function(error) {
                      if (error) {
                        callback(error)
                      } else callback()
                    })
                  }
                })
              }, function(err) {
                if (err) {
                  res.send({status:'error', message:err});
                } else {
                  res.send({status:'ok', message:'The files were saved!'})
                }
              })
          }
      });

    }else{
      var msg = {status:'error', message: error?error:body}
      res.send(msg)
    }
  })

});

module.exports = router;
