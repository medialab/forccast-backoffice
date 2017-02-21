var express = require('express');
var request = require('request');
var config = require('../config/config.js');
var fs = require('fs');
var d3 = require('d3-dsv');
var d3collection = require('d3-collection');
var async = require('async');
var router = express.Router();


/* GET projects listing. */
router.get('/', function(req, res) {

  var url = 'https://docs.google.com/spreadsheets/d/' + config.api.projects.id + '/pub';

  var params = {
    'gid':config.api.projects.gid,
    'single':true,
    'output':'tsv'
  };

  request(
    { url: url, qs: params},
    function (error, response, body) {
    if (!error && response.statusCode == 200) {

      var json = d3.tsvParse(body);

      /* start calculating meta */
      var meta = {
        'typology': d3collection.map(),
        'institutions': d3collection.map(),
        'tags': d3collection.map()
      }

      json.forEach(function(d){
        if(d['typology']){
          meta.typology.set(d['typology'].toLowerCase(), {label:d['typology'], value: d['typology'].toLowerCase()})
        }

        if(d['university_1']){
          meta.institutions.set(d['university_1'].toLowerCase(), {label: d['university_1'], value: d['university_1'].toLowerCase()})
        }

        if(d['university_2']){
          meta.institutions.set(d['university_2'].toLowerCase(), {label: d['university_2'], value: d['university_2'].toLowerCase()})
        }

        if(d['university_3']){
          meta.institutions.set(d['university_3'].toLowerCase(), {label: d['university_3'], value: d['university_3'].toLowerCase()})
        }

        if(d['theme_tags']){

          var tags = d['theme_tags'].split('|');

          tags.forEach(function(tag){
            meta.tags.set(tag.toLowerCase().trim(), {label : tag.trim() , value: tag.toLowerCase().trim()})
          })

        }


      })

      /* end calculating meta */

      var translatedFields = {
        'en' : [
          'project_title_en',
          'project_subtitle_en'
        ],
        'fr': [
          'project_title_fr',
          'project_subtitle_fr'
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

      meta.typology = meta.typology.values();
      meta.institutions = meta.institutions.values();
      meta.tags = meta.tags.values();

      var files = [
        {
          lang:'fr',
          content: {
            meta: meta,
            projects: json_fr
          }
        },
        {
          lang:'en',
          content: {
            meta : meta,
            projects : json_en
          }
        }
      ]

      async.each(files, function (file, callback) {

          fs.writeFile(config.api.projects.path + 'projects_' + file.lang +'.json', JSON.stringify(file.content, null, 4), function (err) {
              callback();
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
      var msg = {status:'error', message: error}
      res.send(msg)
    }
  })

});

module.exports = router;
