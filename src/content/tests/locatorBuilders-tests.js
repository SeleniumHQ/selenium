function setUp() {
	this.builders = new LocatorBuilders(window);
}

function testAttributeValue() {
	assertEquals("'abc'", this.builders.attributeValue('abc'));
	assertEquals("'ab\"c'", this.builders.attributeValue('ab"c'));
	assertEquals("\"ab'c\"", this.builders.attributeValue("ab'c"));
	assertEquals('concat(\'He said, "Don\',"\'t do that.",\'".\')', this.builders.attributeValue('He said, "Don\'t do that.".'));
}

function testAttributesXPathLocator() {
	var elements = document.getElementById("test1").getElementsByTagName("input");
	assertEquals("//input[@name='foo']", builders.buildWith('attributesXPath', elements[0]));
	assertEquals("//input[@name='foo' and @value='bar' and @type='button' and @onclick=\"alert(\'test\')\"]", builders.buildWith('attributesXPath', elements[1]));
	assertEquals("//input[@name='foo' and @value='bar' and @type='button' and @onclick=\'alert(\"test2\")\']", builders.buildWith('attributesXPath', elements[2]));
	assertEquals("//input[@name='foo' and @value='bar' and @type='button' and @onclick=concat(\"alert('test3'\, \",'\"test4\")')]", builders.buildWith('attributesXPath', elements[3]));
	assertNull(builders.buildWith('attributesXPath', elements[4]));

	var yahoo = document.getElementById("test2").getElementsByTagName("a")[1];
	assertNull(builders.buildWith('attributesXPath', yahoo));
}

function testHrefXPathLocator() {
	var yahoo = document.getElementById("test2").getElementsByTagName("a")[1];
	assertLocator("//a[@href='http://www.yahoo.com/']", builders.buildWith('hrefXPath', yahoo), yahoo);
	var pathToTest = document.getElementById("test2").getElementsByTagName("a")[3];
	assertLocator("//a[contains(@href, '/path/to/test.html')]", builders.buildWith('hrefXPath', pathToTest), pathToTest);
}

function testPositionXPathLocator() {
	var elements = document.getElementById("test1").getElementsByTagName("input");
	assertEquals('//input[1]', builders.buildWith('positionXPath', elements[0]));
	assertEquals('//input[2]', builders.buildWith('positionXPath', elements[1]));
	assertEquals('//input[3]', builders.buildWith('positionXPath', elements[2]));
	
	var yahoo = document.getElementById("test2").getElementsByTagName("a")[1];
	assertNotNull(yahoo);
	assertEquals('//div[2]/a', builders.buildWith('positionXPath', yahoo));
}

function testLinkXPathLocator() {
	var yahoo = document.getElementById("test2").getElementsByTagName("a")[1];
	assertLocator("//a[contains(text(),'Yahoo')]", builders.buildWith('linkXPath', yahoo), yahoo);
	var yahoo2 = document.getElementById("test2").getElementsByTagName("a")[2];
	assertLocator("//a[img/@alt='test']", builders.buildWith('linkXPath', yahoo2), yahoo2);
}

function testLinkLocator() {
	var google = document.getElementById("test2").getElementsByTagName("a")[0];
	assertLocator("link=exact:Google:Google", builders.buildWith('link', google), google);
	var yahoo = document.getElementById("test2").getElementsByTagName("a")[1];
	assertLocator("link=Yahoo", builders.buildWith('link', yahoo), yahoo);
	var yahooJP = document.getElementById("test2").getElementsByTagName("a")[4];
	assertLocator("link=Yahoo Japan", builders.buildWith('link', yahooJP), yahooJP);
}

function assertLocator(expected, locator, element) {
	assertEquals(expected, locator);
	assertEquals(builders.pageBot().findElement(locator), element);
}
