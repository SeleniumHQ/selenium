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

function getXPathOfElement(element) {
  var path = "";
  for (; element && element.nodeType == 1; element = element.parentNode) {
    index = getElementIndexForXPath(element);
    path = "/" + element.tagName + "[" + index + "]" + path;
  }
  return path;	
}

function getElementIndexForXPath(element) {
  var index = 1;
  for (var sibling = element.previousSibling; sibling ; sibling = sibling.previousSibling) {
    if (sibling.nodeType == 1 && sibling.tagName == element.tagName) {
      index++;
    }
  }
  return index;
}

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

function checkElementIsDisplayed(element) {
  if (element.tagName.toLowerCase() == "title") {
    //Always visible
    return;
  }
  if (!Utils.isDisplayed(element)) {
    throw {statusCode: 404, value: {message: "Element was not visible",
                                    class: "org.openqa.selenium.ElementNotVisibleException"}};
  }
}

function checkElementNotDisabled(element) {
  if (element.disabled) {
    throw {statusCode: 404, value: {message: "Cannot operate on disabled element",
                                    class: "java.lang.UnsupportedOperationException"}};
  }
}

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

function getElementCoords(element) {
  var x = y = 0;
  do {
    x += element.offsetLeft;
    y += element.offsetTop;
  } while (element = element.offsetParent);
  return [x, y];
}

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

function decimalToTwoDigitHex(value) {
  value = parseInt(value);
  if (value == null) {
    return null;
  }
  var v0 = singleHexDigitDecimalToLowerHex(value >> 4);
  var v1 = singleHexDigitDecimalToLowerHex(value % 16);
  return v0.toString() + v1.toString();
}

//Returns passed value if negative or greater than 15
function singleHexDigitDecimalToLowerHex(value) {
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
