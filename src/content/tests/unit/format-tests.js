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
	assertEquals('assert !@selenium.is_text_present("hello")', f.formatCommand(new Command('assertTextNotPresent', 'hello')));
	assertEquals('abc = @selenium.is_text_present("test")', f.formatCommand(new Command('storeTextPresent', 'test', 'abc')));
	assertEquals('sleep 1 until @selenium.is_text_present("test")', f.formatCommand(new Command('waitForTextPresent', 'test')));
	assertEquals('sleep 1 while @selenium.is_text_present("test")', f.formatCommand(new Command('waitForTextNotPresent', 'test')));
	assertEquals('assert_equal "def", @selenium.get_text("abc")', f.formatCommand(new Command('assertText', 'abc', 'def')));
	assertEquals('assert_equal "abc", @selenium.get_location', f.formatCommand(new Command('assertLocation', 'abc')));
	assertEquals('assert_not_equal "abc", @selenium.get_location', f.formatCommand(new Command('assertNotLocation', 'abc')));
	assertEquals('def = @selenium.get_text("abc")', f.formatCommand(new Command('storeText', 'abc', 'def')));
	assertEquals('sleep 1 until "def" == @selenium.get_text("abc")', f.formatCommand(new Command('waitForText', 'abc', 'def')));
	assertEquals('sleep 1 while "def" == @selenium.get_text("abc")', f.formatCommand(new Command('waitForNotText', 'abc', 'def')));
	assertEquals('@selenium.open "http://www.google.com/"', f.formatCommand(new Command('open', 'http://www.google.com/')));
}

function testPerlRCFormat() {
	var format = this.formats.findFormat("perl-rc");
	var f = format.getFormatter();
	assertEquals('$sel->is_text_present_ok("hello");', f.formatCommand(new Command('assertTextPresent', 'hello')));
	assertEquals('ok(not $sel->is_text_present("hello"));', f.formatCommand(new Command('assertTextNotPresent', 'hello')));
	assertEquals('$abc = $sel->is_text_present("test");', f.formatCommand(new Command('storeTextPresent', 'test', 'abc')));
	assertEquals('sleep 1 until $sel->is_text_present("test");', f.formatCommand(new Command('waitForTextPresent', 'test')));
	assertEquals('sleep 1 while $sel->is_text_present("test");', f.formatCommand(new Command('waitForTextNotPresent', 'test')));
	assertEquals('$sel->text_is("abc[\\@id=\'\\$\'\]", "def");', f.formatCommand(new Command('assertText', 'abc[@id=\'$\']', 'def')));
	assertEquals('$sel->location_is("abc");', f.formatCommand(new Command('assertLocation', 'abc')));
	assertEquals('$sel->location_isnt("abc");', f.formatCommand(new Command('assertNotLocation', 'abc')));
	assertEquals('$def = $sel->get_text("abc");', f.formatCommand(new Command('storeText', 'abc', 'def')));
	assertEquals('sleep 1 until "def" eq $sel->get_text("abc");', f.formatCommand(new Command('waitForText', 'abc', 'def')));
	assertEquals('sleep 1 while "def" eq $sel->get_text("abc");', f.formatCommand(new Command('waitForNotText', 'abc', 'def')));
	assertEquals('$sel->open("http://www.google.com/");', f.formatCommand(new Command('open', 'http://www.google.com/')));
}

function testPythonRCFormat() {
	var format = this.formats.findFormat("python-rc");
	var f = format.getFormatter();
	assertEquals('self.failUnless(sel.is_text_present("hello"))', f.formatCommand(new Command('assertTextPresent', 'hello')));
	assertEquals('self.failIf(sel.is_text_present("hello"))', f.formatCommand(new Command('assertTextNotPresent', 'hello')));
	assertEquals('abc = sel.is_text_present("test")', f.formatCommand(new Command('storeTextPresent', 'test', 'abc')));
	assertEquals('while not sel.is_text_present("test"): time.sleep(1)', f.formatCommand(new Command('waitForTextPresent', 'test')));
	assertEquals('while sel.is_text_present("test"): time.sleep(1)', f.formatCommand(new Command('waitForTextNotPresent', 'test')));
	assertEquals('self.assertEqual("def", sel.get_text("abc"))', f.formatCommand(new Command('assertText', 'abc', 'def')));
	assertEquals('self.assertEqual("abc", sel.get_location())', f.formatCommand(new Command('assertLocation', 'abc')));
	assertEquals('self.assertNotEqual("abc", sel.get_location())', f.formatCommand(new Command('assertNotLocation', 'abc')));
	assertEquals('def = sel.get_text("abc")', f.formatCommand(new Command('storeText', 'abc', 'def')));
	assertEquals('while "def" != sel.get_text("abc"): time.sleep(1)', f.formatCommand(new Command('waitForText', 'abc', 'def')));
	assertEquals('while u"あいうえお" == sel.get_text("abc"): time.sleep(1)', f.formatCommand(new Command('waitForNotText', 'abc', 'あいうえお')));
	assertEquals('sel.open("http://www.google.com/")', f.formatCommand(new Command('open', 'http://www.google.com/')));
}

function testJavaRCFormat() {
	var format = this.formats.findFormat("java-rc");
	var f = format.getFormatter();
	assertEquals('assertTrue(selenium.isTextPresent("hello"));', f.formatCommand(new Command('assertTextPresent', 'hello')));
	assertEquals('assertFalse(selenium.isTextPresent("hello"));', f.formatCommand(new Command('assertTextNotPresent', 'hello')));
	assertEquals('boolean abc = selenium.isTextPresent("test");', f.formatCommand(new Command('storeTextPresent', 'test', 'abc')));
	assertEquals('while (!selenium.isTextPresent("test")) { Thread.sleep(1000); }', f.formatCommand(new Command('waitForTextPresent', 'test')));
	assertEquals('while (selenium.isTextPresent("test")) { Thread.sleep(1000); }', f.formatCommand(new Command('waitForTextNotPresent', 'test')));
	assertEquals('assertEquals("def", selenium.getText("abc"));', f.formatCommand(new Command('assertText', 'abc', 'def')));
	assertEquals('assertEquals("abc", selenium.getLocation());', f.formatCommand(new Command('assertLocation', 'abc')));
	assertEquals('assertNotEquals("abc", selenium.getLocation());', f.formatCommand(new Command('assertNotLocation', 'abc')));
	assertEquals('String def = selenium.getText("abc");', f.formatCommand(new Command('storeText', 'abc', 'def')));
	assertEquals('while (!"def".equals(selenium.getText("abc"))) { Thread.sleep(1000); }', f.formatCommand(new Command('waitForText', 'abc', 'def')));
	assertEquals('while ("def".equals(selenium.getText("abc"))) { Thread.sleep(1000); }', f.formatCommand(new Command('waitForNotText', 'abc', 'def')));
	assertEquals('selenium.open("http://www.google.com/");', f.formatCommand(new Command('open', 'http://www.google.com/')));
}

function testCSharpRCFormat() {
	var format = this.formats.findFormat("cs-rc");
	var f = format.getFormatter();
	assertEquals('Assert.IsTrue(selenium.IsTextPresent("hello"));', f.formatCommand(new Command('assertTextPresent', 'hello')));
	assertEquals('Assert.IsFalse(selenium.IsTextPresent("hello"));', f.formatCommand(new Command('assertTextNotPresent', 'hello')));
	assertEquals('Boolean abc = selenium.IsTextPresent("test");', f.formatCommand(new Command('storeTextPresent', 'test', 'abc')));
	assertEquals('while (!selenium.IsTextPresent("test")) { Thread.Sleep(1000); }', f.formatCommand(new Command('waitForTextPresent', 'test')));
	assertEquals('while (selenium.IsTextPresent("test")) { Thread.Sleep(1000); }', f.formatCommand(new Command('waitForTextNotPresent', 'test')));
	assertEquals('Assert.AreEqual("def", selenium.GetText("abc"));', f.formatCommand(new Command('assertText', 'abc', 'def')));
	assertEquals('Assert.AreEqual("abc", selenium.GetLocation());', f.formatCommand(new Command('assertLocation', 'abc')));
	assertEquals('Assert.AreNotEqual("abc", selenium.GetLocation());', f.formatCommand(new Command('assertNotLocation', 'abc')));
	assertEquals('String def = selenium.GetText("abc");', f.formatCommand(new Command('storeText', 'abc', 'def')));
	assertEquals('while ("def" != selenium.GetText("abc")) { Thread.Sleep(1000); }', f.formatCommand(new Command('waitForText', 'abc', 'def')));
	assertEquals('while ("def" == selenium.GetText("abc")) { Thread.Sleep(1000); }', f.formatCommand(new Command('waitForNotText', 'abc', 'def')));
	assertEquals('selenium.Open("http://www.google.com/");', f.formatCommand(new Command('open', 'http://www.google.com/')));
}
