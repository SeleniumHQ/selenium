/*
 * Copyright 2004 ThoughtWorks, Inc
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

// Although it's generally better web development practice not to use
// browser-detection (feature detection is better), the subtle browser
// differences that Selenium has to work around seem to make it
// necessary. Maybe as we learn more about what we need, we can do this in
// a more "feature-centric" rather than "browser-centric" way.

var BrowserVersion = function() {
    this.name = navigator.appName;

    if (window.opera != null) {
        this.browser = BrowserVersion.OPERA;
        this.isOpera = true;
        return;
    }
    
    var self = this;
    
    var checkChrome = function() {
        var loc = window.document.location.href;
        try {
            loc = window.top.document.location.href;
        } catch (e) {
            // can't see the top (that means we might be chrome, but it's impossible to be sure)
            self.isChromeDetectable = "no, top location couldn't be read in this window";
        }
        
        if (/^chrome:\/\//.test(loc)) {
            self.isChrome = true;
        } else {
            self.isChrome = false;
        }
    }

    if (this.name == "Microsoft Internet Explorer") {
        this.browser = BrowserVersion.IE;
        this.isIE = true;
        if (window.top.SeleniumHTARunner && window.top.document.location.pathname.match(/.hta$/i)) {
            this.isHTA = true;
        }
        if ("0" == navigator.appMinorVersion) {
            this.preSV1 = true;
        }
        return;
    }

    if (navigator.userAgent.indexOf('Safari') != -1) {
        this.browser = BrowserVersion.SAFARI;
        this.isSafari = true;
        this.khtml = true;
        return;
    }

    if (navigator.userAgent.indexOf('Konqueror') != -1) {
        this.browser = BrowserVersion.KONQUEROR;
        this.isKonqueror = true;
        this.khtml = true;
        return;
    }

    if (navigator.userAgent.indexOf('Firefox') != -1) {
        this.browser = BrowserVersion.FIREFOX;
        this.isFirefox = true;
        this.isGecko = true;
        var result = /.*Firefox\/([\d\.]+).*/.exec(navigator.userAgent);
        if (result) {
            this.firefoxVersion = result[1];
        }
        checkChrome();
        return;
    }

    if (navigator.userAgent.indexOf('Gecko') != -1) {
        this.browser = BrowserVersion.MOZILLA;
        this.isMozilla = true;
        this.isGecko = true;
        checkChrome();
        return;
    }

    this.browser = BrowserVersion.UNKNOWN;
}

BrowserVersion.OPERA = "Opera";
BrowserVersion.IE = "IE";
BrowserVersion.KONQUEROR = "Konqueror";
BrowserVersion.SAFARI = "Safari";
BrowserVersion.FIREFOX = "Firefox";
BrowserVersion.MOZILLA = "Mozilla";
BrowserVersion.UNKNOWN = "Unknown";

var browserVersion = new BrowserVersion();
