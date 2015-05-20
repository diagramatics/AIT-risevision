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
    let $start = $('.event-timetable-entry-start', newElement);
    let $end = $('.event-timetable-entry-end', newElement);

    // If the scheduled content is starting and hasn't ended yet,
    // add a class to change style
    if (currentTime >= content.start && currentTime < content.end) {
      newElement.addClass('-ongoing');
    }

    $title.append(content.title);
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

      // And start a timer to real time update which class are starting,
      // ongoing, and finished.
      setTimeout(() => {
        this.updateEventAvailability($('.event-timetable-entry'));
      }, 60000 - now.seconds() * 1000 - now.milliseconds());
      // This is to match the timeout so it triggers at the exact minute
    }
    super.dataLoaded(result);
  }

  updateEventAvailability(entries) {
    let now = moment();
    // Check if any classes are starting
    entries.each(function(index) {
      let startTime = moment($('.event-timetable-entry-start', this).text(), 'HH:mm');
      // We don't need to compare the endTime since this is done on a periodical
      // basis and there won't be any occurences when the timer is suddenly
      // past a class
      if (now >= startTime) {
        $(this).addClass('-ongoing');

        // Skip a check if the element has the -ongoing class and use the time
        // This also acts as a backup if the preliminary conditional without the
        // endTime check suddenly checks past a class
        let endTime = moment($('.event-timetable-entry-end', this).text(), 'HH:mm');
        if (now > endTime) {
          $(this).removeClass('-ongoing');
        }
      }
    });

    setTimeout(() => {
      this.updateEventAvailability(entries);
    }, 60000 - moment().milliseconds); // Timeout should trigger as precise as possible
  }
}

export default EventTimetable;
