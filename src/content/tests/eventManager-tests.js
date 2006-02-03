function setUp() {
	this.eventManager = new EventManager(this);
}

function testAttributesXPathLocator() {
	var elements = document.getElementById("test1").getElementsByTagName("input");
	var pageBot = eventManager.getPageBot(window);
	assertEquals("//input[@name='foo']", eventManager.getAttributesXPathLocator(elements[0], pageBot));
	assertEquals("//input[@name='foo' and @value='bar' and @type='button' and @onclick='alert()']", eventManager.getAttributesXPathLocator(elements[1], pageBot));
	assertNull(eventManager.getAttributesXPathLocator(elements[2], pageBot));
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
	assertEquals("//a[contains(text(),'Yahoo')]", eventManager.getLinkXPathLocator(yahoo, pageBot));
	var yahoo2 = document.getElementById("test2").getElementsByTagName("a")[2];
	assertEquals("//a[img/@alt='test']", eventManager.getLinkXPathLocator(yahoo2, pageBot));
}

function loadPageBot() {
	this.pageBot = PageBot.createForWindow(window);
}

