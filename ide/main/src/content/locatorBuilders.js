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
    if (this.window._locator_pageBot) {
        this.log.debug(this.window);
        this.window._locator_pageBot = undefined;
        // Firefox 3 (beta 5) throws "Security Manager vetoed action" when we use delete operator like this:
        // delete this.window._locator_pageBot;
    }
};

LocatorBuilders.prototype.pageBot = function() {
    var pageBot = this.window._locator_pageBot;
    if (pageBot == null) {
        //pageBot = BrowserBot.createForWindow(this.window);
        pageBot = new MozillaBrowserBot(this.window);
        var self = this;
        pageBot.getCurrentWindow = function() {
            return self.window;
        };
        this.window._locator_pageBot = pageBot;
    }
    return pageBot;
};

LocatorBuilders.prototype.buildWith = function(name, e, opt_contextNode) {
    return LocatorBuilders.builderMap[name].call(this, e, opt_contextNode);
};

LocatorBuilders.prototype.build = function(e) {
    var locators = this.buildAll(e);
    if (locators.length > 0) {
        return locators[0][0];
    } else {
        return "LOCATOR_DETECTION_FAILED";
    }
};

LocatorBuilders.prototype.buildAll = function(el) {
    var e = core.firefox.unwrap(el);    //Samit: Fix: Do the magic to get it to work in Firefox 4
    var xpathLevel = 0;
    var maxLevel = 10;
    var locator;
    var locators = [];
    this.log.debug("getLocator for element " + e);
    
    for (var i = 0; i < LocatorBuilders.order.length; i++) {
        var finderName = LocatorBuilders.order[i];
        this.log.debug("trying " + finderName);
        locator = this.buildWith(finderName, e);
        if (locator) {
            locator = String(locator);
            this.log.debug("locator=" + locator);
            // test the locator. If a is_fuzzy_match() heuristic function is
            // defined for the location strategy, use it to determine the
            // validity of the locator's results. Otherwise, maintain existing
            // behavior.
            try {
                //alert(PageBot.prototype.locateElementByUIElement);
                var is_fuzzy_match = this.pageBot().locationStrategies[finderName].is_fuzzy_match;
                if (is_fuzzy_match) {
                    if (is_fuzzy_match(this.findElement(locator), e)) {
                        locators.push([ locator, finderName ]);
                    }
                }
                else {
                    if (e == this.findElement(locator)) {
                        locators.push([ locator, finderName ]);
                    }
                }
            }
            catch (exception) {
                if (e == this.findElement(locator)) {
                    locators.push([ locator, finderName ]);
                }
            }
        }
    }
    return locators;
};

LocatorBuilders.prototype.findElement = function(locator) {
    try {
        return this.pageBot().findElement(locator);
    } catch (error) {
        this.log.debug("findElement failed: " + error + ", locator=" + locator);
        return null;
    }
};

/*
 * Class methods
 */

LocatorBuilders.order = [];
LocatorBuilders.builderMap = {};

LocatorBuilders.add = function(name, finder) {
    this.order.push(name);
    this.builderMap[name] = finder;
};

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
        var part = "";
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
                part = value.substring(0, apos);
                result += "'" + part + "'";
                value = value.substring(part.length);
            } else {
                part = value.substring(0, quot);
                result += '"' + part + '"';
                value = value.substring(part.length);
            }
            result += ',';
        }
        result += ')';
        return result;
    }
};

LocatorBuilders.prototype.xpathHtmlElement = function(name) {
    if (this.window.document.contentType == 'application/xhtml+xml') {
        // "x:" prefix is required when testing XHTML pages
        return "x:" + name;
    } else {
        return name;
    }
};

LocatorBuilders.prototype.relativeXPathFromParent = function(current) {
    var index = this.getNodeNbr(current);
    var currentPath = '/' + this.xpathHtmlElement(current.nodeName.toLowerCase());
    if (index > 0) {
        currentPath += '[' + (index + 1) + ']';
    }
    return currentPath;
};

LocatorBuilders.prototype.getNodeNbr = function(current) {
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
    return index;
};

LocatorBuilders.prototype.getCSSSubPath = function(e) {
    var css_attributes = ['id', 'name', 'class', 'type', 'alt', 'title', 'value'];
    for (var i = 0; i < css_attributes.length; i++) {
        var attr = css_attributes[i];
        var value = e.getAttribute(attr);
        if (value) {
            if (attr == 'id')
                return '#' + value;
            if (attr == 'class')
                return e.nodeName.toLowerCase() + '.' + value.replace(" ", ".").replace("..", ".");
            return e.nodeName.toLowerCase() + '[' + attr + '=' + value + ']';
        }
    }
    if (this.getNodeNbr(e))
        return e.nodeName.toLowerCase() + ':nth-of-type(' + this.getNodeNbr(e) + ')';
    else
        return e.nodeName.toLowerCase();
};

/*
 * ===== builders =====
 */

LocatorBuilders.add('ui', function(pageElement) {
    return UIMap.getInstance().getUISpecifierString(pageElement,
        this.window.document);
    });
    
LocatorBuilders.add('id', function(e) {
        if (e.id) {
            return 'id=' + e.id;
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
            return 'name=' + e.name;
        }
        return null;
    });

LocatorBuilders.add('css', function(e) {
        var current = e;
        var sub_path = this.getCSSSubPath(e);
        while (this.findElement("css=" + sub_path) != e && current.nodeName.toLowerCase() != 'html') {
          sub_path = this.getCSSSubPath(current.parentNode) + ' > ' + sub_path;
          current = current.parentNode;
        }
        return "css=" + sub_path;
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
};

LocatorBuilders.add('dom:name', function(e) {
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

LocatorBuilders.add('xpath:link', function(e) {
        if (e.nodeName == 'A') {
            var text = e.textContent;
            if (!text.match(/^\s*$/)) {
                return "//" + this.xpathHtmlElement("a") + "[contains(text(),'" + text.replace(/^\s+/,'').replace(/\s+$/,'') + "')]";
            }
        }
        return null;
    });

LocatorBuilders.add('xpath:img', function(e) {
        if (e.nodeName == 'IMG') {
            if (e.alt != '') {
                return "//" + this.xpathHtmlElement("img") + "[@alt=" + this.attributeValue(e.alt) + "]";
            } else if (e.title != '') {
                return "//" + this.xpathHtmlElement("img") + "[@title=" + this.attributeValue(e.title) + "]";
            } else if (e.src != '') {
                return "//" + this.xpathHtmlElement("img") + "[contains(@src," + this.attributeValue(e.src) + ")]";
            }
        }
        return null;
    });

LocatorBuilders.add('xpath:attributes', function(e) {
        const PREFERRED_ATTRIBUTES = ['id', 'name', 'value', 'type', 'action', 'onclick'];
        var i = 0;
        
        function attributesXPath(name, attNames, attributes) {
            var locator = "//" + this.xpathHtmlElement(name) + "[";
            for (i = 0; i < attNames.length; i++) {
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
            for (i = 0; i < atts.length; i++) {
                var att = atts[i];
                attsMap[att.name] = att.value;
            }
            var names = [];
            // try preferred attributes
            for (i = 0; i < PREFERRED_ATTRIBUTES.length; i++) {
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

LocatorBuilders.add('xpath:idRelative', function(e) {
        var path = '';
        var current = e;
        while (current != null) {
            if (current.parentNode != null) {
                path = this.relativeXPathFromParent(current) + path;
                if (1 == current.parentNode.nodeType && // ELEMENT_NODE
                    current.parentNode.getAttribute("id")) {
                    return "//" + this.xpathHtmlElement(current.parentNode.nodeName.toLowerCase()) + 
                        "[@id=" + this.attributeValue(current.parentNode.id) + "]" +
                        path;
                }
            } else {
                return null;
            }
            current = current.parentNode;
        }
        return null;
    });

LocatorBuilders.add('xpath:href', function(e) {
        if (e.attributes && e.hasAttribute("href")) {
            href = e.getAttribute("href");
            if (href.search(/^http?:\/\//) >= 0) {
                return "//" + this.xpathHtmlElement("a") + "[@href=" + this.attributeValue(href) + "]";
            } else {
                // use contains(), because in IE getAttribute("href") will return absolute path
                return "//" + this.xpathHtmlElement("a") + "[contains(@href, " + this.attributeValue(href) + ")]";
            }
        }
        return null;
    });

LocatorBuilders.add('dom:index', function(e) {
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

LocatorBuilders.add('xpath:position', function(e, opt_contextNode) {
        this.log.debug("positionXPath: e=" + e);
        var path = '';
        var current = e;
        while (current != null && current != opt_contextNode) {
            var currentPath;
            if (current.parentNode != null) {
                currentPath = this.relativeXPathFromParent(current);
            } else {
                currentPath = '/' + this.xpathHtmlElement(current.nodeName.toLowerCase());
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

// You can change the priority of builders by setting LocatorBuilders.order.
LocatorBuilders.order = ['ui', 'id', 'link', 'name', 'css', 'dom:name', 'xpath:link', 'xpath:img', 'xpath:attributes', 'xpath:idRelative', 'xpath:href', 'dom:index', 'xpath:position'];
