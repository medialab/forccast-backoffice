var express = require('express');
var request = require('request');
var d3 = require('d3-collection');
var FeedParser = require('feedparser');
var sanitizeHtml = require('sanitize-html');
var config = require('../config/config.js');
var fs = require('fs');
var router = express.Router();


/* GET news listing. */
router.get('/', function(req, res) {

  var lang = req.query.lang;

  if(!lang){
    var msg = {status:'error', message: "you need to provide 'lang' parameter, option: 'en | fr'"}
    res.send(msg);
    return;
  }else if (lang != 'fr' && lang !='en') {
    var msg = {status:'error', message: "invalid parameter, option: 'en | fr'"}
    res.send(msg);
    return;
  }

  var url = config.api.news.url[lang];

  var filePath = config.api.news.path + 'news_' + lang +'.json';
  var results = d3.map();
  if (fs.existsSync(filePath)) {
    var prevResults = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    results = d3.map(prevResults, function(d) { return d.guid; });
  }

  var feedparser = new FeedParser({addmeta:false});

  var req = request(url);


  req.on('error', function (error) {
    var msg = {status:'error', message: error}
    res.send(msg)
  });

  req.on('response', function (res) {
    var stream = this; // `this` is `req`, which is a stream

    if (res.statusCode !== 200) {
      var msg = {status:'error', message: 'error'}
      res.send(msg)
    }
    else {
      stream.pipe(feedparser);
    }
  });

  feedparser.on('error', function (error) {
    var msg = {status:'error', message: error}
    res.send(msg)
  });

  feedparser.on('readable', function () {
    var stream = this; // `this` is `feedparser`, which is a stream
    var item;

    while (item = stream.read()) {
      var elm = {
        title: item.title,
        description: item.description,
        pubdate: item.pubdate,
        link: item.link,
        guid: item.guid,
        author: item.author,
        categories: item.categories
      }

      var clean = sanitizeHtml(elm.description, {
        allowedTags: [ 'p', 'b', 'i', 'em', 'strong', 'a', 'li', 'ul', 'ol','img', 'iframe'],
        allowedAttributes: {
          'a': [ 'href' ],
          'img': [ 'src', 'class', 'alt' ],
          'iframe': ['*']
        },
        transformTags: {
          'iframe': sanitizeHtml.simpleTransform('iframe', {width: '100%',height: 'auto', frameborder: '0', class:'news-media'}),
          'img': sanitizeHtml.simpleTransform('img', {class:'news-media'})
        },
        textFilter: function(text) {
          return text.replace(/\n/g, '');
        }
      });

      var media = sanitizeHtml(elm.description, {
        allowedTags: ['img', 'iframe'],
        allowedAttributes: {
          'img': [ 'src' ],
          'iframe': ['*']
        },
        transformTags: {
          'iframe': sanitizeHtml.simpleTransform('iframe', {width: '100%',height: 'auto', frameborder: '0'})
        },
        textFilter: function(text) {
          return ''
        }
      });

      elm.description = clean;
      elm.media = media;

      var re = /<img[^>]+src="?([^"\s]+)"?[^>]*\/>/;
      var img = re.exec(media);
      elm.cover = '';
      if(img){
        elm.cover = img[1];
      }

      results.set(elm.guid, elm);
    }
  });

  feedparser.on('end', function(){
    fs.writeFile(filePath, JSON.stringify(results.values()), function(err) {
        if(err) {
            return res.send({status:'error', message:err});
        }
        res.send({status:'ok', message:'The file was saved!'})
    });

  });

});

module.exports = router;
