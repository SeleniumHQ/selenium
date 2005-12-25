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
		callForWindow(new RegisterHandler(), contentWindow);
	}

	this.stopForAllBrowsers = function() {
		forEachBrowser(new DeregisterHandler());
	}

	function forEachBrowser(handler) {
		log.debug("forEachBrowser");
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
		var e = wm.getEnumerator("navigator:browser");
		var window;
		var browsers;
		var i;
		while (e.hasMoreElements()) {
			window = e.getNext();
			log.debug("window=" + window);
			browsers = window.getBrowser().browsers;
			for (i = 0; i < browsers.length; i++) {
				log.debug("browser=" + browsers[i]);
				callForWindow(handler, browsers[i].contentWindow);
			}
		}
	}

	function callForWindow(handler, contentWindow) {
		var documents = getDocuments(contentWindow);
		for (var i = 0; i < documents.length; i++) {
			handler.handleDocument(documents[i], contentWindow);
		}
	}

	function RegisterHandler(w) {
	}

	RegisterHandler.prototype.handleDocument = function(document, window) {
		if (!document._Selenium_IDE_listeners) {
			log.debug("registering event listeners for " + document);
			
			function findClickableElement(e, window) {
				var tagName = e.tagName.toLowerCase();
				var type = e.type;
				if (e.hasAttribute("onclick") || e.hasAttribute("href") ||
					(tagName == "input" && 
					 (type == "submit" || type == "button" || type == "image" || type == "radio" || type == "checkbox"))) {
					return e;
				} else {
					if (e.parentNode != null) {
						return findClickableElement(e.parentNode, window);
					} else {
						return null;
					}
				}
			}
			
			var listeners = {
				change: function(event) {
					var tagName = event.target.tagName.toLowerCase();
					var type = event.target.type;
					if ('select' == tagName) {
						var label = event.target.options[event.target.selectedIndex].innerHTML;
						var value = "label=" + label;
						self.listener.addCommand("select", getLocator(window, event.target), value, window);
					} else if ('text' == type || 'password' == type || 'file' == type) {
						self.listener.addCommand("type", getLocator(window, event.target), event.target.value, window);
					} else {
						log.debug("ignoring change event: tagName=" + tagName);
					}
				},

				click: function(event) {
					var clickable = findClickableElement(event.target);
					if (clickable) {
						self.listener.addCommand("click", getLocator(window, clickable), '', window);
					}
				},
			}

			for (name in listeners) {
				document.addEventListener(name, listeners[name], false);
			}
			
			document._Selenium_IDE_listeners = listeners;
			
			return true;
		} else {
			return false;
		}
	};
	
	function DeregisterHandler() {
	}
	
	DeregisterHandler.prototype.handleDocument = function(document, window) {
		//window.removeEventListener(window, e._changeEventListener, false);
		if (document._Selenium_IDE_listeners) {
			log.debug("unregistering event listeners");
			var listeners = document._Selenium_IDE_listeners;
			for (name in listeners) {
				document.removeEventListener(name, listeners[name], false);
			}
			delete document._Selenium_IDE_listeners;
		}
		delete window._locator_pageBot;
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
		var locatorDetectors = 
			[getLinkLocator, getIDLocator, getNameLocator, getOptimizedXPathLocator];
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

	function getLinkLocator(e) {
		if (e.nodeName == 'A') {
			var text = e.textContent;
			if (!text.match(/^\s*$/)) {
				return "link=" + e.textContent;
			}
		}
		return "";
	}

	function getIDLocator(e) {
		if (e.id != '') {
			return "id=" + e.id;
		}
		return '';
	}

	function getNameLocator(e) {
		if (e.name != '') {
			return e.name;
		}
		return '';
	}
	
	function getOptimizedXPathLocator(e) {
		var i;
		if (e.nodeName == 'INPUT') {
			if (e.type == 'button' || e.type == 'submit') {
				return xpathLocator(e, 'type,value');
			} else if (e.type == 'image' && e.alt != '') {
				return xpathLocator(e, 'type,alt');
			} else if (e.type == 'checkbox' || e.type == 'radio') {
				return xpathLocator(e, 'name,value');
			} else {
				return "//input[@type='" + e.type + "']";
			}
		} else if (e.nodeName == 'A') {
			var nodeList = e.childNodes;
			for (i = 0; i < nodeList.length; i++) {
				var node = nodeList[i];
				if (node.nodeName == 'IMG' && node.alt != '') {
					return "//a[img/@alt='" + node.alt + "']";
				}
			}
			var text = e.textContent;
			if (!text.match(/^\s*$/)) {
				return "//a[contains(text(),'" + text.replace(/^\s+/,'').replace(/\s+$/,'') + "')]";
			}
		}
		return "";
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

