function setUp() {
}

function testGetCommandIndexByTextIndex() {
	var formats = new FormatCollection(OPTIONS);
	var testCase = new TestCase();
	testCase.commands.push(new Command("open", "http://www.google.com/"));
	testCase.commands.push(new Command("click", "foo"));
	testCase.commands.push(new Command("assertText", "foo", "bar"));
	var format = formats.selectFormat("perl-rc");
	var source = format.getFormatter().format(testCase);

	assertEquals(0, testCase.getCommandIndexByTextIndex(source, source.indexOf("open"), format.getFormatter()));
	assertEquals(1, testCase.getCommandIndexByTextIndex(source, source.indexOf("click"), format.getFormatter()));
	assertEquals(2, testCase.getCommandIndexByTextIndex(source, source.indexOf("text_is"), format.getFormatter()));
	assertEquals(3, testCase.getCommandIndexByTextIndex(source, source.length, format.getFormatter()));

	// parse again
	var header = testCase.formatLocal("perl-rc").header;
	var headerLines = header.split(/\n/).length - 1;
	format.getFormatter().parse(testCase, source);
	// Now testCase.commands should consist of multiple Line objects
	assertEquals(headerLines, testCase.getCommandIndexByTextIndex(source, source.indexOf("open"), format.getFormatter()));
	assertEquals(headerLines + 1, testCase.getCommandIndexByTextIndex(source, source.indexOf("click"), format.getFormatter()));
}
