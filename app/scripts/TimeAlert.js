import Presentation from './Presentation';
import GSheet from './GSheet';

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

  resetContent() {
    // Stop the countdown
    window.clearInterval(this.countdown);
  }

  loadData(after) {
    let jsonURL = GSheet.assembleJSONUrl('TIME');
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
        return after('success');
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

export default TimeAlert;
