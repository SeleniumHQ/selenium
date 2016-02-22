// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

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
