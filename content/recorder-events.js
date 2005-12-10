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

//
// event registration on browser window
//

function EventManager(listener) {
	this.listener = listener;
	var log = new Log("EventManager");
	var self = this;

	this.startForAllBrowsers = function() {
		forEachBrowser(new RegisterHandler());
	}

	this.startForContentWindow = function(contentWindow) {
		forEachInput(new RegisterHandler(), contentWindow);
	}

	this.stopForAllBrowsers = function() {
		forEachBrowser(new DeregisterHandler());
	}

	function forEachBrowser(handler) {
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
		var e = wm.getEnumerator("navigator:browser");
		var window;
		var browsers;
		var i;
		while (e.hasMoreElements()) {
			window = e.getNext();
			browsers = window.getBrowser().browsers;
			for (i = 0; i < browsers.length; i++) {
				handler.handleWindow(browsers[i].contentWindow);
				forEachInput(handler, browsers[i].contentWindow);
			}
		}
	}
	
	function forEachInput(handler, window) {
		const documents = getDocuments(window, new Array());
		for (var i = 0; i < documents.length; i++) {
			if (handler.doHandleDocument(documents[i])) {
				parseDocument(documents[i], handler, window);
			}
		}
	}
	
	function parseDocument(doc, interceptor, window) {
		findElement(doc, "input", function(e) {
						if (e.type == 'text' || e.type == 'password') {
							interceptor.handleListener("change", "type", e, window);
						}
						if (e.type == 'submit' || e.type == 'button' || e.type == 'image' ||
							e.type == 'radio' || e.type == 'checkbox') {
							interceptor.handleListener("click", "click", e, window);
						}
					});
		findElement(doc, "textarea", function(e) {
						interceptor.handleListener("change", "type", e, window);
					});
		findElement(doc, "select", function(e) {
						interceptor.handleListener("change", "select", e, window);
					});
		findElement(doc, "a", function(e) {
						if (e.href != null) {
							interceptor.handleListener("click", "click", e, window);
						}
					});
	}
	
	function findElement(doc, name, handler) {
		var elements = doc.getElementsByTagName(name);
		var e;
		for (var i = 0; i < elements.length; i++) {
			handler.apply(this, new Array(elements[i]));
		}
	}
	
	function RegisterHandler() {
	}
	
	RegisterHandler.prototype.doHandleDocument = function(doc) {
		if (!doc.registeredSeleniumIDE) {
			doc.registeredSeleniumIDE = true;
			return true;
		} else {
			return false;
		}
	};
	
	RegisterHandler.prototype.handleWindow = function(window) {
	};

	RegisterHandler.prototype.handleListener = function(event, command, e, window) {
		e._recorder_listener = function() {
			var value = '';
			if (command == 'select') {
				var label = e.options[e.selectedIndex].innerHTML;
				value = "label=" + label;
			} else if (command == 'type') {
				value = e.value;
			}
			self.listener.addCommand(command, getLocator(window, e), value, window);
		};
		e.addEventListener(event, e._recorder_listener, false);
	};
	
	function DeregisterHandler() {
	}
	
	DeregisterHandler.prototype.doHandleDocument = function(doc) {
		if (doc.registeredSeleniumIDE) {
			doc.registeredSeleniumIDE = false;
			return true;
		} else {
			return false;
		}
	};

	DeregisterHandler.prototype.handleWindow = function(window) {
		window._locator_pageBot = null;
	};

	DeregisterHandler.prototype.handleListener = function(event, command, e, window) {
		e.removeEventListener(event, e._recorder_listener, false);
	};

	function getPageBot(window) {
		var pageBot = window._locator_pageBot;
		if (pageBot == null) {
			pageBot = PageBot.createForWindow(window);
			window._locator_pageBot = pageBot;
		}
		return pageBot;
	}

	function getLocator(window, e) {
		var locatorDetectors = new Array(getIDLocator,
										 getVisibleLocator, 
										 getVisible2Locator,
										 getNameLocator);
		var i = 0;
		var xpathLevel = 0;
		var maxLevel = 10;
		var locator;
		var pageBot = getPageBot(window);
		while (true) {
			if (i < locatorDetectors.length) {
				locator = locatorDetectors[i].call(this, e);
				i++;
			} else {
				locator = getAbsoluteXPathLocator(e, xpathLevel);
				xpathLevel++;
			}
			log.debug("locator=" + locator);
			if (locator != '') {
				// test the locator
				try {
					if (e == pageBot.findElement(locator)) {
						return locator;
					}
				} catch (error) {
					log.warn("findElement error: " + error + ", node=" + e + ", locator=" + locator);
					//break;
				}
			} else if (xpathLevel > 0) {
				break;
			}
			if (xpathLevel >= maxLevel) {
				break;
			}
		}
		return "LOCATOR_DETECTION_FAILED";
	}

	function xpathLocator(e, attributes) {
		var att;
		var locator = '//' + e.nodeName.toLowerCase() + '[';
		var first = true;
		var i;
		var attributeArray = attributes.split(',');
		for (i = 0; i < attributeArray.length; i++) {
			att = attributeArray[i];
			if (!first) locator += ' and ';
			locator += '@' + att + "='" + e[att] + "'";
			first = false;
		}
		locator += ']';
		return locator;
	}
	

	function encodeConditions(atts) {
		var att;
		var result = '';
		var first = true;
		var count = 0;
		for (att in atts) {
			if (!first) result += ' and ';
			result += att + '=\"' + atts[att].replace(/\"/g, "&quot;") + '\"';
			first = false;
			count++;
		}
		if (result != '') {
			if (count == 1 && atts['position()'] != null) {
				return '[' + atts['position()'] + ']';
			} else {
				return '[' + result + ']';
			}
		} else {
			return '';
		}
	}

	function getVisibleLocator(e) {
		var i;
		if (e.nodeName == 'INPUT') {
			if (e.type == 'button' || e.type == 'submit') {
				return xpathLocator(e, 'type,value');
			} else if (e.type == 'image' && e.alt != '') {
				return xpathLocator(e, 'type,alt');
			} else if ((e.type == 'text' || e.type == 'password') && e.name != '') {
				return e.name;
			} else if (e.type == 'checkbox' || e.type == 'radio') {
				if (e.name != '' && e.value != '') {
					return xpathLocator(e, 'name,value');
				} else if (e.name != '') {
					return e.name;
				}
			} else {
				return "//input[@type='" + e.type + "']";
			}
		} else if (e.nodeName == 'TEXTAREA') {
			return e.name;
		} else if (e.nodeName == 'SELECT') {
			return e.name;
		} else if (e.nodeName == 'A') {
			var text = e.textContent;
			if (!text.match(/^\s*$/)) {
				return "link=" + e.textContent;
			}
			var nodeList = e.childNodes;
			for (i = 0; i < nodeList.length; i++) {
				var node = nodeList[i];
				if (node.nodeName == 'IMG' && node.alt != '') {
					return "//a[img/@alt='" + node.alt + "']";
				}
			}
			//return "//a[@href='" + e.href + "']";
		}
		return "";
	}

	function getVisible2Locator(e) {
		var i;
		if (e.nodeName == 'A') {
			var text = e.textContent;
			if (!text.match(/^\s*$/)) {
				return "//a[contains(text(),'" + text.replace(/^\s+/,'').replace(/\s+$/,'') + "')]";
			}
		}
		return "";
	}

	function getNameLocator(e) {
		var i;
		if (e.nodeName == 'INPUT') {
			if (e.name != '') {
				return "name=" + e.name;
			}
		}
		return "";
	}

	function getIDLocator(e) {
		var i;
		if (e.id != '') {
			return "id=" + e.id;
		}
		return '';
	}

	function elementXPath(node, conditions) {
		var i;
		if (node.attributes) {
			for (i = 0; i < node.attributes.length; i++) {
				var att = node.attributes[i];
				if (att.name == 'name' || att.name == 'value' ||
					att.name == 'id' || att.name == 'style' ||
					att.name == 'action' || att.name == 'onclick' ||
					att.name == 'href') {
					conditions['@' + att.name] = att.value;
				}
			}
		}
		return node.nodeName.toLowerCase() + encodeConditions(conditions);
	}

	function getAbsoluteXPathLocator(e, level) {
		var lastElementPath = elementXPath(e, new Object());
		var prevPath = '';
		var path = '/' + lastElementPath + prevPath;
		var node = e;
		var i, j;
		for (i = 0; i < level; i++) {
			var parent = node.parentNode;
			//sr_debug("parent=" + parent);
			if (parent == null) {
				return "";
			}
			var conditions = new Object();
			var childNodes = parent.getElementsByTagName(node.nodeName);
			if (childNodes.length > 1) {
				//sr_debug("childNodes.length=" + childNodes.length);
				for (j = 0; j < childNodes.length; j++) {
					if (childNodes[j] == node) {
						conditions['position()'] = '' + (j + 1);
						//sr_debug("position=" + j);
					}
				}
			}
			lastElementPath = elementXPath(node, conditions);
			prevPath = '/' + lastElementPath + prevPath;
			path = "/" + elementXPath(parent, new Object()) + prevPath;
			node = parent;
		}
		return "/" + path;
	}

	function getDocuments(frame) {
		var documents = new Array();
		var frames = frame.frames;
		documents.push(frame.document);
		for (var i = 0; i < frames.length; i++) {
			documents = documents.concat(getDocuments(frames[i]));
		}
		return documents;
	}
	
	function getBrowser() {
		var browser = opener.getBrowser();
		return browser;
	}
}

