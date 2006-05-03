/*
 * Copyright 2005 Shinya Kasatani
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function LocatorFinder(window) {
	this.window = window;
	this.log = new Log("LocatorFinder");
}

LocatorFinder.prototype.pageBot = function() {
	var pageBot = this.window._locator_pageBot;
	if (pageBot == null) {
		pageBot = PageBot.createForWindow(this.window);
		this.window._locator_pageBot = pageBot;
	}
	return pageBot;
}

LocatorFinder.prototype.findWith = function(name, e) {
	return LocatorFinder.finderMap[name].call(this, e);
}

LocatorFinder.prototype.find = function(e) {
	var i = 0;
	var xpathLevel = 0;
	var maxLevel = 10;
	var locator;
	this.log.debug("getLocator for element " + e);
	
	for (var i = 0; i < LocatorFinder.finderNames.length; i++) {
		locator = this.findWith(LocatorFinder.finderNames[i], e);
		if (locator) {
			this.log.debug("locator=" + locator);
			// test the locator
			try {
				if (e == this.pageBot().findElement(locator)) {
					return locator;
				}
			} catch (error) {
				this.log.warn("findElement error: " + error + ", node=" + e + ", locator=" + locator);
			}
		}
	}
	return "LOCATOR_DETECTION_FAILED";
}

/*
 * Class methods
 */

LocatorFinder.finderNames = [];
LocatorFinder.finderMap = {};

LocatorFinder.addFinder = function(name, finder) {
	this.finderNames.push(name);
	this.finderMap[name] = finder;
}
