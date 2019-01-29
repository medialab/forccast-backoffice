var express = require('express');
var request = require('request');
var d3 = require('d3-collection');
var FeedParser = require('feedparser');
var sanitizeHtml = require('sanitize-html');
var cheerio = require('cheerio');
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
  var images = [];

  if (fs.existsSync('./data/images.json')) {
    try {
      images = JSON.parse(fs.readFileSync('./data/images.json', 'utf-8'))
    }
    catch(error) {
      console.log(error);
    }
  }

  var url = config.api.news.url[lang];

  var filePath = config.api.news.path + 'news_' + lang +'.json';
  var results = d3.map();
  if (fs.existsSync(filePath)) {
    try{
      var prevResults = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      results = d3.map(prevResults, function(d) { return d.guid; });
    } catch(error) {
      console.log('error with news json', error);
    }
  }

  var feedparser = new FeedParser({addmeta:false});

  var clientReq = request(url);

  clientReq.on('error', function (error) {
    var msg = {status:'error', message: error}
    res.send(msg)
  });

  clientReq.on('response', function (clientResponse) {
    var stream = this; // `this` is `req`, which is a stream

    if (clientResponse.statusCode !== 200) {
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
        allowedTags: [ 'p', 'b', 'i', 'em', 'strong', 'a', 'li', 'ul', 'ol','img', 'iframe','div', 'figcaption'],
        allowedAttributes: {
          'a': [ 'href' ],
          'img': [ 'src', 'class', 'alt' ],
          'iframe': ['*'],
          'div':['class'],
          'p': ['class']
        },
        transformTags: {
          'iframe': sanitizeHtml.simpleTransform('iframe', {frameborder: '0', class:'news-mobile embed-responsive-item'}),
          'img': sanitizeHtml.simpleTransform('img', {class:'news-media'}),
          'div': sanitizeHtml.simpleTransform('div', {class:'news-media-container'})
        },
        textFilter: function(text) {
          return text.replace(/\n/g, '');
        }
      });

      // parsing medias for the right column
      var $ = cheerio.load(elm.description)
      elm.media = '';
      // .wp-block-image is the new <figure> wrapper for wordpress (since October 2018)
      // .wp-caption is for old articles
      // iframe catches all iframes
      $('.wp-block-image,.wp-caption,iframe').each(function(i, e) {
        var fake = $('<div class="fake"></div>')
        $(this).wrap(fake);

        var img = sanitizeHtml(fake.html(), {
          allowedTags: ['img','figcaption', 'p', 'iframe'],
          allowedAttributes: {
            'img': [ 'src' ],
            'iframe': ['*']
          }
        });
        if(img){
          elm.media = elm.media + img;
        }

        if ($(this).prop('tagName').toLowerCase() === 'iframe') {
          var next = $(this).parent().next();
          if (next && next.hasClass('legend')) {
            elm.media = elm.media + '<figcaption>' + next.html() + '</figcaption>';
          }
        }
      })
      // removing to avoid double-selecting images
      $('.wp-block-image,.wp-caption,iframe').remove();
      // get single images
      // @todo the following is a dirty fix
      // that will create a problem if a news
      // mixes plain images and legended images (plain images)
      // will always end up in the end of right column.
      // It would require more investigation to be fixed
      $('img').each(function(i, e) {
        var fake = $('<div class="fake"></div>')
        $(this).wrap(fake)

        var img = sanitizeHtml(fake.html(), {
          allowedTags: ['img','figcaption', 'p', 'iframe'],
          allowedAttributes: {
            'img': [ 'src' ],
            'iframe': ['*']
          }
        });
        if(img){
          elm.media = elm.media + img;
        }
      });

      elm.description = clean;
      elm.media = elm.media.replace(/(<.*?)(-[0-9]+x[0-9]+\.)(png|jpg|jpeg|gif|bmp)(.*?\/>)/ig, replacer);

      function replacer(match, p1, p2,p3,p4, offset, string) {
          return p1 + '.' + p3 + p4
        }

      var id = elm.guid.split('?p=')[1];
      elm.cover = images['post-' + id];

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
