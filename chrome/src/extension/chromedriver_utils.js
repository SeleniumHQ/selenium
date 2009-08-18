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
 * Gets an array of elements which match the passed xpath
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
 * @return if element is displayed
 * @throws ElementNotVisibleException object ready to be sent if element is not displayed
 */
function checkElementIsDisplayed(element) {
  if (element.tagName.toLowerCase() == "title") {
    //Always visible
    return;
  }
  if (!Utils.isDisplayed(element)) {
    throw {statusCode: 5, value: {message: "Element was not visible",
                                    class: "org.openqa.selenium.ElementNotVisibleException"}};
  }
}

/**
 * Throws exception if element is disabled
 * @return if element is enabled
 * @throws UnsupoprtedOperationException object ready to be sent if element is disabled
 */
function checkElementNotDisabled(element) {
  if (element.disabled) {
    throw {statusCode: 6, value: {message: "Cannot operate on disabled element",
                                    class: "java.lang.UnsupportedOperationException"}};
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
  return [x, y];
}

/**
 * Converts rgb(x, y, z) colours to #RRGGBB colours
 * @param rgb string of form either rgb(x, y, z) or rgba(x, y, z, a) with x, y, z, a numbers
 * @return string of form #RRGGBB where RR, GG, BB are two-digit lower-case hex values
 */
function rgbToRRGGBB(rgb) {
  //rgb(0, 0, 0)
  //rgba(0, 0, 0, 0)
  var r, g, b;
  var values = rgb.split(",");
  if (values.length == 3 && values[0].length > 4 && values[0].substr(0, 4) == "rgb(") {
    r = decimalToTwoDigitHex(values[0].substr(4));
    g = decimalToTwoDigitHex(values[1]);
    b = decimalToTwoDigitHex(values[2].substr(0, values[2].length - 1));
    console.log("r:" + r + ", g: " + g + ", b: " + b);
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
 * Convert a number from decimal to a two-digit hex string
 * @return null if value was not an int, two digit string representation
 *        (with leading zero if needed) of (value % 256) in base 16 otherwise
 */
function decimalToTwoDigitHex(value) {
  value = parseInt(value);
  if (value == null) {
    return null;
  }
  var v0 = singleHexDigitDecimalToLowerHex(value >> 4);
  var v1 = singleHexDigitDecimalToLowerHex(value % 16);
  return v0.toString() + v1.toString();
}

/**
 * Converts a number to a one-digit hex string representing it
 * @return (value % 16) as a one-character base 16 string
 */
function singleHexDigitDecimalToLowerHex(value) {
  value %= 16
  if (value < 10) return value;
  switch (value) {
  case 10:
    return "a";
  case 11:
    return "b";
  case 12:
    return "c";
  case 13:
    return "d";
  case 14:
    return "e";
  case 15:
    return "f";
  default:
    return value;
  }
}
