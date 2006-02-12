function setUp() {
}

function testExactMatchPattern() {
	assertEquals("Selenium IDE", exactMatchPattern("Selenium IDE"));
	assertEquals("exact:OpenQA:Selenium IDE", exactMatchPattern("OpenQA:Selenium IDE"));
	assertEquals("exact:abc?", exactMatchPattern("abc?"));
	assertEquals("exact:ab*c", exactMatchPattern("ab*c"));
}
