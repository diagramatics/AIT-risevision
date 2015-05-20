class Presentation {
  constructor() {
    // Add a listener to the keypress 'R' to reload the page
    this.keypressWait = false;
    $(document).on('keypress', (event) => {
      if (event.keyCode === 114 && this.keypressWait === false) {
        this.keypressWait = true;
        this.reloadContent();
      }
    });
  }
  dataLoaded(result) {
    if (result === 'success') {
      $('body').addClass('loaded');
    }
    else {
      $('body').addClass('load-fail');
    }
  }

  reloadContent() {
    // Remove the loaded state of the Presentation
    $('body').removeClass('loaded load-fail');
    // Call the reset content implemented on the subclasses
    this.resetContent();
    // Then load the data again
    this.loadData((result) => {
      this.dataLoaded(result);
      this.keypressWait = false;
    });
  }
}

export default Presentation;
