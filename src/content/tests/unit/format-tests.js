this.seleniumAPI = {};
const subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium/scripts/selenium-api.js', this.seleniumAPI);

Command.prototype.getAPI = function() {
	return seleniumAPI;
}

function setUp() {
	this.formats = new FormatCollection({});
}

function testRubyRCFormat() {
	var format = this.formats.findFormat("ruby-rc");
	var f = format.getFormatter();
	assertEquals('assert @selenium.is_text_present("hello")', f.formatCommand(new Command('assertTextPresent', 'hello')));
	assertEquals('abc = @selenium.is_text_present("test")', f.formatCommand(new Command('storeTextPresent', 'test', 'abc')));
	assertEquals('sleep 1 until @selenium.is_text_present("test")', f.formatCommand(new Command('waitForTextPresent', 'test')));
	assertEquals('assert_equal "def", @selenium.get_text("abc")', f.formatCommand(new Command('assertText', 'abc', 'def')));
	assertEquals('assert_equal "abc", @selenium.get_location', f.formatCommand(new Command('assertLocation', 'abc')));
	assertEquals('def = @selenium.get_text("abc")', f.formatCommand(new Command('storeText', 'abc', 'def')));
	assertEquals('sleep 1 until "def" == @selenium.get_text("abc")', f.formatCommand(new Command('waitForText', 'abc', 'def')));
	assertEquals('@selenium.open "http://www.google.com/"', f.formatCommand(new Command('open', 'http://www.google.com/')));
}

function testJavaRCFormat() {
	var format = this.formats.findFormat("java-rc");
	var f = format.getFormatter();
	assertEquals('assertTrue(selenium.isTextPresent("hello"));', f.formatCommand(new Command('assertTextPresent', 'hello')));
	assertEquals('boolean abc = selenium.isTextPresent("test");', f.formatCommand(new Command('storeTextPresent', 'test', 'abc')));
	assertEquals('while (!selenium.isTextPresent("test")) { Thread.sleep(1000); }', f.formatCommand(new Command('waitForTextPresent', 'test')));
	assertEquals('assertEquals("def", selenium.getText("abc"));', f.formatCommand(new Command('assertText', 'abc', 'def')));
	assertEquals('assertEquals("abc", selenium.getLocation());', f.formatCommand(new Command('assertLocation', 'abc')));
	assertEquals('String def = selenium.getText("abc");', f.formatCommand(new Command('storeText', 'abc', 'def')));
	assertEquals('while (!"def".equals(selenium.getText("abc"))) { Thread.sleep(1000); }', f.formatCommand(new Command('waitForText', 'abc', 'def')));
	assertEquals('selenium.open("http://www.google.com/");', f.formatCommand(new Command('open', 'http://www.google.com/')));
}
