/* jshint devel:true */
/* global moment, countdown, textFit */
'use strict';

// Import everything. ES6 + Babel + Browserify rocks!
import G_Sheet from './G_Sheet';
import Time from './Time';
import Gallery from './Gallery';
import TimeAlert from './TimeAlert';
import Announcement from './Announcement';
import Dashboard from './Dashboard';
import EventTimetable from './EventTimetable';

$(function() {
  // Initialize the Google Sheet class
  G_Sheet.initialize(function() {
    // When data is loaded do these

    if ($('[data-time]').length === 1) {
      new Time();
    }

    // Check if there's a gallery and there's exactly only one on the DOM
    if ($('[data-gallery]').length === 1) {
      // Initialize the gallery
      new Gallery();
    }

    if ($('[data-timealert]').length === 1) {
      new TimeAlert();
    }

    if ($('[data-announcement]').length === 1) {
      new Announcement();
    }

    if ($('[data-dashboard]').length === 1) {
      new Dashboard();
    }

    if ($('[data-event-timetable]').length === 1) {
      new EventTimetable();
    }
  });
});
