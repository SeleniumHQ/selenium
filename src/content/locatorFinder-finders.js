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

/*
 * Utility function: Encode XPath attribute value.
 */
LocatorFinder.prototype.attributeValue = function(value) {
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


LocatorFinder.addFinder('link', function(e) {
		if (e.nodeName == 'A') {
			var text = e.textContent;
			if (!text.match(/^\s*$/)) {
				return "link=" + exactMatchPattern(text.replace(/\xA0/g, " ").replace(/^\s*(.*?)\s*$/, "$1"));
			}
		}
		return null;
	});

LocatorFinder.addFinder('id', function(e) {
		if (e.id) {
			return e.id;
		}
		return null;
	});

LocatorFinder.addFinder('name', function(e) {
		if (e.name) {
			return e.name;
		}
		return null;
	});

LocatorFinder.addFinder('linkXPath', function(e) {
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
	});

LocatorFinder.addFinder('attributesXPath', function(e) {
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
					try {
						if (e == this.pageBot().findElement(locator)) {
							return locator;
						}
					} catch (error) {}
				}
			}
		}
		return null;
	});

LocatorFinder.addFinder('hrefXPath', function(e) {
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

LocatorFinder.addFinder('positionXPath', function(e) {
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
			try {
				if (e == this.pageBot().findElement(locator)) {
					return locator;
				}
			} catch (error) {}
			current = current.parentNode;
			this.log.debug("positionXPath: current=" + current);
		}
		return null;
	});
