/**
 * Guesses whether we have an HTML document or a text file
 */
function guessPageType() {
  var source = document.getElementsByTagName("html")[0].outerHTML;
  var textSourceBegins = '<html><body><pre style="word-wrap: break-word; white-space: pre-wrap;">';
  var textSourceEnds = '</pre></body></html>';
  
  if (source.substr(0, textSourceBegins.length) == textSourceBegins && 
      source.substr(0 - textSourceEnds.length) == textSourceEnds) {
    return "text";
  } else {
    return "html";
  }
}

/**
 * Gets an array of elements which match the passed xpath string
 */
function getElementsByXPath(xpath) {
  var elements = [];
  var foundElements = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
  var this_element = foundElements.iterateNext();
  while (this_element) {
    elements.push(this_element);
    this_element = foundElements.iterateNext();
  }
  return elements;
}

/**
 * Gets canonical xpath of the passed element, e.g. /HTML/BODY/P[1]
 */
function getXPathOfElement(element) {
  var path = "";
  for (; element && element.nodeType == 1; element = element.parentNode) {
    index = getElementIndexForXPath(element);
    path = "/" + element.tagName + "[" + index + "]" + path;
  }
  return path;	
}

/**
 * Returns n for the nth element of type element.tagName in the page
 */
function getElementIndexForXPath(element) {
  var index = 1;
  for (var sibling = element.previousSibling; sibling ; sibling = sibling.previousSibling) {
    if (sibling.nodeType == 1 && sibling.tagName == element.tagName) {
      index++;
    }
  }
  return index;
}

/**
 * Gets an array of link elements whose displayed text is linkText
 */
function getElementsByLinkText(parent, linkText) {
  var links = parent.getElementsByTagName("a");
  var matchingLinks = [];
  for (var i = 0; i < links.length; i++) {
    if (Utils.getText(links[i]) == linkText) {
      matchingLinks.push(links[i]);
    }
  }
  return matchingLinks;
}

/**
 * Gets an array of link elements whose displayed text includes linkText
 */
function getElementsByPartialLinkText(parent, partialLinkText) {
  var links = parent.getElementsByTagName("a");
  var matchingLinks = [];
  for (var i = 0; i < links.length; i++) {
    if (Utils.getText(links[i]).indexOf(partialLinkText) > -1) {
      matchingLinks.push(links[i]);
    }
  }
  return matchingLinks;
}

/**
 * Throws exception if element is not displayed
 * @return nothing if element is displayed
 * @throws ElementNotVisibleException object ready to be sent if element is not displayed
 */
function checkElementIsDisplayed(element) {
  if (element.tagName.toLowerCase() == "title") {
    //Always visible
    return;
  }
  if (!Utils.isDisplayed(element)) {
    throw {statusCode: 11, value: {message: "Element was not visible"}};
  }
}

/**
 * Throws exception if element is disabled
 * @return nothing if element is enabled
 * @throws UnsupoprtedOperationException object ready to be sent if element is disabled
 */
function checkElementNotDisabled(element) {
  if (element.disabled) {
    throw {statusCode: 12, value: {message: "Cannot operate on disabled element"}};
  }
}

/**
 * Checks whether element is selected/checked
 * @return true if element is {selectable and selected, checkable and checked},
 *         false otherwise
 */
function findWhetherElementIsSelected(element) {
  var selected = false;
  try {
    var tagName = element.tagName.toLowerCase();
    if (tagName == "option") {
      selected = element.selected;
    } else if (tagName == "input") {
      var type = element.getAttribute("type").toLowerCase();
      if (type == "checkbox" || type == "radio") {
        selected = element.checked;
      }
    } else {
      selected = element.getAttribute("selected");
    }
  } catch (e) {
    selected = false;
  }
  return selected;
}

/**
 * Gets the coordinates of the top-left corner of the element on the screen
 * @return array: [x, y]
 */
function getElementCoords(element) {
  var x = y = 0;
  do {
    x += element.offsetLeft;
    y += element.offsetTop;
  } while (element = element.offsetParent);
  if (frameElement) {
    if (frameElement.offsetLeft) {
      x += frameElement.offsetLeft;
    }
    if (frameElement.offsetTop) {
      y += frameElement.offsetTop;
    }
  }
  return [x, y];
}

/**
 * Gets the maximum offsetHeight and offsetWidth of an element or those of its sub-elements
 * In place because element.offset{Height,Width} returns incorrectly in WebKit (see bug 28810)
 * @param element element to get max dimensions of
 * @param width optional greatest width seen so far (omit when calling)
 * @param height optional greatest height seen so far (omit when calling)
 * @return an object of form: {type: "DIMENSION", width: maxOffsetWidth, height: maxOffsetHeight}
 */
function getOffsetSizeFromSubElements(element, maxWidth, maxHeight) {
  maxWidth = (typeof(maxWidth) == "undefined" || element.offsetWidth > maxWidth) ? element.offsetWidth : maxWidth;
  maxHeight = (typeof(maxHeight) == "undefined" || element.offsetHeight > maxHeight) ? element.offsetHeight : maxHeight;
  for (var child in element.children) {
    var childSize = getOffsetSizeFromSubElements(element.children[child], maxWidth, maxHeight);
    maxWidth = (childSize.width > maxWidth) ? childSize.width : maxWidth;
    maxHeight = (childSize.height > maxHeight) ? childSize.height : maxHeight;
  }
  return {type: "DIMENSION", width: maxWidth, height: maxHeight};
}

/**
 * Converts rgb(x, y, z) colours to #RRGGBB colours
 * @param rgb string of form either rgb(x, y, z) or rgba(x, y, z, a) with x, y, z, a numbers
 * @return string of form #RRGGBB where RR, GG, BB are two-digit lower-case hex values
 */
function rgbToRRGGBB(rgb) {
  var r, g, b;
  var values = rgb.split(",");
  if (values.length == 3 && values[0].length > 4 && values[0].substr(0, 4) == "rgb(") {
    r = decimalToHex(values[0].substr(4));
    g = decimalToHex(values[1]);
    b = decimalToHex(values[2].substr(0, values[2].length - 1));
    if (r == null || g == null || b == null) {
      return null;
    }
    return "#" + r + g + b;
  } else if (rgb == "rgba(0, 0, 0, 0)") {
    return "transparent";
  } else {
    return rgb;
  }
}

/**
 * Convert a number from decimal to a hex string of at least two digits
 * @return null if value was not an int, two digit string representation
 *        (with leading zero if needed) of value in base 16 otherwise
 */
function decimalToHex(value) {
  value = parseInt(value).toString(16);
  if (value == null) {
    return null;
  }
  if (value.length == 1) {
    value = '0' + '' + value;
  }
  return value;
}
