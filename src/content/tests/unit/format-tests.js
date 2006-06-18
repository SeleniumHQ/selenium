this.seleniumAPI = {};
const subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium/scripts/selenium-api.js', this.seleniumAPI);
var parser = new DOMParser();
Command.apiDocument = parser.parseFromString(FileUtils.readURL("chrome://selenium-ide/content/selenium/iedoc.xml"), "text/xml");

Command.prototype.getAPI = function() {
	return seleniumAPI;
}

function setUp() {
	this.formats = new FormatCollection({});
	this.commands = [];
	this.commands.push(new Command('assertTextPresent', 'hello'));
	this.commands.push(new Command('assertTextNotPresent', 'hello'));
	this.commands.push(new Command('storeTextPresent', 'test', 'abc'));
	this.commands.push(new Command('waitForTextPresent', 'test'));
	this.commands.push(new Command('waitForTextNotPresent', 'test'));
	this.commands.push(new Command('assertText', 'abc', 'def'));
	this.commands.push(new Command('assertLocation', 'abc'));
	this.commands.push(new Command('assertNotLocation', 'abc'));
	this.commands.push(new Command('type', "theText", "javascript{'abc'}"));
	this.commands.push(new Command('assertSelectOptions', "theSelect", ",abc,ab\\,c"));
	this.commands.push(new Command('assertNotLocation', 'abc'));
	this.commands.push(new Command('storeText', 'abc', 'def'));
	this.commands.push(new Command('waitForText', 'abc', 'def'));
	this.commands.push(new Command('waitForNotValue', 'abc', 'regexp:abc'));
	this.commands.push(new Command('waitForNotText', 'abc', 'def'));
	this.commands.push(new Command('open', 'http://www.google.com/'));
	this.commands.push(new Command('waitForPageToLoad', '30000'));
	this.commands.push(new Command('pause', '1000'));
	this.commands.push(new Comment("line 1\nline 2"));
}

function nextCommand() {
	return this.formatter.formatCommand(this.commands.shift());
}

function testRubyRCFormat() {
	var format = this.formats.findFormat("ruby-rc");
	var f = format.getFormatter();
	this.formatter = f;
	assertEquals('assert @selenium.is_text_present("hello")', nextCommand());
	assertEquals('assert !@selenium.is_text_present("hello")', nextCommand());
	assertEquals('abc = @selenium.is_text_present("test")', nextCommand());
	assertEquals('assert !60.times{|i| break if (@selenium.is_text_present("test") rescue false); sleep 1}', nextCommand());
	assertEquals('assert !60.times{|i| break unless (@selenium.is_text_present("test") rescue true); sleep 1}', nextCommand());
	assertEquals('assert_equal "def", @selenium.get_text("abc")', nextCommand());
	assertEquals('assert_equal "abc", @selenium.get_location', nextCommand());
	assertEquals('assert_not_equal "abc", @selenium.get_location', nextCommand());
	assertEquals('@selenium.type "theText", @selenium.get_eval("\'abc\'")', nextCommand());
	assertEquals('assert_equal ["", "abc", "ab,c"], @selenium.get_select_options("theSelect")', nextCommand());
	assertEquals('assert_not_equal "abc", @selenium.get_location', nextCommand());
	assertEquals('def = @selenium.get_text("abc")', nextCommand());
	assertEquals('assert !60.times{|i| break if ("def" == @selenium.get_text("abc") rescue false); sleep 1}', nextCommand());
	assertEquals('assert !60.times{|i| break unless ("regexp:abc" == @selenium.get_value("abc") rescue true); sleep 1}', nextCommand());
	assertEquals('assert !60.times{|i| break unless ("def" == @selenium.get_text("abc") rescue true); sleep 1}', nextCommand());
	assertEquals('@selenium.open "http://www.google.com/"', nextCommand());
	assertEquals('@selenium.wait_for_page_to_load "30000"', nextCommand());
	assertEquals('sleep 1', nextCommand());
	assertEquals("# line 1\n# line 2", f.formatComment(this.commands.shift()));
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
	assertEquals('$sel->open_ok("http://www.google.com/");', f.formatCommand(new Command('open', 'http://www.google.com/')));
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
	this.formatter = f;
	assertEquals('assertTrue(selenium.isTextPresent("hello"));', nextCommand());
	assertEquals('assertFalse(selenium.isTextPresent("hello"));', nextCommand());
	assertEquals('boolean abc = selenium.isTextPresent("test");', nextCommand());
	assertTrue(nextCommand().indexOf('if (selenium.isTextPresent("test")) break; }') >= 0);
	assertTrue(nextCommand().indexOf('if (!selenium.isTextPresent("test")) break; }') >= 0);
	assertEquals('assertEquals("def", selenium.getText("abc"));', nextCommand());
	assertEquals('assertEquals("abc", selenium.getLocation());', nextCommand());
	assertEquals('assertNotEquals("abc", selenium.getLocation());', nextCommand());
	assertEquals('selenium.type("theText", selenium.getEval("\'abc\'"));', nextCommand());
	assertEquals('assertEquals(new String[] {"", "abc", "ab,c"}, selenium.getSelectOptions("theSelect"));', nextCommand());
	assertEquals('assertNotEquals("abc", selenium.getLocation());', nextCommand());
	assertEquals('String def = selenium.getText("abc");', nextCommand());
	assertTrue(nextCommand().indexOf('if ("def".equals(selenium.getText("abc"))) break; }') >= 0);
	assertTrue(nextCommand().indexOf('if (!seleniumEquals("regexp:abc", selenium.getValue("abc"))) break; }') >= 0);
	assertTrue(nextCommand().indexOf('if (!"def".equals(selenium.getText("abc"))) break; }') >= 0);
	assertEquals('selenium.open("http://www.google.com/");', nextCommand());
	assertEquals('selenium.waitForPageToLoad("30000");', nextCommand());
	assertEquals('Thread.sleep(1000);', nextCommand());
	assertEquals("// line 1\n// line 2", f.formatComment(this.commands.shift()));
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
