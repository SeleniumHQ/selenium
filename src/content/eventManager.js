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
				if (!e.tagName) return null;
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
					if (!self.listener.recordingEnabled) return;
					
					var tagName = event.target.tagName.toLowerCase();
					log.debug("change event: tagName=" + tagName);
					var type = event.target.type;
					if ('select' == tagName) {
						var label = event.target.options[event.target.selectedIndex].innerHTML;
						var value = "label=" + label.replace(/^\s*(.*?)\s*$/, "$1");
						self.listener.addCommand("select", self.getLocator(window, event.target), value, window);
					} else if (('input' == tagName && ('text' == type || 'password' == type || 'file' == type)) ||
							   'textarea' == tagName) {
						self.listener.addCommand("type", self.getLocator(window, event.target), event.target.value, window);
					} else {
						log.debug("ignoring change event: tagName=" + tagName);
					}
				},

				click: function(event) {
					if (!self.listener.recordingEnabled) return;
					
					if (event.button == 0) {
						var clickable = findClickableElement(event.target);
						if (clickable) {
							self.listener.addCommand("click", self.getLocator(window, clickable), '', window);
						}
					}
				},

				mousedown: function(event) {
					self.listener.clickedElement = event.target;
				}
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

	this.getLocator = function(window, e) {
		var locatorDetectors = 
		  [this.getLinkLocator, 
		   this.getIDLocator, 
		   this.getNameLocator, 
		   this.getLinkXPathLocator,
		   this.getAttributesXPathLocator, 
		   this.getPositionXPathLocator];
		var i = 0;
		var xpathLevel = 0;
		var maxLevel = 10;
		var locator;
		var pageBot = this.getPageBot(window);
		log.debug("getLocator for element " + e);
		for (var i = 0; i < locatorDetectors.length; i++) {
			locator = locatorDetectors[i].call(this, e, pageBot);
			if (locator) {
				log.debug("locator=" + locator);
				// test the locator
				try {
					if (e == pageBot.findElement(locator)) {
						return locator;
					}
				} catch (error) {
					log.warn("findElement error: " + error + ", node=" + e + ", locator=" + locator);
				}
			}
		}
		return "LOCATOR_DETECTION_FAILED";
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

EventManager.prototype = {
	PREFERRED_ATTRIBUTES: ['id','name','value','type','action','href','onclick'],
	
	attributeValue: function(value) {
		if (value.indexOf("'") < 0) {
			return "'" + value + "'";
		} else if (value.indexOf('"') < 0) {
			return '"' + value + '"';
		} else {
			var result = 'concat(';
			while (true) {
				var apos = value.indexOf("'");
				var quot = value.indexOf('"');
				if (apos < 0) {
					result += "'" + value + "'";
					break;
				} else if (quot < 0) {
					result += '"' + value + '"';
					break;
				} else if (quot < apos) {
					var part = value.substring(0, apos);
					result += "'" + part + "'";
					value = value.substring(part.length);
				} else {
					var part = value.substring(0, quot);
					result += '"' + part + '"';
					value = value.substring(part.length);
				}
				result += ',';
			}
			result += ')';
			return result;
		}
	},
	
	getPageBot: function(window) {
		var pageBot = window._locator_pageBot;
		if (pageBot == null) {
			pageBot = PageBot.createForWindow(window);
			window._locator_pageBot = pageBot;
		}
		return pageBot;
	},
	
	attributesXPath: function(name, attNames, attributes) {
		var locator = "//" + name + "[";
		for (var i = 0; i < attNames.length; i++) {
			if (i > 0) {
				locator += " and ";
			}
			var name = attNames[i];
			locator += '@' + name + "=" + this.attributeValue(attributes[name]);
		}
		locator += "]";
		return locator;
	},
	
	getAttributesXPathLocator: function(e, pageBot) {
		if (e.attributes) {
			var atts = e.attributes;
			var attsMap = {};
			for (var i = 0; i < atts.length; i++) {
				var att = atts[i];
				attsMap[att.name] = att.value;
			}
			var names = [];
			// try preferred attributes first
			for (var i = 0; i < this.PREFERRED_ATTRIBUTES.length; i++) {
				var name = this.PREFERRED_ATTRIBUTES[i];
				if (attsMap[name] != null) {
					names.push(name);
					var locator = this.attributesXPath(e.nodeName.toLowerCase(), names, attsMap);
					try {
						if (e == pageBot.findElement(locator)) {
							return locator;
						}
					} catch (error) {}
				}
			}
			// Comment this out to try rest of attributes
			/*
			for (name in attsMap) {
				if (names.indexOf(name) < 0) {
					names.push(name);
					var locator = this.attributesXPath(e.nodeName.toLowerCase(), names, attsMap);
					try {
						if (e == pageBot.findElement(locator)) {
							return locator;
						}
					} catch (error) {}
				}
			}
			*/
		}
		return null;
	},

	getPositionXPathLocator: function(e, pageBot) {
		var path = '';
		var current = e;
		while (current != null) {
			var currentPath = '/' + current.nodeName.toLowerCase();
			if (current.parentNode != null) {
				var childNodes = current.parentNode.childNodes;
				var total = 0;
				var index = -1;
				for (var i = 0; i < childNodes.length; i++) {
					var child = childNodes[i];
					if (child.nodeName == current.nodeName) {
						if (child == current) {
							index = total;
						}
						total++;
					}
				}
				if (total > 1 && index >= 0) {
					currentPath += '[' + (index + 1) + ']';
				}
			}
			path = currentPath + path;
			var locator = '/' + path;
			try {
				if (e == pageBot.findElement(locator)) {
					return locator;
				}
			} catch (error) {}
			current = current.parentNode;
		}
		return null;
	},

	getLinkXPathLocator: function(e) {
		if (e.nodeName == 'A') {
			var nodeList = e.childNodes;
			for (i = 0; i < nodeList.length; i++) {
				var node = nodeList[i];
				if (node.nodeName == 'IMG' && node.alt != '') {
					return "//a[img/@alt=" + this.attributeValue(node.alt) + "]";
				}
			}
			var text = e.textContent;
			if (!text.match(/^\s*$/)) {
				return "//a[contains(text(),'" + text.replace(/^\s+/,'').replace(/\s+$/,'') + "')]";
			}
		}
		return null;
	},

	getLinkLocator: function(e) {
		if (e.nodeName == 'A') {
			var text = e.textContent;
			if (!text.match(/^\s*$/)) {
				return "link=" + exactMatchPattern(text.replace(/^\s*(.*?)\s*$/, "$1"));
			}
		}
		return null;
	},

	getIDLocator: function(e) {
		if (e.id) {
			return e.id;
		}
		return null;
	},

	getNameLocator: function(e) {
		if (e.name) {
			return e.name;
		}
		return null;
	}
	

}


