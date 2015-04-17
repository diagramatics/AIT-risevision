/* jshint devel:true */
/* global moment */
/* global countdown */
'use strict';



// Google API test code

var CLIENT_ID = '404474158533-ismn9i3l92mjuhnt6ccl8jneggd1n9ru.apps.googleusercontent.com';
var SCOPES = 'https://www.googleapis.com/auth/drive';
var googleAPI;

/**
 * Called when the client library is loaded to start the auth flow.
 */
function handleClientLoad() {
  googleAPI = new GoogleAPI();
}

class GoogleAPI {
  constructor() {
    gapi.client.setApiKey('AIzaSyBRFaPWEEcN7H9EyTqMZqDyJuz43ENHQ8g');
    window.setTimeout(this.checkAuth, 1);
  }

  checkAuth() {
      gapi.auth.authorize({
        'client_id': CLIENT_ID,
        'scope': SCOPES,
        'immediate': true
      }, this.handleAuthResult);
  }

  handleAuthResult(authResult) {
    if (authResult && !authResult.error) {
      console.log('yay');
    }
    else {
      console.log('nay');
    }
  }
}

// ---------

class Gallery {
  constructor() {
    this.slideDuration = 10000;
    this.images = [
      {
        'image': 'http://www.googledrive.com/host/0ByZQ9gv3kichN3FTZWdJLUdmVzA',
        'name': 'Lorem Graphics',
        'author': 'Ipsum',
        'text': '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Deleniti quo beatae non voluptate, modi facere culpa exercitationem? Cum, laborum, deleniti. Quae sapiente omnis, repellendus.</p><p>Nesciunt molestiae possimus ea quidem! Cumque delectus provident, itaque at exercitationem quis tenetur iusto minima est atque! Magnam suscipit perspiciatis laboriosam, molestiae sapiente consequuntur!</p><p>Placeat quae doloribus neque cupiditate consequatur reiciendis voluptates deleniti esse, ipsam maiores provident aspernatur blanditiis, culpa quas! Tenetur, recusandae pariatur temporibus minus cupiditate, optio.</p>'
      },
      {
        'image': 'http://www.googledrive.com/host/0ByZQ9gv3kichSGxfRkhHbGk5Y1E',
        'name': 'Lorem Art',
        'author': 'Lorema',
        'text': '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Deleniti quo beatae non voluptate, modi facere culpa exercitationem? Cum, laborum, deleniti. Quae sapiente omnis, repellendus.</p><p>Placeat quae doloribus neque cupiditate consequatur reiciendis voluptates deleniti esse, ipsam maiores provident aspernatur blanditiis, culpa quas! Tenetur, recusandae pariatur temporibus minus cupiditate, optio.</p><p>Nesciunt molestiae possimus ea quidem! Cumque delectus provident, itaque at exercitationem quis tenetur iusto minima est atque! Magnam suscipit perspiciatis laboriosam, molestiae sapiente consequuntur!</p>'
      }
    ];

    this.preloadImages();

    this.el = {
      'root': $('#gallery'),
      'image': $('#galleryImage'),
      'background': $('#galleryBackground'),
      'captionBackground': $('#galleryCaptionBackground'),
      'caption': $('#galleryCaption'),
      'miniInfo': $('#galleryMiniInfo')
    };

    // Set the animation length to be the same as the slide duration
    this.el.background.css('animation-duration', (this.slideDuration * 4/3) + 'ms');
    this.el.captionBackground.css('animation-duration', (this.slideDuration * 4/3) + 'ms');

    this.imageIterator = Math.floor(Math.random() * (this.images.length - 1));
    this.setSlideView(this.images[this.imageIterator]);
    this.cycleImages();
  }

  preloadImages() {
    for (var i = 0; i < this.images; i++) {
      let image = new Image();
      image.src(this.images[i]);
    }
  }

  setSlideView(image) {
    let self = this;
    this.loadImage(image);

    // Set a timer to show the caption
    setTimeout(function() {
      self.el.caption.addClass('display');
      self.el.captionBackground.addClass('display');
      self.el.miniInfo.addClass('no-display');
    }, self.slideDuration / 3);

    // Another one to hide them at the last 4 seconds
    setTimeout(function() {
      self.el.caption.removeClass('display');
      self.el.captionBackground.removeClass('display');
      self.el.miniInfo.removeClass('no-display');
    }, self.slideDuration - 5000);

    // Toggle the loading screen on the last two seconds
    setTimeout(function() {
      self.el.root.addClass('loading');
    }, self.slideDuration - 2000);
  }

  cycleImages() {
    let self = this;
    setInterval(function() {
      if (++self.imageIterator > self.images.length - 1) {
        // Reset back to the first array if cycled past the last one
        self.imageIterator = 0;
      }
      self.setSlideView(self.images[self.imageIterator]);
    }, this.slideDuration);
  }

  formatCaption(image) {
    return '<h1>'+ image.name +'</h1><p>By '+ image.author +'</p>' + image.text;
  }

  formatMiniInfo(image) {
    return '<strong>'+ image.name +'</strong> by <em>'+ image.author +'</em>';
  }

  loadImage(image) {
    let self = this;
    let imageFormatted = 'url('+ image.image +')';
    // Disable animation and enable loading screen
    this.el.background.removeClass('animate');
    this.el.captionBackground.removeClass('animate');


    this.el.image.attr('src', image.image);
    this.el.background.css('background-image', imageFormatted);
    this.el.captionBackground.css('background-image', imageFormatted);
    this.el.caption.html(this.formatCaption(image));
    this.el.miniInfo.html(this.formatMiniInfo(image));

    // Remove loading screen and enable animation again
    setTimeout(function() {
      self.el.background.addClass('animate');
      self.el.captionBackground.addClass('animate');
      self.el.root.removeClass('loading').addClass('loaded');
    }, 500);

    // Last animations for loading screen
    setTimeout(function() {
      self.el.root.removeClass('loaded');
    }, this.slideDuration / 2);
  }

}

class Time {
  constructor() {
    setInterval(function() {
      let time = moment();
      $('[data-time]').html(time.format('h:mm:ss a'));
    }, 1000);
  }
}

class TimeAlert {
  constructor() {
    this.el = {
      'time': $('#timeAlertTime'),
      'countdown': $('#timeAlertCountdown'),
      'svg': $('#timeAlertSvg'),
      'title': $('#timeAlertTitle')
    };

    var self = this;

    this.endTime = new Date();
    this.endTime.setMinutes(this.endTime.getMinutes() + 1);
    this.countdown = countdown(function(ts) {
      self.update(ts);
    }, this.endTime);
  }

  update(ts) {
    if (ts.value < 0) {
      this.el.title.html('You\'re late!');

      if (ts.minutes >= 15) {
        this.clearCountdown();
      }
    }
    let time = moment();
    this.el.countdown.html(ts.minutes + ':' + ('0' + ts.seconds).slice(-2));
    this.el.time.html(time.format('h:mm:ss a'));
  }

  clearCountdown() {
    window.clearInterval(this.countdown);
  }
}

$(function() {
  // Check if there's a gallery and there's exactly only one on the DOM
  if ($('[data-gallery]').length === 1) {
    // Initialize the gallery
    new Gallery();
  }

  if ($('[data-timealert]').length === 1) {
    new TimeAlert();
  }

  if ($('[data-time]').length === 1) {
    new Time();
  }
});
