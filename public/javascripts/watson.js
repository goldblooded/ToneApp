$(document).ready(function() {
  init();
});

function init () {
  console.log('init function');
  handleSubmit();
}

function handleSubmit() {
  $('.js-hashtag-input').on('keypress', function(e) {
    if (e.which === 13) {
      var hashtag = '#' + $('.js-hashtag-input').val();
      // make an ajax req to an endpoint
      $.ajax({
        url: '/search', 
        type: 'GET', 
        contentType: 'application/json', 
        data: { hashtag: hashtag },
      }).done(function() {
        console.log('success');
      }).fail(function() {
        console.log('failed');
      });
    }
  });

}

