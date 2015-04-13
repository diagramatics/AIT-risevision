/* jshint devel:true */
'use strict';

class Gallery {
  constructor() {
    this.slideDuration = 10000;
    this.images = [
      {
        'image': '/images/lorem-image.jpg',
        'name': 'Lorem Graphics',
        'author': 'Ipsum',
        'text': '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Deleniti quo beatae non voluptate, modi facere culpa exercitationem? Cum, laborum, deleniti. Quae sapiente omnis, repellendus.</p><p>Nesciunt molestiae possimus ea quidem! Cumque delectus provident, itaque at exercitationem quis tenetur iusto minima est atque! Magnam suscipit perspiciatis laboriosam, molestiae sapiente consequuntur!</p><p>Placeat quae doloribus neque cupiditate consequatur reiciendis voluptates deleniti esse, ipsam maiores provident aspernatur blanditiis, culpa quas! Tenetur, recusandae pariatur temporibus minus cupiditate, optio.</p>'
      },
      {
        'image': '/images/lorem-image-2.jpg',
        'name': 'Lorem Art',
        'author': 'Lorema',
        'text': '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Deleniti quo beatae non voluptate, modi facere culpa exercitationem? Cum, laborum, deleniti. Quae sapiente omnis, repellendus.</p><p>Placeat quae doloribus neque cupiditate consequatur reiciendis voluptates deleniti esse, ipsam maiores provident aspernatur blanditiis, culpa quas! Tenetur, recusandae pariatur temporibus minus cupiditate, optio.</p><p>Nesciunt molestiae possimus ea quidem! Cumque delectus provident, itaque at exercitationem quis tenetur iusto minima est atque! Magnam suscipit perspiciatis laboriosam, molestiae sapiente consequuntur!</p>'
      }
    ];

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

    var dataImage = $('#gallery').attr('data-src');
    this.setSlideView(this.images[this.imageIterator]);
    this.cycleImages();

    var duplicates = false, i = 0;
    for (var i = 0; i < this.images.length; i++) {
      if (this.images[i].image === dataImage) {
        duplicates = true;
        break;
      }
    }
    if (!duplicates) {
      this.image.push(dataImage);
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

$(function() {
  var gallery = new Gallery();
});
