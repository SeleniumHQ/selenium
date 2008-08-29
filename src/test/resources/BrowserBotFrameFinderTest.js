function BrowserBotFrameFinderTest(name) {
    TestCase.call(this,name);
}

BrowserBotFrameFinderTest.prototype = new TestCase();

BrowserBotFrameFinderTest.prototype.setUp = function() {
    var window = windowMaker();
    browserbot = BrowserBot.createForWindow(window);
    window.document.getElementById = function(id) {
        if (id == "testIframe-name") {
            return {
                id:"testIframe-name"
                ,name:"testIframe-name"
            }
        }
    };
}
BrowserBotFrameFinderTest.prototype.testShouldAbleToGetFirstLevelFrameAccordingNameGiven = function(){
    var frame = browserbot._getFrameFromGlobal("testIframe-name");
    assertEquals("testIframe-name", frame.name)
}
