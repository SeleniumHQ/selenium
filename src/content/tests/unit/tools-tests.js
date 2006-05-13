function setUp() {
}

function testLineReader() {
	var reader = new LineReader("Good morning\r\nGood afternoon\nGood evening\rGood night");
	assertEquals("Good morning", reader.read());
	assertEquals("Good afternoon", reader.read());
	assertEquals("Good evening", reader.read());
	assertEquals("Good night", reader.read());
	assertNull(reader.read());
}

function testUnderscore() {
	assertEquals('click_and_wait', StringUtils.underscore('clickAndWait'));
}
