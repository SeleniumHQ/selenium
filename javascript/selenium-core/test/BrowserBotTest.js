function BrowserBotTest(name) {
    TestCase.call(this,name);
}

BrowserBotTest.prototype = new TestCase();
BrowserBotTest.prototype.setUp = function() {
    mockWindow = new String('mockWindow');
    mockWindow.closed = false;
    browserBot = new MozillaBrowserBot(mockWindow);

    browserBot.currentWindowName = 'originalWindowName';
    browserBot.currentPage = 'originalPage';
}

BrowserBotTest.prototype.testCurrentWindowNameIsSetToNullWhenSelectWindowIsCalledWithNull = function() {
    browserBot.selectWindow('null');

    this.assertNull(browserBot.currentWindowName);
}

BrowserBotTest.prototype.testCurrentWindowIsSetWhenSelectWindowIsCalledWithNonNull = function() {
    // Make sure new window can be found
    mockWindow.windowName = new String('anotherWindow');

    browserBot.selectWindow('windowName');

    this.assertEquals('windowName', browserBot.currentWindowName);
}

BrowserBotTest.prototype.testExceptionWhenSelectWindowIsCalledWithUnknownWindowName = function() {
    try {
        browserBot.selectWindow('notAwindow');
        fail("Should have thrown exception");
    }
    catch (e) {
        this.assertEquals("Could not find window with title notAwindow", e.message);
    }
}

BrowserBotTest.prototype.testFrameSrcIsSetOnOpenLocationWhenThereIsNoCurrentWindow = function() {
    browserBot.currentWindowName = null;
    var mockLocation = {
        href:""
    };
    mockWindow.location = mockLocation;
    var mockDocument = new Object();
    mockWindow.document = mockDocument;
    mockWindow.document.location = mockLocation;
    browserBot.baseUrl = "http://x";
    browserBot.openLocation('myNewLocation');

    this.assertEquals('http://x/myNewLocation', mockWindow.location.href);
}

BrowserBotTest.prototype.testCurrentPageIsLazyCreatedBasedOnContentWindowWhenCurrentWindowNameIsNull = function() {
    browserBot.currentWindowName = null;
    browserBot.currentPage = null;

    var mockLocation = new Mock();
    mockLocation.expectsProperty('pathname').returns('thelocation');

    mockWindow.location = mockLocation;
    var mockDocument = new Object();
    mockWindow.document = mockDocument;
    mockWindow.document.location = mockLocation;
    mockWindow.addEventListener = function(){};
    mockWindow.attachEvent = function(){};

    var pageBot = browserBot.getCurrentPage();

    this.assertEquals(mockWindow, pageBot.getCurrentWindow());
    this.assertEquals(mockDocument, pageBot.getDocument());

    mockLocation.verify();
}

BrowserBotTest.prototype.testCurrentPageIsLazyCreatedBasedOnNamedWindowWhenCurrentWindowNameIsSet = function() {
    browserBot.currentPage = null;

    var mockLocation = new Mock();
    mockLocation.expectsProperty('pathname').returns('thelocation');

    mockWindow.location = mockLocation;
    var mockDocument = new Object();
    mockWindow.document = mockDocument;
    mockWindow.document.location = mockLocation;
    mockWindow.addEventListener = function(){};
    mockWindow.attachEvent = function(){};

    var pageBot = browserBot.getCurrentPage();
    this.assertEquals(mockWindow, pageBot.getCurrentWindow());

    mockLocation.verify();
}

BrowserBotTest.prototype.testSelectedWindowIsUsedToFindElement = function() {
    mockDocument = new Object();
    mockWindow.document = mockDocument;
    mockWindow.frames = [];
    
    var originalFindElementBy = browserBot.findElementBy;
    var original_ModifyWindow = browserBot._modifyWindow;
    var self = this;
    browserBot.findElementBy = function(locatorType, locator, inDocument, inWindow) {
        self.assertEquals(mockWindow.document, inDocument);
        return 'someElement';
    };
    browserBot._modifyWindow = function() {};
    browserBot.openedWindows['someName'] = mockWindow;
    
    browserBot.selectWindow('someName');
    this.assertEquals('someElement', browserBot.findElement('someLocator'));
    
    browserBot.findElementBy = originalFindElementBy;
    browserBot._modifyWindow = original_ModifyWindow;
}

