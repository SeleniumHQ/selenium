function findGoogle3Path() {
  var scripts = document.getElementsByTagName('script');
  var testbaseDir = './';
  for (var i = 0; i < scripts.length; i++) {
    var src = scripts[i].src;
    var l = src.length;
    if (src.substr(l - 11) == 'testbase.js') {
      testbaseDir = src.substr(0, l - 11);
      break;
    }
  }
  return testbaseDir + '../../../../../../../';
}

var files = [
  'javascript/closure/base.js',
  'third_party/javascript/browser_automation/bot/deps.js',
  'java/com/google/testing/webdriver/emulation/script/deps.js'
];

(function() {
  var G3 = findGoogle3Path();

  for (var i = 0; i < files.length; i++) {
    document.write('<script type="text/javascript" src="' +
        G3 + files[i] + '"></script>');
  }
})();
