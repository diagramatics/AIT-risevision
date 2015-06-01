import Presentation from './Presentation';
import G_Sheet from './G_Sheet';

class EventTimetable extends Presentation {
  constructor() {
    super();

    this.schedule = [];
    this.message = '';

    this.el = {
      'root': $('#eventTimetable'),
      'message': $('#eventTimetableMessage'),
      'entries': $('#eventTimetableEntries'),
      'entryTemplate': $('#eventTimetableEntryTemplate')
    }

    this.loadData((result) => {
      this.dataLoaded(result);
    });
  }

  resetContent() {
    this.el.message.empty();
    this.el.entries.empty().append(this.el.entry);
    this.schedule = [];
    this.message = '';
  }

  loadData(after) {
    $.getJSON(G_Sheet.assembleJSONUrl('EVENTTIMETABLE'))
      .done((data) => {
        for (var i = 0; i < data.feed.entry.length; i++) {
          let row = data.feed.entry[i];

          // Get the message if it's not empty
          // This is because we're parsing every row on the spreadsheet and
          // some are empty
          this.message = row.gsx$message.$t !== '' ? row.gsx$message.$t : this.message;

          let title = row.gsx$schedulename.$t;

          let startTime = (row.gsx$starttimes.$t).split(':', 2);
          // Set a date with today but with a different time
          let today = new Date();
          startTime = new moment([today.getFullYear(), today.getMonth(), today.getDate(), startTime[0], startTime[1], 0]);
          let endTime = (row.gsx$endtimes.$t).split(':', 2);
          endTime = new moment([today.getFullYear(), today.getMonth(), today.getDate(), endTime[0], endTime[1], 0]);

          this.schedule.push({
            'title': title,
            'subtitle': row.gsx$subtitle.$t,
            'type': row.gsx$type.$t,
            'speaker': row.gsx$speaker.$t,
            'location': row.gsx$location.$t,
            'start': startTime,
            'end': endTime
          });
        }
        // After fetching is finished let's run the post-load function
        return after('success');
      })
      .fail(function(jqxhr, textStatus, error) {
        return after(error);
      });
  }

  getTemplate() {
    return this.el.entryTemplate.attr('id', '');
  }

  insertContent(content, template = this.getTemplate(), currentTime = moment()) {
    let newElement = template.appendTo(this.el.entries);
    let $title = $('.event-timetable-entry-title', newElement);
    let $subtitle = $('.event-timetable-entry-subtitle', newElement);
    let $speaker = $('.event-timetable-entry-speaker', newElement);
    let $location = $('.event-timetable-entry-location', newElement);
    let $start = $('.event-timetable-entry-start', newElement);
    let $end = $('.event-timetable-entry-end', newElement);

    // If the scheduled content is starting and hasn't ended yet,
    // add a class to change style
    if (currentTime >= content.start && currentTime < content.end) {
      newElement.addClass('-ongoing');
    }

    $title.append(content.title);
    $subtitle.append(content.subtitle);
    $speaker.append(content.speaker);
    $location.append(content.location);
    $start.append(content.start.format('HH:mm'));
    $end.append(content.end.format('HH:mm'));
  }

  dataLoaded(result) {
    if (result === 'success') {
      // Update the message (MOTD)
      this.el.message.text(this.message);
      // Now add the timetable entries
      let template = this.getTemplate();
      let now = moment();
      for (var i = 0; i < this.schedule.length; i++) {
        this.insertContent(this.schedule[i], template.clone(), now);
      }
      // After content insertion remove the template
      template.remove();
      // Sort the list according to the start time
      tinysort($('.event-timetable-entry'), {
        selector: '.event-timetable-entry-start',
        useFlex: false
      });

      // And start a timer to real time update which class are starting,
      // ongoing, and finished.
      this.updateEventAvailability($('.event-timetable-entry'));
      // This is to match the timeout so it triggers at the exact minute
    }
    super.dataLoaded(result);
  }

  updateEventAvailability(entries) {
    let now = moment();
    let mostTopElement = 0;
    let combinedHeight = 0;
    let upcoming;
    // Check if any classes are starting
    entries.each(function(index) {
      let $this = $(this);
      let startTime = moment($('.event-timetable-entry-start', this).text(), 'HH:mm');
      let endTime = moment($('.event-timetable-entry-end', this).text(), 'HH:mm');
      // Check if the event is occuring between the timeframe
      if (now >= startTime && now < endTime) {
        $this.addClass('-ongoing');

        combinedHeight += $this.outerHeight();

        if (mostTopElement === 0 || mostTopElement > $this.offset().top) {
          mostTopElement = $this.offset().top;
        }
      }
      else {
        $this.removeClass('-ongoing');

        // While looping get the upcoming event too.
        // This algorithm gets the upcoming event by getting the smallest
        // difference between the current time and the event start time, then
        // get the first entry of the event
        if (now < startTime && (upcoming === undefined)) {
          upcoming = $this.offset().top;
        }
      }
    });

    // After all the highlighting position the active events in the screen
    //$(document).velocity('stop');
    // If the combined height is larger than the viewport height...
    if (combinedHeight > $('html').height()) {
      // Scroll then animate viewing the whole events top to bottom
      $('body').velocity('scroll', { offset: mostTopElement - this.el.message.outerHeight() })
        .velocity('scroll', {
          offset: mostTopElement + (combinedHeight - $('html').height()),
          loop: true,
          duration: (60000 - now.seconds() * 1000 - now.milliseconds()) / 2
        });
    }
    else {
      // mostTopElement || upcoming. What it does is getting the topmost event
      // being active, and if there's no events active, get the upcoming one.
      $('body').velocity('scroll', { offset: (mostTopElement || upcoming) - this.el.message.outerHeight()  });
    }

    setTimeout(() => {
      this.updateEventAvailability(entries);
    }, 60000 - now.seconds() * 1000 - now.milliseconds()); // Timeout should trigger as precise as possible
  }
}

export default EventTimetable;
