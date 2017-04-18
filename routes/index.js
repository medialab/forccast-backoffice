var express = require('express');
var config = require('../config/config.js');
var d3 = require('d3-collection');
var router = express.Router();

/* GET home page. */

var apiValues = d3.values(config.api);
var dataApis = apiValues.filter(function(d){return d.type == 'data'}).map(function(d){return d.name})
var deployApis = apiValues.filter(function(d){return d.type == 'deploy'}).map(function(d){return d.name})
var imagesApis = apiValues.filter(function(d){return d.type == 'images'}).map(function(d){return d.name})

router.get('/', function(req, res) {
  res.render('index',
    { title: 'Forccast back office',
      dataApis: dataApis,
      deployApis: deployApis,
      imagesApis: imagesApis,
      preview: config.urls.preview,
      production: config.urls.production
    }
  );
});

module.exports = router;
