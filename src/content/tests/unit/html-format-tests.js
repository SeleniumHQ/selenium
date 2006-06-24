function setUp() {
	this.log = new Log("format");
	options.escapeXmlEntities = "html";
}

function testDecodeTextWithHtmlFormat() {
	assertEquals("abc", decodeText("abc"));

	assertEquals("' '", decodeText("'&#xA0;'"));
	assertEquals("' '", decodeText("'&#160;'"));
	assertEquals("' '", decodeText("'&nbsp;'"));

	assertEquals("'abc'", decodeText("'abc'"));
	assertEquals("&amp;", decodeText("&amp;amp;"));
	assertEquals("a=b&c=d", decodeText("a=b&c=d"));
	assertEquals("&foobar;", decodeText("&foobar;"));
}

function testEncodeTextWithHtmlFormat() {
	assertEquals("&nbsp;", encodeText("\xA0"));
	assertEquals(" ", encodeText(" "));
	assertEquals("&nbsp;&nbsp;", encodeText("  "));
	assertEquals("'abc'", encodeText("'abc'"));
	assertEquals("&amp;amp;", encodeText("&amp;"));
	assertEquals("a=b&c=d", encodeText("a=b&c=d"));
	assertEquals("&foobar;", encodeText("&foobar;"));
}

function testParse() {
	var source = FileUtils.readURL("chrome://selenium-ide/content/tests/unit/html/TestWaitInPopupWindow.html");
	var testCase = new TestCase();
	parse(testCase, source);
	var commands = testCase.commands;
	assertEquals(" open command ", commands.shift().comment);
	assertEquals("open", commands.shift().command);
	assertEquals("click", commands.shift().command);
	assertEquals(" waitForPopUp command ", commands.shift().comment);
	assertEquals("waitForPopUp", commands.shift().command);
	assertEquals("selectWindow", commands.shift().command);
	assertEquals("verifyTitle", commands.shift().command);
	assertEquals("setTimeout", commands.shift().command);
	assertEquals("clickAndWait", commands.shift().command);
	assertEquals("verifyTitle", commands.shift().command);
	assertEquals("setTimeout", commands.shift().command);
	assertEquals("clickAndWait", commands.shift().command);
	assertEquals("verifyTitle", commands.shift().command);
	assertEquals("close", commands.shift().command);
	assertEquals("selectWindow", commands.shift().command);
	assertEquals(0, commands.length);
}
