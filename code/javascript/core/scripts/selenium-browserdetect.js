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

// Although it's generally better web development practice not to use browser-detection
// (feature detection is better), the subtle browser differences that Selenium has to
// work around seem to make it necessary. Maybe as we learn more about what we need,
// we can do this in a more "feature-centric" rather than "browser-centric" way.
// TODO we should probably reuse an available browser-detection library
var browserName=navigator.appName;
var isOpera = (window.opera != null);
var isIE = !isOpera && (browserName =="Microsoft Internet Explorer");
var isKonqueror = (browserName == "Konqueror");
var isSafari = (navigator.userAgent.indexOf('Safari') != -1);
var isFirefox = (navigator.userAgent.indexOf('Firefox') != -1);
var isNetscape = !isOpera && !isFirefox && (navigator.appName == "Netscape");

// Get the Gecko version as an 8 digit date.
var geckoResult = /^Mozilla\/5\.0 .*Gecko\/(\d{8}).*$/.exec(navigator.userAgent);
var geckoVersion = geckoResult == null ? null : geckoResult[1];