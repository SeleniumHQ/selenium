/*
 * Formatter for Selenium 2 / WebDriver Python client.
 */

if (!this.formatterType) {  // this.formatterType is defined for the new Formatter system
  // This method (the if block) of loading the formatter type is deprecated.
  // For new formatters, simply specify the type in the addPluginProvidedFormatter() and omit this
  // if block in your formatter.
  var subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
  subScriptLoader.loadSubScript('chrome://selenium-ide/content/formats/webdriver.js', this);
}

function testClassName(testName) {
  return testName.split(/[^0-9A-Za-z]+/).map(
      function(x) {
        return capitalize(x);
      }).join('');
}

function testMethodName(testName) {
  return "test_" + testName.split(/[^0-9A-Za-z]+/).map(
      function(x) {
        return underscore(x);
      }).join('');
  //return "test_" + underscore(testName);
}

function nonBreakingSpace() {
  return "u\"\\u00a0\"";
}

function string(value) {
  value = value.replace(/\\/g, '\\\\');
  value = value.replace(/\"/g, '\\"');
  value = value.replace(/\r/g, '\\r');
  value = value.replace(/\n/g, '\\n');
  var unicode = false;
  for (var i = 0; i < value.length; i++) {
    if (value.charCodeAt(i) >= 128) {
      unicode = true;
    }
  }
  return (unicode ? 'u' : '') + '"' + value + '"';
}

function array(value) {
  var str = '[';
  for (var i = 0; i < value.length; i++) {
    str += string(value[i]);
    if (i < value.length - 1) str += ", ";
  }
  str += ']';
  return str;
}

notOperator = function() {
  return "not ";
};

Equals.prototype.toString = function() {
  return this.e1.toString() + " == " + this.e2.toString();
};

Equals.prototype.assert = function() {
  return "self.assertEqual(" + this.e1.toString() + ", " + this.e2.toString() + ")";
};

Equals.prototype.verify = function() {
  return verify(this.assert());
};

NotEquals.prototype.toString = function() {
  return this.e1.toString() + " != " + this.e2.toString();
};

NotEquals.prototype.assert = function() {
  return "self.assertNotEqual(" + this.e1.toString() + ", " + this.e2.toString() + ")";
};

NotEquals.prototype.verify = function() {
  return verify(this.assert());
};

function joinExpression(expression) {
  return "','.join(" + expression.toString() + ")";
}

function statement(expression) {
  return expression.toString();
}

function assignToVariable(type, variable, expression) {
  return variable + " = " + expression.toString();
}

function ifCondition(expression, callback) {
  var blk = callback().replace(/\n$/m,'');
  return "if " + expression.toString() + ":\n" + blk;
}

function assertTrue(expression) {
  return "self.assertTrue(" + expression.toString() + ")";
}

function assertFalse(expression) {
  return "self.assertFalse(" + expression.toString() + ")";
}

function verify(statement) {
  return "try: " + statement + "\n" +
      "except AssertionError as e: self.verificationErrors.append(str(e))";
}

function verifyTrue(expression) {
  return verify(assertTrue(expression));
}

function verifyFalse(expression) {
  return verify(assertFalse(expression));
}

RegexpMatch.patternAsRawString = function(pattern) {
  var str = pattern;
  if (str.match(/\"/) || str.match(/\n/)) {
    str = str.replace(/\\/g, "\\\\");
    str = str.replace(/\"/g, '\\"');
    str = str.replace(/\n/g, '\\n');
    return '"' + str + '"';
  } else {
    return str = 'r"' + str + '"';
  }
};

RegexpMatch.prototype.patternAsRawString = function() {
  return RegexpMatch.patternAsRawString(this.pattern);
};

RegexpMatch.prototype.toString = function() {
  var str = this.pattern;
  if (str.match(/\"/) || str.match(/\n/)) {
    str = str.replace(/\\/g, "\\\\");
    str = str.replace(/\"/g, '\\"');
    str = str.replace(/\n/g, '\\n');
    return '"' + str + '"';
  } else {
    str = 'r"' + str + '"';
  }
  return "re.search(" + str + ", " + this.expression + ")";
};

RegexpMatch.prototype.assert = function() {
  return 'self.assertRegexpMatches(' + this.expression + ", " + this.patternAsRawString() + ")";
};

RegexpMatch.prototype.verify = function() {
  return verify(this.assert());
};

RegexpNotMatch.prototype.patternAsRawString = function() {
  return RegexpMatch.patternAsRawString(this.pattern);
};

RegexpNotMatch.prototype.assert = function() {
  return 'self.assertNotRegexpMatches(' + this.expression + ", " + this.patternAsRawString() + ")";
};

RegexpNotMatch.prototype.verify = function() {
  return verify(this.assert());
};

function waitFor(expression) {
  return "for i in range(60):\n" +
      indents(1) + "try:\n" +
      indents(2) + "if " + expression.toString() + ": break\n" +
      indents(1) + "except: pass\n" +
      indents(1) + 'time.sleep(1)\n' +
      'else: self.fail("time out")';
}

function assertOrVerifyFailure(line, isAssert) {
  return "try: " + line + "\n" +
      "except: pass\n" +
      'else: self.fail("expected failure")';
}

function pause(milliseconds) {
  return "time.sleep(" + (parseInt(milliseconds, 10) / 1000) + ")";
}

function echo(message) {
  return "print(" + xlateArgument(message) + ")";
}

function formatComment(comment) {
  return comment.comment.replace(/.+/mg, function(str) {
    return "# " + str;
  });
}

function keyVariable(key) {
  return "Keys." + key;
}

this.sendKeysMaping = {
  BKSP: "BACK_SPACE",
  BACKSPACE: "BACK_SPACE",
  TAB: "TAB",
  ENTER: "ENTER",
  SHIFT: "SHIFT",
  CONTROL: "CONTROL",
  CTRL: "CONTROL",
  ALT: "ALT",
  PAUSE: "PAUSE",
  ESCAPE: "ESCAPE",
  ESC: "ESCAPE",
  SPACE: "SPACE",
  PAGE_UP: "PAGE_UP",
  PGUP: "PAGE_UP",
  PAGE_DOWN: "PAGE_DOWN",
  PGDN: "PAGE_DOWN",
  END: "END",
  HOME: "HOME",
  LEFT: "LEFT",
  UP: "UP",
  RIGHT: "RIGHT",
  DOWN: "DOWN",
  INSERT: "INSERT",
  INS: "INSERT",
  DELETE: "DELETE",
  DEL: "DELETE",
  SEMICOLON: "SEMICOLON",
  EQUALS: "EQUALS",

  NUMPAD0: "NUMPAD0",
  N0: "NUMPAD0",
  NUMPAD1: "NUMPAD1",
  N1: "NUMPAD1",
  NUMPAD2: "NUMPAD2",
  N2: "NUMPAD2",
  NUMPAD3: "NUMPAD3",
  N3: "NUMPAD3",
  NUMPAD4: "NUMPAD4",
  N4: "NUMPAD4",
  NUMPAD5: "NUMPAD5",
  N5: "NUMPAD5",
  NUMPAD6: "NUMPAD6",
  N6: "NUMPAD6",
  NUMPAD7: "NUMPAD7",
  N7: "NUMPAD7",
  NUMPAD8: "NUMPAD8",
  N8: "NUMPAD8",
  NUMPAD9: "NUMPAD9",
  N9: "NUMPAD9",
  MULTIPLY: "MULTIPLY",
  MUL: "MULTIPLY",
  ADD: "ADD",
  PLUS: "ADD",
  SEPARATOR: "SEPARATOR",
  SEP: "SEPARATOR",
  SUBTRACT: "SUBTRACT",
  MINUS: "SUBTRACT",
  DECIMAL: "DECIMAL",
  PERIOD: "DECIMAL",
  DIVIDE: "DIVIDE",
  DIV: "DIVIDE",

  F1: "F1",
  F2: "F2",
  F3: "F3",
  F4: "F4",
  F5: "F5",
  F6: "F6",
  F7: "F7",
  F8: "F8",
  F9: "F9",
  F10: "F10",
  F11: "F11",
  F12: "F12",

  META: "META",
  COMMAND: "COMMAND"
};

function defaultExtension() {
  return this.options.defaultExtension;
}

this.options = {
  receiver: "driver",
  showSelenese: 'false',
  rcHost: "localhost",
  rcPort: "4444",
  environment: "*chrome",
  header:
      '# -*- coding: utf-8 -*-\n' +
          'from selenium import webdriver\n' +
          'from selenium.webdriver.common.by import By\n' +
          'from selenium.webdriver.common.keys import Keys\n' +
          'from selenium.webdriver.support.ui import Select\n' +
          'from selenium.common.exceptions import NoSuchElementException\n' +
          'from selenium.common.exceptions import NoAlertPresentException\n' +
          'import unittest, time, re\n' +
          '\n' +
          'class ${className}(unittest.TestCase):\n' +
          '    def setUp(self):\n' +
          '        self.driver = webdriver.Firefox()\n' +
          '        self.driver.implicitly_wait(30)\n' +
          '        self.base_url = "${baseURL}"\n' +
          '        self.verificationErrors = []\n' +
          '        self.accept_next_alert = True\n' +
          '    \n' +
          '    def ${methodName}(self):\n' +
          '        ${receiver} = self.driver\n',
  footer:
      '    \n' +
          '    def is_element_present(self, how, what):\n' +
          '        try: self.driver.find_element(by=how, value=what)\n' +
          '        except NoSuchElementException as e: return False\n' +
          '        return True\n' +
          '    \n' +
          '    def is_alert_present(self):\n' +
          '        try: self.driver.switch_to_alert()\n' +
          '        except NoAlertPresentException as e: return False\n' +
          '        return True\n' +
          '    \n' +
          '    def close_alert_and_get_its_text(self):\n' +
          '        try:\n' +
          '            alert = self.driver.switch_to_alert()\n' +
          '            alert_text = alert.text\n' +
          '            if self.accept_next_alert:\n' +
          '                alert.accept()\n' +
          '            else:\n' +
          '                alert.dismiss()\n' +
          '            return alert_text\n' +
          '        finally: self.accept_next_alert = True\n' +
          '    \n' +
          '    def tearDown(self):\n' +
          '        self.driver.quit()\n' +
          '        self.assertEqual([], self.verificationErrors)\n' +
          '\n' +
          'if __name__ == "__main__":\n' +
          '    unittest.main()\n',
  indent:  '4',
  initialIndents: '2',
  defaultExtension: "py"
};

this.configForm =
    '<description>Variable for Selenium instance</description>' +
        '<textbox id="options_receiver" />' +
        '<description>Selenium RC host</description>' +
        '<textbox id="options_rcHost" />' +
        '<description>Selenium RC port</description>' +
        '<textbox id="options_rcPort" />' +
        '<description>Environment</description>' +
        '<textbox id="options_environment" />' +
        '<description>Header</description>' +
        '<textbox id="options_header" multiline="true" flex="1" rows="4"/>' +
        '<description>Footer</description>' +
        '<textbox id="options_footer" multiline="true" flex="1" rows="4"/>' +
        '<description>Indent</description>' +
        '<menulist id="options_indent"><menupopup>' +
        '<menuitem label="Tab" value="tab"/>' +
        '<menuitem label="1 space" value="1"/>' +
        '<menuitem label="2 spaces" value="2"/>' +
        '<menuitem label="3 spaces" value="3"/>' +
        '<menuitem label="4 spaces" value="4"/>' +
        '<menuitem label="5 spaces" value="5"/>' +
        '<menuitem label="6 spaces" value="6"/>' +
        '<menuitem label="7 spaces" value="7"/>' +
        '<menuitem label="8 spaces" value="8"/>' +
        '</menupopup></menulist>' +
        '<checkbox id="options_showSelenese" label="Show Selenese"/>';

this.name = "Python (WebDriver)";
this.testcaseExtension = ".py";
this.suiteExtension = ".py";
this.webdriver = true;

WDAPI.Driver = function() {
  this.ref = options.receiver;
};

WDAPI.Driver.searchContext = function(locatorType, locator) {
  var locatorString = xlateArgument(locator);
  switch (locatorType) {
    case 'xpath':
      return '_by_xpath(' + locatorString;
    case 'css':
      return '_by_css_selector(' + locatorString;
    case 'id':
      return '_by_id(' + locatorString;
    case 'link':
      return '_by_link_text(' + locatorString;
    case 'name':
      return '_by_name(' + locatorString;
    case 'tag_name':
      return '_by_tag_name(' + locatorString;
  }
  throw 'Error: unknown strategy [' + locatorType + '] for locator [' + locator + ']';
};

WDAPI.Driver.searchContextArgs = function(locatorType, locator) {
  var locatorString = xlateArgument(locator);
  switch (locatorType) {
    case 'xpath':
      return 'By.XPATH, ' + locatorString;
    case 'css':
      return 'By.CSS_SELECTOR, ' + locatorString;
    case 'id':
      return 'By.ID, ' + locatorString;
    case 'link':
      return 'By.LINK_TEXT, ' + locatorString;
    case 'name':
      return 'By.NAME, ' + locatorString;
    case 'tag_name':
      return 'By.TAG_NAME, ' + locatorString;
  }
  throw 'Error: unknown strategy [' + locatorType + '] for locator [' + locator + ']';
};

WDAPI.Driver.prototype.back = function() {
  return this.ref + ".back()";
};

WDAPI.Driver.prototype.close = function() {
  return this.ref + ".close()";
};

WDAPI.Driver.prototype.findElement = function(locatorType, locator) {
  return new WDAPI.Element(this.ref + ".find_element" + WDAPI.Driver.searchContext(locatorType, locator) + ")");
};

WDAPI.Driver.prototype.findElements = function(locatorType, locator) {
  return new WDAPI.ElementList(this.ref + ".find_elements" + WDAPI.Driver.searchContext(locatorType, locator) + ")");
};

WDAPI.Driver.prototype.getCurrentUrl = function() {
  return this.ref + ".current_url";
};

WDAPI.Driver.prototype.get = function(url) {
  if (url.length > 1 && (url.substring(1,8) == "http://" || url.substring(1,9) == "https://")) { // url is quoted
    return this.ref + ".get(" + url + ")";
  } else {
    return this.ref + ".get(self.base_url + " + url + ")";
  }
};

WDAPI.Driver.prototype.getTitle = function() {
  return this.ref + ".title";
};

WDAPI.Driver.prototype.getAlert = function() {
  return "self.close_alert_and_get_its_text()";
};

WDAPI.Driver.prototype.chooseOkOnNextConfirmation = function() {
  return "self.accept_next_alert = True";
};

WDAPI.Driver.prototype.chooseCancelOnNextConfirmation = function() {
  return "self.accept_next_alert = False";
};

WDAPI.Driver.prototype.refresh = function() {
  return this.ref + ".refresh()";
};

WDAPI.Element = function(ref) {
  this.ref = ref;
};

WDAPI.Element.prototype.clear = function() {
  return this.ref + ".clear()";
};

WDAPI.Element.prototype.click = function() {
  return this.ref + ".click()";
};

WDAPI.Element.prototype.getAttribute = function(attributeName) {
  return this.ref + ".get_attribute(" + xlateArgument(attributeName) + ")";
};

WDAPI.Element.prototype.getText = function() {
  return this.ref + ".text";
};

WDAPI.Element.prototype.isDisplayed = function() {
  return this.ref + ".is_displayed()";
};

WDAPI.Element.prototype.isSelected = function() {
  return this.ref + ".is_selected()";
};

WDAPI.Element.prototype.sendKeys = function(text) {
  return this.ref + ".send_keys(" + xlateArgument(text, 'args') + ")";
};

WDAPI.Element.prototype.submit = function() {
  return this.ref + ".submit()";
};

WDAPI.Element.prototype.select = function(selectLocator) {
  if (selectLocator.type == 'index') {
    return "Select(" + this.ref + ").select_by_index(" + selectLocator.string + ")";
  }
  if (selectLocator.type == 'value') {
    return "Select(" + this.ref + ").select_by_value(" + xlateArgument(selectLocator.string) + ")";
  }
  return "Select(" + this.ref + ").select_by_visible_text(" + xlateArgument(selectLocator.string) + ")";
};

WDAPI.ElementList = function(ref) {
  this.ref = ref;
};

WDAPI.ElementList.prototype.getItem = function(index) {
  return this.ref + "[" + index + "]";
};

WDAPI.ElementList.prototype.getSize = function() {
  return 'len(' + this.ref + ")";
};

WDAPI.ElementList.prototype.isEmpty = function() {
  return 'len(' + this.ref + ") == 0";
};


WDAPI.Utils = function() {
};

WDAPI.Utils.isElementPresent = function(how, what) {
  return "self.is_element_present(" + WDAPI.Driver.searchContextArgs(how, what) + ")";
};

WDAPI.Utils.isAlertPresent = function() {
  return "self.is_alert_present()";
};
