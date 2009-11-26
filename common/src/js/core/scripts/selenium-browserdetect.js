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

    if (navigator.userAgent.indexOf('Mac OS X') != -1) {
        this.isOSX = true;
    }

    if (navigator.userAgent.indexOf('Windows NT 6') != -1) {
        this.isVista = true;
    }

    if (window.opera != null) {
        this.browser = BrowserVersion.OPERA;
        this.isOpera = true;
        return;
    }
    
    var _getQueryParameter = function(searchKey) {
        var str = location.search.substr(1);
        if (str == null) return null;
        var clauses = str.split('&');
        for (var i = 0; i < clauses.length; i++) {
            var keyValuePair = clauses[i].split('=', 2);
            var key = unescape(keyValuePair[0]);
            if (key == searchKey) {
                return unescape(keyValuePair[1]);
            }
        }
        return null;
    };
    
    var self = this;
    
    var checkChrome = function() {
        var loc = window.document.location.href;
        try {
            loc = window.top.document.location.href;
            if (/^chrome:\/\//.test(loc)) {
                self.isChrome = true;
            } else {
                self.isChrome = false;
            }
        } catch (e) {
            // can't see the top (that means we might be chrome, but it's impossible to be sure)
            self.isChromeDetectable = "no, top location couldn't be read in this window";
            if (_getQueryParameter('thisIsChrome')) {
                self.isChrome = true;
            } else {
                self.isChrome = false;
            }
        }
        
        
    }
    
    

    if (this.name == "Microsoft Internet Explorer") {
        this.browser = BrowserVersion.IE;
        this.isIE = true;
        try {
            if (window.top.SeleniumHTARunner && window.top.document.location.pathname.match(/.hta$/i)) {
                this.isHTA = true;
            }
        } catch (e) {
            this.isHTADetectable = "no, top location couldn't be read in this window";
            if (_getQueryParameter('thisIsHTA')) {
                self.isHTA = true;
            } else {
                self.isHTA = false;
            }
        }
        if (navigator.appVersion.match(/MSIE 6.0/)) {
        	this.isIE6 = true;
        }
        if ("0" == navigator.appMinorVersion) {
            this.preSV1 = true;
            if (this.isIE6) {
            	this.appearsToBeBrokenInitialIE6 = true;
            }
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
