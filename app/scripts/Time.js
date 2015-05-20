class Time {
  constructor() {
    let time = this.getTime();

    this.$element = $('[data-time]');
    this.$element.html(time.format('h:mm:ss a'));
    // Return the timer interval so we can manipulate it from other classes

    this.updateTime(time);
  }

  updateTime(oldTime) {
    return setTimeout(() => {
      let time = this.getTime();
      this.$element.html(time.format('h:mm:ss a'));
      this.updateTime(time);
    }, 1000 - (oldTime.format('x')).slice(-3))
  }

  getTime() {
    return moment().tz("Australia/Sydney");
  }
}

export default Time;
