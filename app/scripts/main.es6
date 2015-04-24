/* jshint devel:true */
/* global moment, countdown, textFit, TweenMax */
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

class Time {
  constructor() {
    let time = this.getTime();
    let $element = $('[data-time]');
    $element.html(time.format('h:mm:ss a'));
    // Return the timer interval so we can manipulate it from other classes
    return setInterval(() => {
      time = this.getTime();
      $element.html(time.format('h:mm:ss a'));
    }, 1000);
  }

  getTime() {
    return moment().tz("Australia/Sydney");
  }
}

class Presentation {
  dataLoaded(result) {
    if (result === 'success') {
      $('body').addClass('loaded');
    }
    else {
      $('body').addClass('load-fail');
    }
  }
}

class Gallery extends Presentation {
  constructor() {
    super();

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
    this.loadData((result) => {
      this.dataLoaded(result);
    });


    this.el = {
      'root': $('#gallery'),
      'image': $('#galleryImage'),
      'background': $('#galleryBackground'),
      'captionBackground': $('#galleryCaptionBackground'),
      'caption': $('#galleryCaption'),
      'miniInfo': $('#galleryMiniInfo')
    };
  }

  dataLoaded(result) {
    // If data fetch was successful
    if (result === 'success') {
      // Preload images
      this.preloadImages();

      // Set the animation length to be the same as the slide duration
      this.el.background.css('animation-duration', (this.slideDuration * 4/3) + 'ms');
      this.el.captionBackground.css('animation-duration', (this.slideDuration * 4/3) + 'ms');

      this.imageIterator = Math.floor(Math.random() * (this.images.length - 1));
      this.setSlideView(this.images[this.imageIterator]);
      this.cycleImages();
    }
    else {
      // If not it's an error, throw an error to the display
      // TODO: Error display
    }

    super.dataLoaded(result);
  }

  /**
   * Load data images from the predefined Google Spreadsheets set on top
   */
  loadData(after) {
    let jsonURL = G_Sheet.assembleJSONUrl('GALLERY');
    // Fetch the JSON from the URL given from the setting
    $.getJSON(jsonURL)
      .done((data) => {
        // Push the fetched data to self.images
        for (var i = 0; i < data.feed.entry.length; i++) {
          let row = data.feed.entry[i];
          // Convert the text details content so it's paragraphed
          let content = row.gsx$content.$t;
          content = content.replace(/\n{2}/g, '</p><p>');
          content = content.replace(/\n/g, '<br />');
          content = '<p>'+content+'</p>';
          // Now push it on the data containing array
          this.images.push({
            'image': row.gsx$image.$t,
            'name': row.gsx$title.$t,
            'author': row.gsx$author.$t,
            'text': content
          });
        }
        // Run the function passed in
        return after('success');
      })
      .fail(function(jqxhr, textStatus, error) {
        return after(error);
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
    this.loadImage(image);

    // Set a timer to show the caption
    setTimeout(() => {
      this.el.root.addClass('caption');
      // TweenMax.to(this.el.caption, 1, {x: 0});

      // this.el.caption.addClass('display');
      // this.el.captionBackground.addClass('display');
      // this.el.miniInfo.addClass('no-display');
    }, this.slideDuration / 3);

    // Another one to hide them at the last 4 seconds
    setTimeout(() => {
      this.el.root.removeClass('caption');
      // TweenMax.to(this.el.caption, 1, {x: this.el.caption.outerWidth()});

      // this.el.caption.removeClass('display');
      // this.el.captionBackground.removeClass('display');
      // this.el.miniInfo.removeClass('no-display');
    }, this.slideDuration - 5000);

    // Toggle the loading screen on the last two seconds
    setTimeout(() => {
      this.el.root.addClass('loading');
    }, this.slideDuration - 2000);
  }

  cycleImages() {
    setInterval(() => {
      if (++this.imageIterator > this.images.length - 1) {
        // Reset back to the first array if cycled past the last one
        this.imageIterator = 0;
      }
      this.setSlideView(this.images[this.imageIterator]);
    }, this.slideDuration);
  }

  formatCaption(image) {
    return '<h1>'+ image.name +'</h1><p>By '+ image.author +'</p>' + image.text;
  }

  formatMiniInfo(image) {
    return '<strong>'+ image.name +'</strong> by <em>'+ image.author +'</em>';
  }

  loadImage(image) {
    // TODO: Optimize this so browser reflow is down to a minimum
    // Maybe do everything in a non-displayed DOM or a hidden element before
    // committing the changes to be displayed
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
    setTimeout(() => {
      this.el.background.addClass('animate');
      this.el.captionBackground.addClass('animate');
      this.el.root.removeClass('loading').addClass('loaded');
    }, 500);

    // Last animations for loading screen
    setTimeout(() => {
      this.el.root.removeClass('loaded');
    }, this.slideDuration / 2);
  }

}

class TimeAlert extends Presentation {
  constructor() {
    super();
    this.el = {
      'countdown': $('#timeAlertCountdown'),
      'svg': $('#timeAlertSvg'),
      'title': $('#timeAlertTitle'),
    };

    this.times = [];

    this.loadData((result) => {
      this.dataLoaded(result);
    });

    // var self = this;
    // this.endTime = new Date();
    // this.endTime.setMinutes(this.endTime.getMinutes() + 1);
    // this.countdown = countdown(function(ts) {
    //   self.update(ts);
    // }, this.endTime);
  }

  loadData(after) {
    let jsonURL = G_Sheet.assembleJSONUrl('TIME');
    let today = new Date();
    $.getJSON(jsonURL)
      .done((data) => {
        for (var i = 0; i < data.feed.entry.length; i++) {
          let row = data.feed.entry[i];
          let startTime = (row.gsx$classtimes.$t).split(':', 2);
          // Set a date with today but with a different time
          startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), startTime[0], startTime[1], 0);
          let endTime = (row.gsx$endtimes.$t).split(':', 2);
          endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), endTime[0], endTime[1], 0);

          this.times.push({
            'start': startTime,
            'end': endTime
          });
        }
        // After fetching is finished let's run the post-load function
        after('success');
      })
      .fail(function(jqxhr, textStatus, error) {
        return after(error);
      });
  }

  dataLoaded(result) {
    if (result === 'success') {
      let nextClass = this.calculateNearestClass(new Date());
      this.countdown = countdown((ts) => {
        this.update(ts);
      }, nextClass.start);
      // Add .loaded to preloader to start opacity 1 to 0 on a white bg
    }
    else {
      // Display error in fetching data on display
      // TODO: Make this
    }

    super.dataLoaded(result);
  }

  calculateNearestClass(today) {
    let nextClass = false;
    for (let i = 0; i < this.times.length; i++) {
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

class Announcement extends Presentation {
  constructor() {
    super();
    this.el = {
      'root': $('#announcement'),
      'title': $('#announcementTitle'),
      'content': $('#announcementContent')
    };

    this.title = '';
    this.content = '';
    this.image = '';
    let self = this;

    // Lexical this! ES6 FTW
    this.loadData((result) => {
      this.dataLoaded(result);
    });
  }

  loadData(after) {

    let jsonURL = G_Sheet.assembleJSONUrl('ANNOUNCEMENT');
    $.getJSON(jsonURL)
      .done((data) => {
        let row = data.feed.entry[0];
        // Convert the text details content so it's paragraphed
        let content = row.gsx$content.$t;
        content = content.replace(/\n{2}/g, '</p><p>');
        content = content.replace(/\n/g, '<br />');
        content = '<p>'+content+'</p>';

        this.title = row.gsx$title.$t;
        this.content = content;
        this.image = row.gsx$picture.$t;
        return after('success');
      })
      .fail(function(jqxhr, textStatus, error) {
        return after(error);
      });
  }

  loadToView() {
    this.el.title.html(this.title);
    this.el.content.html(this.content);
  }

  fitContent() {
    this.el.root.css({
      'width': $('#announcement').css('width'),
      'height': $('#announcement').css('height')
    });
    textFit(this.el.root[0], {
      alignHoriz: true,
      alignVert: true,
      minFontSize: 14,
      maxFontSize: 36
    });
  }

  dataLoaded(result) {
    if (result === 'success') {
      this.loadToView();
      this.fitContent();
    }
    else {
      // TODO: Implement an error display
    }
    super.dataLoaded(result);
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

  if ($('[data-announcement]').length === 1) {
    new Announcement();
  }
});
