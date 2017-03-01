$(document).ready(function() {
  init();
});

function init () {
  console.log('init function');
  handleSubmit();
}

function handleSubmit() {
  $('.js-search-input').on('keypress', function(e) {
    if (e.which === 13) {
      var searchKeyword = $('.js-search-input').val();
      // make an ajax req to an endpoint
      $.ajax({
        url: '/get_tweets', 
        type: 'GET', 
        contentType: 'application/json', 
        data: { searchKeyword: searchKeyword },
      }).done(function(data) {
        populateTweetsList(data);
        tweetClickHandler();
      }).fail(function() {
        console.log('failed');
      });
    }
  });
}

function tweetClickHandler() {
  $('.js-tweet').on('click', function() {
    let tweet = $(this).text();
    $(this).css('background-color','lightblue');
    $.ajax({
      url: '/get_tone', 
      type: 'GET', 
      contentType: 'application/json', 
      data: { tweet: tweet },
    }).done(function(data) {
      // console.log('success');
      processDocumentTone(data); 
    }).fail(function() {
      console.log('failed');
    });

  });
}

function populateTweetsList(data) {
  $('.js-tweets-list').children().remove();
  data.forEach(function(elem) {
    let html = '<li class="js-tweet list-group-item">' + elem.text + '</li>';
    $('.js-tweets-list').append(html);
  });
}

function processDocumentTone(data) {
  let toneCategories = data.document_tone.tone_categories;
  let emotionTone, languageTone, socialTone;

  toneCategories.forEach(function(category) {
    if (category.category_id === 'emotion_tone') {
      emotionTone = category;
    }
    else if (category.category_id === 'language_tone') {
      languageTone = category;
    }
    else {
      socialTone = category;
    }
  });
  
  // Convert score to %
  emotionTone.tones.forEach(function(elem) {
    elem.score *= 100;
  });
  languageTone.tones.forEach(function(elem) {
    elem.score *= 100;
  });
  socialTone.tones.forEach(function(elem) {
    elem.score *= 100;
  });

  let eData = getDataForCanvas(emotionTone);
  let lData = getDataForCanvas(languageTone);
  let sData = getDataForCanvas(socialTone);
  
  console.log(eData);

  renderChart(eData, 'emotionChartContainer');
  renderChart(lData, 'languageChartContainer');
  renderChart(sData, 'socialChartContainer');
}


function getDataForCanvas(toneType) {
  let canvasData = {
    theme: "theme2",
    title: { text: toneType.category_name },
    animationEnabled: true,
    data: [
      {
        type: "column",
        dataPoints: [],
      },
    ],
  };

  let tones = toneType.tones;
  tones.forEach(function(tone, index) {
    let idx = 10*index + 10;
    let dataPoints = canvasData.data[0].dataPoints;
    dataPoints.push({ 
      label: tone.tone_name, 
      y: tone.score,
      x: idx,
    });
  });

  return canvasData;
}

function renderChart(toneData, domId) {
  let chart = new CanvasJS.Chart(domId, toneData);
  chart.render();
}

