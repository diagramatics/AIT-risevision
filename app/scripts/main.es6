/* jshint devel:true */
/* global moment, countdown */
'use strict';



// Google API test code

// var CLIENT_ID = '404474158533-ismn9i3l92mjuhnt6ccl8jneggd1n9ru.apps.googleusercontent.com';
// var SCOPES = 'https://www.googleapis.com/auth/drive';
// var googleAPI;
//
// /**
//  * Called when the client library is loaded to start the auth flow.
//  */
// function handleClientLoad() {
//   googleAPI = new GoogleAPI();
// }
//
// class GoogleAPI {
//   constructor() {
//     gapi.client.setApiKey('AIzaSyBRFaPWEEcN7H9EyTqMZqDyJuz43ENHQ8g');
//     window.setTimeout(this.checkAuth, 1);
//   }
//
//   checkAuth() {
//       gapi.auth.authorize({
//         'client_id': CLIENT_ID,
//         'scope': SCOPES,
//         'immediate': true
//       }, this.handleAuthResult);
//   }
//
//   handleAuthResult(authResult) {
//     if (authResult && !authResult.error) {
//       console.log('yay');
//     }
//     else {
//       console.log('nay');
//     }
//   }
// }

// ---------
class G_Sheet {
  constructor() {
  }

  static assembleJSONUrl(enumName) {
    return 'https://cors-io.herokuapp.com/spreadsheets.google.com/feeds/list/'+ this.sheetID +'/'+ this.sheetEnum[enumName] +'/public/values?alt=json';
  }
}
// ID is the ID from the URL of Google Sheet
// The URL to open the Sheet is https://docs.google.com/a/ait.nsw.edu.au/spreadsheets/d/1OmNdBJjC71iyXzih4YTBdlxzDwCEjBkac8oW6kJBYIw/
// Last part of the URL is the ID
G_Sheet.sheetID = '1OmNdBJjC71iyXzih4YTBdlxzDwCEjBkac8oW6kJBYIw';
// This enum is used for the positional ID of the spreadsheet
G_Sheet.sheetEnum = {
  "GALLERY": 1,
  "TIME": 2,
  "ANNOUNCEMENT": 3
};

class Gallery {
  constructor() {
    this.slideDuration = 10000;
    // this.images = [
    //   {
    //     'image': 'http://www.googledrive.com/host/0ByZQ9gv3kichN3FTZWdJLUdmVzA',
    //     'name': 'Lorem Graphics',
    //     'author': 'Ipsum',
    //     'text': '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Deleniti quo beatae non voluptate, modi facere culpa exercitationem? Cum, laborum, deleniti. Quae sapiente omnis, repellendus.</p><p>Nesciunt molestiae possimus ea quidem! Cumque delectus provident, itaque at exercitationem quis tenetur iusto minima est atque! Magnam suscipit perspiciatis laboriosam, molestiae sapiente consequuntur!</p><p>Placeat quae doloribus neque cupiditate consequatur reiciendis voluptates deleniti esse, ipsam maiores provident aspernatur blanditiis, culpa quas! Tenetur, recusandae pariatur temporibus minus cupiditate, optio.</p>'
    //   },
    //   {
    //     'image': 'http://www.googledrive.com/host/0ByZQ9gv3kichSGxfRkhHbGk5Y1E',
    //     'name': 'Lorem Art',
    //     'author': 'Lorema',
    //     'text': '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Deleniti quo beatae non voluptate, modi facere culpa exercitationem? Cum, laborum, deleniti. Quae sapiente omnis, repellendus.</p><p>Placeat quae doloribus neque cupiditate consequatur reiciendis voluptates deleniti esse, ipsam maiores provident aspernatur blanditiis, culpa quas! Tenetur, recusandae pariatur temporibus minus cupiditate, optio.</p><p>Nesciunt molestiae possimus ea quidem! Cumque delectus provident, itaque at exercitationem quis tenetur iusto minima est atque! Magnam suscipit perspiciatis laboriosam, molestiae sapiente consequuntur!</p>'
    //   }
    // ];
    this.images = [];
    this.loadImagesData();


    this.el = {
      'root': $('#gallery'),
      'image': $('#galleryImage'),
      'background': $('#galleryBackground'),
      'captionBackground': $('#galleryCaptionBackground'),
      'caption': $('#galleryCaption'),
      'miniInfo': $('#galleryMiniInfo')
    };
  }

  asyncLoadFinished() {
    // Preload images
    this.preloadImages();

    // Set the animation length to be the same as the slide duration
    this.el.background.css('animation-duration', (this.slideDuration * 4/3) + 'ms');
    this.el.captionBackground.css('animation-duration', (this.slideDuration * 4/3) + 'ms');

    this.imageIterator = Math.floor(Math.random() * (this.images.length - 1));
    this.setSlideView(this.images[this.imageIterator]);
    this.cycleImages();
  }

  loadImagesData() {
    let self = this;
    let jsonURL = G_Sheet.assembleJSONUrl('GALLERY');
    $.getJSON(jsonURL, function(data) {
      for (var i = 0; i < data.feed.entry.length; i++) {
        let row = data.feed.entry[i];
        self.images.push({
          'image': row.gsx$image.$t,
          'name': row.gsx$title.$t,
          'author': row.gsx$author.$t,
          'text': (row.gsx$content.$t).replace(/[\n\r]/g, '<br />')
        });
      }

      self.asyncLoadFinished();
    });
  }

  preloadImages() {
    // TODO: Probably attach a callback so we can fire the gallery when everything gets loaded?
    for (var i = 0; i < this.images.length; i++) {
      // Preload images by making an <img> tag that's not used anywhere
      // That way browser assumes it exists, needs the image and try and load it
      $("<img />").attr("src", this.images[i].image);
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
    let time = moment();
    $('[data-time]').html(time.format('h:mm:ss a'));
    setInterval(function() {
      time = moment();
      $('[data-time]').html(time.format('h:mm:ss a'));
    }, 1000);
  }
}

class TimeAlert {
  constructor() {
    this.el = {
      'countdown': $('#timeAlertCountdown'),
      'svg': $('#timeAlertSvg'),
      'title': $('#timeAlertTitle'),
      'preloader': $('#timealertPreloader')
    };

    this.times = [];
    this.loadData();

    // var self = this;
    // this.endTime = new Date();
    // this.endTime.setMinutes(this.endTime.getMinutes() + 1);
    // this.countdown = countdown(function(ts) {
    //   self.update(ts);
    // }, this.endTime);
  }

  loadData() {
    let self = this;
    let jsonURL = G_Sheet.assembleJSONUrl('TIME');
    let today = new Date();
    $.getJSON(jsonURL, function(data) {
      for (var i = 0; i < data.feed.entry.length; i++) {
        let row = data.feed.entry[i];
        let startTime = (row.gsx$classtimes.$t).split(':', 2);
        // Set a date with today but with a different time
        startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), startTime[0], startTime[1], 0);
        let endTime = (row.gsx$endtimes.$t).split(':', 2);
        endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), endTime[0], endTime[1], 0);

        self.times.push({
          'start': startTime,
          'end': endTime
        });
      }
      // After fetching is finished let's run the post-load function
      self.loadDataFinished();
    });
  }

  loadDataFinished() {
    let self = this;
    let nextClass = this.calculateNearestClass();
    this.countdown = countdown(function(ts) {
      self.update(ts);
    }, nextClass.start);
    // Add .loaded to preloader to start opacity 1 to 0 on a white bg
    this.el.preloader.addClass('loaded');
  }

  calculateNearestClass() {
    let today = new Date();
    let nextClass = false;
    for (var i = 0; i < this.times.length; i++) {
      // If the next schedule hasn't passed the current time yet
      if (today < this.times[i].start) {
        // Break the loop and return that class
        return this.times[i];
      }
    }
    // If after looping we can't find the next class that means the next class is tomorrow morning
    // Return the next class at the first time of the day then by cloning the first array index and editing the start
    let nextDayFirstClass = {
      'start': new Date(new Date(this.times[0].start).setDate(this.times[0].start.getDate() + 1)),
      'end': new Date(this.times[0].end)
    };
    return nextDayFirstClass;
  }

  update(ts) {
    if (ts.value < 0) {
      this.el.title.html('You\'re late!');

      if (ts.minutes >= 15) {
        this.clearCountdown();
      }
    }
    let time = moment();
    let hours = '';
    let minutes = ts.minutes;
    if (ts.hours !== 0) {
      hours = ts.hours + ':';
      // If there's an hour countdown put a leading zero on minute
      minutes = ('0' + ts.minutes).slice(-2);
    }
    this.el.countdown.html(hours + minutes + ':' + ('0' + ts.seconds).slice(-2));
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
