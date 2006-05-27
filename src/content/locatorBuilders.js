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

function LocatorBuilders(window) {
	this.window = window;
	this.log = new Log("LocatorBuilders");
}

LocatorBuilders.prototype.detach = function() {
	delete this.window._locator_pageBot;
}

LocatorBuilders.prototype.pageBot = function() {
	var pageBot = this.window._locator_pageBot;
	if (pageBot == null) {
		pageBot = PageBot.createForWindow(this.window);
		this.window._locator_pageBot = pageBot;
	}
	return pageBot;
}

LocatorBuilders.prototype.buildWith = function(name, e) {
	return LocatorBuilders.finderMap[name].call(this, e);
}

LocatorBuilders.prototype.build = function(e) {
	var i = 0;
	var xpathLevel = 0;
	var maxLevel = 10;
	var locator;
	this.log.debug("getLocator for element " + e);
	
	for (var i = 0; i < LocatorBuilders.finderNames.length; i++) {
		var finderName = LocatorBuilders.finderNames[i];
		this.log.debug("trying " + finderName);
		locator = this.buildWith(finderName, e);
		if (locator) {
			locator = new String(locator);
			this.log.debug("locator=" + locator);
			// test the locator
			if (e == this.findElement(locator)) {
				return locator;
			}
		}
	}
	return "LOCATOR_DETECTION_FAILED";
}

LocatorBuilders.prototype.findElement = function(locator) {
	try {
		return this.pageBot().findElement(locator);
	} catch (error) {
		this.log.debug("findElement failed: " + error + ", locator=" + locator);
		return null;
	}
}

/*
 * Class methods
 */

LocatorBuilders.finderNames = [];
LocatorBuilders.finderMap = {};

LocatorBuilders.add = function(name, finder) {
	this.finderNames.push(name);
	this.finderMap[name] = finder;
}



/*
 * Utility function: Encode XPath attribute value.
 */
LocatorBuilders.prototype.attributeValue = function(value) {
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
}

/*
 * ===== builders =====
 */

LocatorBuilders.add('id', function(e) {
		if (e.id) {
			return e.id;
		}
		return null;
	});

LocatorBuilders.add('link', function(e) {
		if (e.nodeName == 'A') {
			var text = e.textContent;
			if (!text.match(/^\s*$/)) {
				return "link=" + exactMatchPattern(text.replace(/\xA0/g, " ").replace(/^\s*(.*?)\s*$/, "$1"));
			}
		}
		return null;
	});

LocatorBuilders.add('name', function(e) {
		if (e.name) {
			return e.name;
		}
		return null;
	});

/*
 * This function is called from DOM locatorBuilders
 */
LocatorBuilders.prototype.findDomFormLocator = function(form) {
	if (form.hasAttribute('name')) {
		var name = form.getAttribute('name');
		var locator = "document." + name;
		if (this.findElement(locator) == form) {
			return locator;
		}
		locator = "document.forms['" + name + "']";
		if (this.findElement(locator) == form) {
			return locator;
		}
	}
	var forms = this.window.document.forms;
	for (var i = 0; i < forms.length; i++) {
		if (form == forms[i]) {
			return "document.forms[" + i + "]";
		}
	}
	return null;
}

LocatorBuilders.add('domFormElementName', function(e) {
		if (e.form && e.name) {
			var formLocator = this.findDomFormLocator(e.form);
			var candidates = [formLocator + "." + e.name,
							  formLocator + ".elements['" + e.name + "']"];
			for (var c = 0; c < candidates.length; c++) {
				var locator = candidates[c];
				var found = this.findElement(locator);
				if (found) {
					if (found == e) {
						return locator;
					} else if (found instanceof NodeList) {
						// multiple elements with same name
						for (var i = 0; i < found.length; i++) {
							if (found[i] == e) {
								return locator + "[" + i + "]";
							}
						}
					}
				}
			}
		}
		return null;
	});

LocatorBuilders.add('domFormElementIndex', function(e) {
		if (e.form) {
			var formLocator = this.findDomFormLocator(e.form);
			var elements = e.form.elements;
			for (var i = 0; i < elements.length; i++) {
				if (elements[i] == e) {
					return formLocator + ".elements[" + i + "]";
				}
			}
		}
		return null;
	});

LocatorBuilders.add('linkXPath', function(e) {
		if (e.nodeName == 'A') {
			var nodeList = e.childNodes;
			for (var i = 0; i < nodeList.length; i++) {
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
	});

LocatorBuilders.add('attributesXPath', function(e) {
		const PREFERRED_ATTRIBUTES = ['id','name','value','type','action','onclick'];
		
		function attributesXPath(name, attNames, attributes) {
			var locator = "//" + name + "[";
			for (var i = 0; i < attNames.length; i++) {
				if (i > 0) {
					locator += " and ";
				}
				var attName = attNames[i];
				locator += '@' + attName + "=" + this.attributeValue(attributes[attName]);
			}
			locator += "]";
			return locator;
		}

		if (e.attributes) {
			var atts = e.attributes;
			var attsMap = {};
			for (var i = 0; i < atts.length; i++) {
				var att = atts[i];
				attsMap[att.name] = att.value;
			}
			var names = [];
			// try preferred attributes
			for (var i = 0; i < PREFERRED_ATTRIBUTES.length; i++) {
				var name = PREFERRED_ATTRIBUTES[i];
				if (attsMap[name] != null) {
					names.push(name);
					var locator = attributesXPath.call(this, e.nodeName.toLowerCase(), names, attsMap);
					if (e == this.findElement(locator)) {
						return locator;
					}
				}
			}
		}
		return null;
	});

LocatorBuilders.add('hrefXPath', function(e) {
		if (e.attributes && e.hasAttribute("href")) {
			href = e.getAttribute("href");
			if (href.search(/^http?:\/\//) >= 0) {
				return "//a[@href=" + this.attributeValue(href) + "]";
			} else {
				// use contains(), because in IE getAttribute("href") will return absolute path
				return "//a[contains(@href, " + this.attributeValue(href) + ")]";
			}
		}
		return null;
	});

LocatorBuilders.add('positionXPath', function(e) {
		this.log.debug("positionXPath: e=" + e);
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
			if (e == this.findElement(locator)) {
				return locator;
			}
			current = current.parentNode;
			this.log.debug("positionXPath: current=" + current);
		}
		return null;
	});
