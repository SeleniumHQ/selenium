function setUp() {
	this.finder = new LocatorFinder(window);
}

function testAttributeValue() {
	assertEquals("'abc'", this.finder.attributeValue('abc'));
	assertEquals("'ab\"c'", this.finder.attributeValue('ab"c'));
	assertEquals("\"ab'c\"", this.finder.attributeValue("ab'c"));
	assertEquals('concat(\'He said, "Don\',"\'t do that.",\'".\')', this.finder.attributeValue('He said, "Don\'t do that.".'));
}

function testAttributesXPathLocator() {
	var elements = document.getElementById("test1").getElementsByTagName("input");
	assertEquals("//input[@name='foo']", finder.findWith('attributesXPath', elements[0]));
	assertEquals("//input[@name='foo' and @value='bar' and @type='button' and @onclick=\"alert(\'test\')\"]", finder.findWith('attributesXPath', elements[1]));
	assertEquals("//input[@name='foo' and @value='bar' and @type='button' and @onclick=\'alert(\"test2\")\']", finder.findWith('attributesXPath', elements[2]));
	assertEquals("//input[@name='foo' and @value='bar' and @type='button' and @onclick=concat(\"alert('test3'\, \",'\"test4\")')]", finder.findWith('attributesXPath', elements[3]));
	assertNull(finder.findWith('attributesXPath', elements[4]));

	var yahoo = document.getElementById("test2").getElementsByTagName("a")[1];
	assertNull(finder.findWith('attributesXPath', yahoo));
}

function testHrefXPathLocator() {
	var yahoo = document.getElementById("test2").getElementsByTagName("a")[1];
	assertLocator("//a[@href='http://www.yahoo.com/']", finder.findWith('hrefXPath', yahoo), yahoo);
	var pathToTest = document.getElementById("test2").getElementsByTagName("a")[3];
	assertLocator("//a[contains(@href, '/path/to/test.html')]", finder.findWith('hrefXPath', pathToTest), pathToTest);
}

function testPositionXPathLocator() {
	var elements = document.getElementById("test1").getElementsByTagName("input");
	assertEquals('//input[1]', finder.findWith('positionXPath', elements[0]));
	assertEquals('//input[2]', finder.findWith('positionXPath', elements[1]));
	assertEquals('//input[3]', finder.findWith('positionXPath', elements[2]));
	
	var yahoo = document.getElementById("test2").getElementsByTagName("a")[1];
	assertNotNull(yahoo);
	assertEquals('//div[2]/a', finder.findWith('positionXPath', yahoo));
}

function testLinkXPathLocator() {
	var yahoo = document.getElementById("test2").getElementsByTagName("a")[1];
	assertLocator("//a[contains(text(),'Yahoo')]", finder.findWith('linkXPath', yahoo), yahoo);
	var yahoo2 = document.getElementById("test2").getElementsByTagName("a")[2];
	assertLocator("//a[img/@alt='test']", finder.findWith('linkXPath', yahoo2), yahoo2);
}

function testLinkLocator() {
	var google = document.getElementById("test2").getElementsByTagName("a")[0];
	assertLocator("link=exact:Google:Google", finder.findWith('link', google), google);
	var yahoo = document.getElementById("test2").getElementsByTagName("a")[1];
	assertLocator("link=Yahoo", finder.findWith('link', yahoo), yahoo);
	var yahooJP = document.getElementById("test2").getElementsByTagName("a")[4];
	assertLocator("link=Yahoo Japan", finder.findWith('link', yahooJP), yahooJP);
}

function assertLocator(expected, locator, element) {
	assertEquals(expected, locator);
	assertEquals(finder.pageBot().findElement(locator), element);
}
