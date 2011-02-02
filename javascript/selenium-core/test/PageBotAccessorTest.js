function PageBotAccessorTest(name) {
    TestCase.call(this,name);
}

PageBotAccessorTest.prototype = new TestCase();
PageBotAccessorTest.prototype.setUp = function() {
    this.testWindow = windowMaker();
    var element = function(id, type) {
        this.id = id;
        this.type = type;
    }
    var elements = {
        a: [new element("myLink"), new element("myOtherLink"), new element("yetAnotherLink")]
        ,input: [
            new element("theTextbox", "text")
            ,new element("theOtherTextbox", "text")
            ,new element("theButton", "button")
            ,new element("theSubmit", "submit")
        ]
    }
    this.testWindow.document.getElementsByTagName = function(tagName) {
        return elements[tagName];
    }
        
    this.pageBot = BrowserBot.createForWindow(this.testWindow);
}

PageBotAccessorTest.prototype.testGetButtonsReturnsBothButtons = function() {
    var result = this.pageBot.getAllButtons();
    this.assertArrayEquals(["theButton","theSubmit"], result);
}

PageBotAccessorTest.prototype.testGetLinksReturnsLinks = function() {
    var result = this.pageBot.getAllLinks();
    this.assertArrayEquals(["myLink","myOtherLink","yetAnotherLink"], result);
}

PageBotAccessorTest.prototype.testGetFieldsReturnsFields = function() {
    var result = this.pageBot.getAllFields();
    this.assertArrayEquals(["theTextbox","theOtherTextbox"], result);
}

PageBotAccessorTest.prototype.assertArrayEquals = function(arr1, arr2) {
    this.assertEquals(arr1.length, arr2.length);
    for (var i = 0; i < arr1.length; i++) {
        this.assertEquals(arr1[i], arr2[i]);
    }
}