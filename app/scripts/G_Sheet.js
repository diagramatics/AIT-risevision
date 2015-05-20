class G_Sheet {
  constructor() {}
  /**
    * Initialize the Google Sheet class
    * @param after The function to call next
    **/
  static initialize(after = function() {}) {
    // Set the worksheet ID
    this.sheetID = '1OmNdBJjC71iyXzih4YTBdlxzDwCEjBkac8oW6kJBYIw';
    // Get the list of worksheets and put them on an enum
    this.sheetEnum = {};
    $.getJSON('http://crossorigin.me/https://spreadsheets.google.com/feeds/worksheets/'+ this.sheetID +'/public/values?alt=json')
      .done((data) => {
        // Push the fetched data to the sheetEnum object
        for (let i = 0; i < data.feed.entry.length; i++) {
          let row = data.feed.entry[i];
          let enumName = ((row.title.$t).toUpperCase()).replace(/ /g, ''); // Uppercase and remove spaces
          this.sheetEnum[enumName] = i+1;
        }
        after();
      })
      .fail(function(jqxhr, textStatus, error) {
        //throw error;
      });
  }

  static assembleJSONUrl(enumName, type = 'list') {
    return 'http://crossorigin.me/https://spreadsheets.google.com/feeds/'+ type +'/'+ this.sheetID +'/'+ this.sheetEnum[enumName] +'/public/values?alt=json';
  }

  // ID is the ID from the URL of Google Sheet
  // The URL to open the Sheet is https://docs.google.com/a/ait.nsw.edu.au/spreadsheets/d/1OmNdBJjC71iyXzih4YTBdlxzDwCEjBkac8oW6kJBYIw/
  // Last part of the URL is the ID
  // This enum is used for the positional ID of the spreadsheet
  // static sheetEnum = {
  //   "GALLERY": 1,
  //   "TIME": 2,
  //   "ANNOUNCEMENT": 3
  // };
}

export default G_Sheet;




// Google API test code

// var CLIENT_ID = '404474158533-ismn9i3l92mjuhnt6ccl8jneggd1n9ru.apps.googleusercontent.com';
// var SCOPES = 'https://www.googleapis.com/auth/drive';
// var googleAPI;
//
// /**
//  * Called when the client library is loaded to start the auth flow.
//  */
// function handleClientLoad() {
//   googleAPI = new GoogleAPI();
// }
//
// class GoogleAPI {
//   constructor() {
//     gapi.client.setApiKey('AIzaSyBRFaPWEEcN7H9EyTqMZqDyJuz43ENHQ8g');
//     window.setTimeout(this.checkAuth, 1);
//   }
//
//   checkAuth() {
//       gapi.auth.authorize({
//         'client_id': CLIENT_ID,
//         'scope': SCOPES,
//         'immediate': true
//       }, this.handleAuthResult);
//   }
//
//   handleAuthResult(authResult) {
//     if (authResult && !authResult.error) {
//       console.log('yay');
//     }
//     else {
//       console.log('nay');
//     }
//   }
// }
// ---------
