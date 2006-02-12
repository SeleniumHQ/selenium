function setUp() {
	this.eventManager = new EventManager(this);
}

function testAttributeValue() {
	assertEquals("'abc'", this.eventManager.attributeValue('abc'));
	assertEquals("'ab\"c'", this.eventManager.attributeValue('ab"c'));
	assertEquals("\"ab'c\"", this.eventManager.attributeValue("ab'c"));
	assertEquals('concat(\'He said, "Don\',"\'t do that.",\'".\')', this.eventManager.attributeValue('He said, "Don\'t do that.".'));
}

function testAttributesXPathLocator() {
	var elements = document.getElementById("test1").getElementsByTagName("input");
	var pageBot = eventManager.getPageBot(window);
	assertEquals("//input[@name='foo']", eventManager.getAttributesXPathLocator(elements[0], pageBot));
	assertEquals("//input[@name='foo' and @value='bar' and @type='button' and @onclick=\"alert(\'test\')\"]", eventManager.getAttributesXPathLocator(elements[1], pageBot));
	assertEquals("//input[@name='foo' and @value='bar' and @type='button' and @onclick=\'alert(\"test2\")\']", eventManager.getAttributesXPathLocator(elements[2], pageBot));
	assertEquals("//input[@name='foo' and @value='bar' and @type='button' and @onclick=concat(\"alert('test3'\, \",'\"test4\")')]", eventManager.getAttributesXPathLocator(elements[3], pageBot));
	assertNull(eventManager.getAttributesXPathLocator(elements[4], pageBot));
}

function testPositionXPathLocator() {
	var elements = document.getElementById("test1").getElementsByTagName("input");
	var pageBot = eventManager.getPageBot(window);
	assertEquals('//input[1]', eventManager.getPositionXPathLocator(elements[0], pageBot));
	assertEquals('//input[2]', eventManager.getPositionXPathLocator(elements[1], pageBot));
	assertEquals('//input[3]', eventManager.getPositionXPathLocator(elements[2], pageBot));
	
	var yahoo = document.getElementById("test2").getElementsByTagName("a")[1];
	assertNotNull(yahoo);
	assertEquals('//div[2]/a', eventManager.getPositionXPathLocator(yahoo, pageBot));
}

function testLinkXPathLocator() {
	var yahoo = document.getElementById("test2").getElementsByTagName("a")[1];
	assertLocator("//a[contains(text(),'Yahoo')]", eventManager.getLinkXPathLocator(yahoo, pageBot), yahoo);
	var yahoo2 = document.getElementById("test2").getElementsByTagName("a")[2];
	assertLocator("//a[img/@alt='test']", eventManager.getLinkXPathLocator(yahoo2, pageBot), yahoo2);
}

function testLinkLocator() {
	var google = document.getElementById("test2").getElementsByTagName("a")[0];
	assertLocator("link=exact:Google:Google", eventManager.getLinkLocator(google, pageBot), google);
	var yahoo = document.getElementById("test2").getElementsByTagName("a")[1];
	assertLocator("link=Yahoo", eventManager.getLinkLocator(yahoo, pageBot), yahoo);
}

function assertLocator(expected, locator, element) {
	assertEquals(expected, locator);
	assertEquals(pageBot.findElement(locator), element);
}

function loadPageBot() {
	this.pageBot = PageBot.createForWindow(window);
}

