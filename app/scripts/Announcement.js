import Presentation from './Presentation';
import GSheet from './GSheet';

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

    // Lexical this! ES6 FTW
    this.loadData((result) => {
      this.dataLoaded(result);
    });
  }

  resetContent() {
    // Remove the contents of the title and the content
    this.el.title.empty();
    this.el.content.empty();
  }

  loadData(after) {
    let jsonURL = GSheet.assembleJSONUrl('ANNOUNCEMENT');
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
    // Every time the content is changed the cached variable (this.el.*) gets
    // unreferenced. Reference the current, changed ones and overwrite the
    // object again.
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

    // After using textFit the DOM gets manipulated that the saved element
    // doesn't exist anymore. Replace the reference
    this.el.title = $('#announcementTitle');
    this.el.content = $('#announcementContent');
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

export default Announcement;
