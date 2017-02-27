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

router.get('/get_tweets', function(req, res, next) {
  let hashtag = req.query.hashtag;

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
          console.log(tweets);
          let client_response = tweets.statuses.filter(function(tweet) {
            let text = tweet.text;
            //return !text.match(/^RT\w+ .*/);
            return tweet.retweeted === false && !text.match(/^RT\s+.*|.*\s+RT\s+.*/);
          }).map(function(tweet) {
            console.log(tweet);
            return { text: tweet.text, name: tweet.user.name }; 
          });
          res.send(client_response);
        });
      });
    }
  );
});

router.get('/get_tone', function(req, res, next) {
  let tweet = req.query.tweet;

  let tone_analyzer = watson.tone_analyzer({
    url: "https://gateway.watsonplatform.net/tone-analyzer/api",
    username: keys.WATSON_UNAME,
    password: keys.WATSON_PSWD,
    version: 'v3',
    version_date: '2016-05-19'
  }
  );
  tone_analyzer.tone({ text: tweet }, function(err, tone) {
    if (err) { console.log(err); }
    else { res.send(tone); }
  });

});

module.exports = router;

