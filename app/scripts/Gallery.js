import Presentation from './Presentation';
import G_Sheet from './G_Sheet';

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

    this.imageCycler = null;
    this.slideViewTimeouts = [];
  }

  resetContent() {
    // Remove all images from data
    this.images = [];
    // Stop the image cycler and the timeouts for the animations
    clearInterval(this.imageCycler);
    for (var i = 0; i < this.slideViewTimeouts.length; i++) {
      clearTimeout(this.slideViewTimeouts[i]);
    }
    // Reset gallery state to the initial
    this.el.root.removeClass('caption loading');
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
      this.imageCycler = this.cycleImages();
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
    // Reset the timeout arrays
    this.slideViewTimeouts = [];

    // Load the image
    this.loadImage(image);

    // Set a timer to show the caption
    this.slideViewTimeouts.push(setTimeout(() => {
      this.el.root.addClass('caption');

      // this.el.caption.addClass('display');
      // this.el.captionBackground.addClass('display');
      // this.el.miniInfo.addClass('no-display');
    }, this.slideDuration / 3));

    // Another one to hide them at the last 4 seconds
    this.slideViewTimeouts.push(setTimeout(() => {
      this.el.root.removeClass('caption');

      // this.el.caption.removeClass('display');
      // this.el.captionBackground.removeClass('display');
      // this.el.miniInfo.removeClass('no-display');
    }, this.slideDuration - 5000));

    // Toggle the loading screen on the last two seconds
    this.slideViewTimeouts.push(setTimeout(() => {
      this.el.root.addClass('loading');
    }, this.slideDuration - 2000));
  }

  cycleImages() {
    return setInterval(() => {
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

export default Gallery;
