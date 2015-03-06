var Utils = require("../../../third_party/js/mozmill/shared-modules/utils");

var setupModule = function(module) {
  browser = mozmill.getBrowserController();
};

var testRunSuite = function () {
    browser.click(new elementslib.Elem(browser.menus.Tools['menuToolsSeleniumIDE']));
    Utils.handleWindow("type", "global:selenium-ide", function(browser) {}, true);
    selenium = new mozmill.controller.MozMillController(mozmill.utils.getWindowByType("global:selenium-ide"));

    selenium.click(new elementslib.Elem(selenium.menus.File['menu_FileOpenSuite'])); 
};