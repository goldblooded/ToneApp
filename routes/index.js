let express = require('express');
let router = express.Router();

let watson = require('watson-developer-cloud');
let OAuth2 = require('OAuth').OAuth2;
let https = require('https');
let keys = require('./keys');

const WATSON_TONE_API_URL = "https://gateway.watsonplatform.net/tone-analyzer/api";
const TWITTER_API_URL = "https://api.twitter.com/";
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Tone Genious' });
});

router.get('/search', function(req, res, next) {
  let hashtag = req.query.hashtag;

  let tone_analyzer = watson.tone_analyzer({
    url: WATSON_TONE_API_URL,
    username: keys.WATSON_UNAME,
    password: keys.WATSON_PSWD,
    version: 'v3',
    version_date: '2016-05-19'
  });

  let oauth2 = new OAuth2(keys.TWITTER_KEY, keys.TWITTER_SECRET, TWITTER_API_URL, null, 'oauth2/token', null);
  oauth2.getOAuthAccessToken(
    '', 
    {'grant_type': 'client_credentials'}, 
    function(e, access_token) {
      let options = {
        hostname: 'api.twitter.com',
        path: '/1.1/search/tweets.json?q='+hashtag,
        headers: {
          Authorization: 'Bearer ' + access_token
        }
      };

      https.get(options, function(result) {
        let buffer = '';
        result.setEncoding('utf8');
        result.on('data', function(data) {
          buffer += data;
        });
        result.on('end', function() {
        let tweets = JSON.parse(buffer);
        let tweetTexts = [];
        for (let i = 0; i < tweets.statuses.length; i++) {
          let text = tweets.statuses[i].text;
          //  tweetTexts.push(text);
          tone_analyzer.tone({ text: text }, function(err, tone) {
            if (err)
              console.log(err);
            else
              console.log(JSON.stringify(tone, null, 2));
          });
        }
      });
    });
  });
});


module.exports = router;

