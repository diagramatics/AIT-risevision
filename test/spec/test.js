/* global describe, it */

(function () {
  'use strict';

  describe('Test the Gallery class', function() {
    it('should exist', function() {
      should.exist(Gallery);
    });
    it('should create an instance of Gallery', function() {
      assert.equal(true, new Gallery() instanceof Gallery);
    });
    it('should be an object', function() {
      assert.equal('object', typeof new Gallery());
    });
    it('should load images data from Google Spreadsheet', function(done) {
      // Because this queries to the outside world, set a longer timeout
      this.timeout(180000);
      var gallery = new Gallery();
      gallery.loadImagesData(function(result) {
        if (result !== 'success') {
          throw result;
        }
        else {
          assert.isAbove(gallery.images.length, 0);
        }
        done();
      });
    });
  });

  describe('Test the TimeAlert class', function() {
    var timealert;
    it('should exist', function() {
      should.exist(TimeAlert);
    });
    it('should create an instance of TimeAlert', function() {
      assert.equal(true, new TimeAlert() instanceof TimeAlert);
    });
    it('should be an object', function() {
      assert.equal('object', typeof new TimeAlert());
    });
    it('should load timetables from Google Spreadsheet', function(done) {
      // Because this queries to the outside world, set a longer timeout
      this.timeout(180000);
      timealert = new TimeAlert();
      timealert.loadData(function(result) {
        if (result !== 'success') {
          throw result;
        }
        else {
          assert.isAbove(timealert.times.length, 0);
        }
        done();
      })
    });
  });

})();
