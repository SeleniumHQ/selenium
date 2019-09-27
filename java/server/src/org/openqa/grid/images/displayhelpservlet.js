(function main() {
  "use strict";

  $(document).ready(function () {
    var type = JSON.parse(json).type,
      version = JSON.parse(json).version,
      consoleLink = JSON.parse(json).consoleLink,
      wikiLink = 'https://github.com/SeleniumHQ/selenium/wiki/',
      docsLink = 'http://docs.seleniumhq.org/docs/';

    if (type.indexOf('Grid') > -1) {
      wikiLink = 'https://github.com/SeleniumHQ/selenium/wiki/Grid2';
      docsLink = 'http://docs.seleniumhq.org/docs/07_selenium_grid.jsp';
    }

    $(document).attr('title', 'Selenium ' + type + ' v.' + version);
    $('.se-version').text(version);
    $('.se-type').text(type);
    $('.se-wiki').attr('href', wikiLink);
    $('.se-docs').attr('href', docsLink);

    if (consoleLink !== '') {
      $('.se-console').attr('href', consoleLink);
      $('#console-item').attr('style', 'font-size: small; visibility: visible');
    }
  });
}());
