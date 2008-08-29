function CookieTest(name) {
    TestCase.call(this,name);
}

CookieTest.prototype = new TestCase();
CookieTest.prototype.setUp = function() {
    var mockWindow = new String('mockWindow');
    mockWindow.closed = false;
    this.browserBot = new MozillaBrowserBot(mockWindow);
    this.browserBot.getCurrentWindow = function() { return this.currentWindow; }

    this.browserBot.currentWindowName = 'originalWindowName';
    this.browserBot.currentPage = 'originalPage';
    this.browserBot.testCookies = [];
    this.browserBot._maybeDeleteCookie = function(cookieName, domain, path) {
        for (var i = 0; i < this.testCookies.length; i++) {
            var testCookie = this.testCookies[i];
            if (!testCookie) continue;
            if (cookieName == testCookie.name && path == testCookie.path && domain == testCookie.domain) {
                this.testCookies[i] = null;
                return true;
            }
        }
        return false;
    }
}

CookieTest.prototype.testRecursivelyDeleteCookie = function() {
    this.browserBot.testCookies = ([{name:"foo", path:"/bar", domain:"foo.com", value:"blah"}]);
    this.browserBot.recursivelyDeleteCookie("foo", "my.domain.at.foo.com", "/bar/razzle/dazzle");
}

CookieTest.prototype.testRecursivelyDeleteCookieLeadingDot = function() {
    this.browserBot.testCookies = ([{name:"foo", path:"/bar", domain:".foo.com", value:"blah"}]);
    this.browserBot.recursivelyDeleteCookie("foo", "my.domain.at.foo.com", "/bar/razzle/dazzle");
}

CookieTest.prototype.testRecursivelyDeleteCookieLeadingDotMissing = function() {
    this.browserBot.testCookies = ([{name:"foo", path:"/bar", domain:".foo.com", value:"blah"}]);
    this.browserBot.recursivelyDeleteCookie("foo", "foo.com", "/bar/razzle/dazzle");
}

CookieTest.prototype.testRecursivelyDeleteCookieNullDomain = function() {
    this.browserBot.testCookies = ([{name:"foo", path:"/bar", domain:null, value:"blah"}]);
    this.browserBot.recursivelyDeleteCookie("foo", "foo.com", "/bar/razzle/dazzle");
}

CookieTest.prototype.testRecursivelyDeleteCookieNullPath = function() {
    this.browserBot.testCookies = ([{name:"foo", path:null, domain:"foo.com", value:"blah"}]);
    this.browserBot.recursivelyDeleteCookie("foo", "my.domain.at.foo.com", "/bar/razzle/dazzle");
}

CookieTest.prototype.testRecursivelyDeleteCookieNullPathAndDomain = function() {
    this.browserBot.testCookies = ([{name:"foo", path:null, domain:null, value:"blah"}]);
    this.browserBot.recursivelyDeleteCookie("foo", "my.domain.at.foo.com", "/bar/razzle/dazzle");
}

CookieTest.prototype.testRecursivelyDeleteCookieTrailingSlash = function() {
    this.browserBot.testCookies = ([{name:"foo", path:"/bar/", domain:".foo.com", value:"blah"}]);
    this.browserBot.recursivelyDeleteCookie("foo", "my.domain.at.foo.com", "/bar/razzle/dazzle");
}

CookieTest.prototype.testRecursivelyDeleteCookieRootPath = function() {
    this.browserBot.testCookies = ([{name:"foo", path:"/", domain:".foo.com", value:"blah"}]);
    this.browserBot.recursivelyDeleteCookie("foo", "my.domain.at.foo.com", "/bar/razzle/dazzle");
}

CookieTest.prototype.testRecursivelyDeleteCookieWrongDomain = function() {
    this.browserBot.testCookies = ([{name:"foo", path:"/", domain:".foo.com", value:"blah"}]);
    try {
        this.browserBot.recursivelyDeleteCookie("foo", "my.domain.at.bar.com", "/bar/razzle/dazzle");
        this.fail("shouldn't have deleted cookie at wrong domain");
    } catch (e) {} // as expected
}

CookieTest.prototype.testRecursivelyDeleteCookieWrongPath = function() {
    this.browserBot.testCookies = ([{name:"foo", path:"/foo", domain:".foo.com", value:"blah"}]);
    try {
        this.browserBot.recursivelyDeleteCookie("foo", "my.domain.at.foo.com", "/bar/razzle/dazzle");
        this.fail("shouldn't have deleted cookie with wrong path");
    } catch (e) {} // as expected
}
