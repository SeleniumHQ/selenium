var port = chrome.extension.connect();

port.onMessage.addListener(parse_port_message);

element_array = [];

function parse_port_message(message) {
  console.log("Received request for: " + message.request);
  switch (message.request) {
  case "title":
    port.postMessage({response: "title", title: document.title});
    break;
  case "inject embed":
    inject_webdriver_embed(message.session_id, message.uuid, message.followup);
    break;
  case "remove embed":
    remove_webdriver_embed(message.uuid, message.followup);
    break;
  case "get element":
    get_element(false, message.value);
    break;
  case "get elements":
    get_element(true, message.value);
    break;
  case "get element attribute":
    get_element_attribute(message.element_id, message.attribute);
    break;
  case "get element value":
    port.postMessage({response: "get element value", value: element_array[message.element_id].value});
    break;
  case "is element selected":
    is_element_selected(message.element_id);
    break;
  case "is element enabled":
    is_element_enabled(message.element_id);
    break;
  case "tag name":
    getTagName(message.element_id);
    break;
  case "get element text":
    get_element_text(message.element_id);
    break;
  case "send element keys":
    send_element_keys(message.element_id, message.value);
    break;
  case "clear element":
    clear_element(message.element_id);
    break;
  case "click element":
    click_element(message.element_id);
    break;
  case "submit element":
    submit_element(message.element_id);
    break;
  case "select element":
    selectElement(message.element_id);
    break;
  case "toggle element":
    toggleElement(message.element_id);
    break;
  case "url":
    port.postMessage({response: "url", url: document.location.href});
    break;
  case "add cookie":
    setCookie(message.cookie);
    break;
  case "delete cookie":
    deleteCookie(message.name);
    port.postMessage({response: "delete cookie", status: true});
    break;
  case "get cookies":
    getCookies();
    break;
  case "delete all cookies":
    deleteAllCookies();
    break;
  case "go back":
    history.back();
    port.postMessage({response: "go back", status: true});
    break;
  case "go forward":
    history.forward();
    port.postMessage({response: "go back", status: true});
    break;
  case "refresh":
    document.location.reload(true);
    port.postMessage({response: "refresh", status: true});
    break;
  case "get source":
    getSource();
    break;
  }
}

function inject_webdriver_embed(session_id, uuid, followup) {
  console.log("Injecting: " + session_id + ", " + uuid);
  var embed = document.createElement('embed');
  embed.setAttribute("type", "application/x-webdriver-reporter");
  embed.setAttribute("session_id", session_id);
  embed.setAttribute("id", uuid);
  document.getElementsByTagName("body")[0].appendChild(embed);
  port.postMessage({response: "inject embed", "uuid": uuid, followup: followup});
}

function remove_webdriver_embed(uuid, followup) {
  //TODO(danielwh): See just how much of a race condition we have here between browser rendering the embed, and message being sent
  document.getElementsByTagName("body")[0].removeChild(document.getElementById(uuid));
  parse_port_message(followup);
}

/**
 * Called by both findElement and findElements
 * @param plural true if want array of all elements, false if singular element
 */
 
function get_element(plural, parsed) {
  //TODO(danielwh): Should probably check for nulls here
  var root = "./"; //root always ends with /, so // lookups should only start with one additional /
  var lookup_by = "";
  var lookup_value = "";
  var parent = null;
  if (parsed[0].id != null) {
    parent = element_array[parseInt(parsed[0].id)];
    if (parent == null) {
      //TODO(danielwh): Work out something user-friendly to output here
      port.postMessage({response: "get element", status: false, by: lookup_json, value: ""});
      return;
    }
    //Looking for children
    root = get_xpath_of_element(element_array[parseInt(parsed[0].id)]) + "/";
    lookup_by = parsed[0].using;
    lookup_value = parsed[0].value;
  } else {
    lookup_by = parsed[0];
    lookup_value = parsed[1];
    parent = document;
  }
  
  var elements = [];
  var attribute = '';
  switch (lookup_by) {
  case "class name":
    elements = get_elements_by_xpath(root + "/*[contains(concat(' ',normalize-space(@class),' '),' " + lookup_value + " ')]");
    break;
  case "name":
    attribute = 'name';
    break;
  case "id":
    attribute = 'id';
    break;
  case "link text":
    elements = getElementsByLinkText(parent, lookup_value);
    break;
  case "partial link text":
    elements = getElementsByPartialLinkText(parent, lookup_value);
    break;
  case "xpath":
    //Because root trails with a /, if the xpath starts with a /,
    //we need to strip it out, or we'll get unwanted duplication
    if (lookup_value[0] == '/') {
      lookup_value = lookup_value.substring(1, lookup_value.length + 1);
    }
    elements = get_elements_by_xpath(root + lookup_value);
    break;
  }
  if (attribute != '') {
    elements = get_elements_by_xpath(root + "/*[@" + attribute + "='" + lookup_value + "']");
  }
  if (elements == null || elements.length == 0) {
    if (plural) {
      port.postMessage({response: "get element", status: true, "elements": []});
    } else {
      port.postMessage({response: "get element", status: false, by: lookup_by, value: lookup_value});
    }
    return;
  } else {
    var elements_to_return_array = [];
    if (plural) {
      var from = element_array.length;
      element_array = element_array.concat(elements);
      for (var i = from; i < element_array.length; i++) {
        elements_to_return_array.push('element/' + i);
      }
    } else {
      if (!elements[0]) {
        port.postMessage({response: "get element", status: false, by: lookup_by, value: lookup_value});
        return;
      }
      element_array.push(elements[0]);
      elements_to_return_array.push('element/' + (element_array.length - 1));
    }
    port.postMessage({response: "get element", status: true, "elements": elements_to_return_array});
    return;
  }
}

function getElementsByLinkText(parent, link_text) {
  var links = parent.getElementsByTagName("a");
  var matching_links = [];
  for (var i = 0; i < links.length; i++) {
    if (Utils.getText(links[i]) == link_text) {
      matching_links.push(links[i]);
    }
  }
  return matching_links;
}

function getElementsByPartialLinkText(parent, partial_link_text) {
  var links = parent.getElementsByTagName("a");
  var matching_links = [];
  for (var i = 0; i < links.length; i++) {
    if (Utils.getText(links[i]).indexOf(partial_link_text) > -1) {
      matching_links.push(links[i]);
    }
  }
  return matching_links;
}

function get_element_attribute(element_id, attribute) {
  if ((element = internal_get_element(element_id)) != null) {
    var value = element.getAttribute(attribute);
    switch (attribute.toLowerCase()) {
    case "disabled":
      value = (element.disabled ? element.disabled : "false");
      break;
    case "selected":
      value = (element.selected ? element.selected : "false");
      break;
    case "checked":
      value = (element.checked ? element.checked : "false");
      break;
    case "index":
      value = element.index;
      break;
    }
    port.postMessage({response: "get element attribute", status: true, value: value});
  } else {
    port.postMessage({response: "get element attribute", status: false, attribute: attribute});
  }
}

function get_element_text(element_id) {
  port.postMessage({response: "get element text", value: Utils.getText(element_array[element_id])});
}

function send_element_keys(element_id, value) {
  if ((element = internal_get_element(element_id)) != null) {
    element.focus();
    port.postMessage({response: "send element keys", status: true, value: value});
  } else {
    port.postMessage({response: "send element keys", status: false, value: ""});
  }
}

function clear_element(element_id) {
  if ((element = internal_get_element(element_id)) != null) {
    element.value = '';
    port.postMessage({response: "clear element", status: true});
  } else {
    port.postMessage({response: "clear element", status: false});
  }
}

function click_element(element_id) {
  if ((element = internal_get_element(element_id)) != null) {
    var coords = find_element_coords(element);
    port.postMessage({response: "click element", status: true, x: coords[0], y: coords[1]});
  } else {
    port.postMessage({response: "click element", status: false, x: -1, y: -1});
  }
}

function submit_element(element_id) {
  var element = internal_get_element(element_id);
  while (element != null) {
    if (element.tagName.toLowerCase() == "form") {
      element.submit();
      port.postMessage({response: "submit element", status: true});
    }
    element = element.parentElement;
  }
  port.postMessage({response: "submit element", status: false});
}

function selectElement(element_id) {
  if ((element = internal_get_element(element_id)) != null && element.disabled) {
    port.postMessage({response: "select element", status: false, message: "Can only select things which are enabled"});
    return;
  }
  if (doSelectElement(element, true, true)) {
    port.postMessage({response: "select element", status: true});
  } else {
    port.postMessage({response: "select element", status: false, message: "Can only select options, checkboxes and radio inputs"});
  }
}

function toggleElement(element_id) {
  if ((element = internal_get_element(element_id)) != null && element.disabled) {
    port.postMessage({response: "toggle element", status: false, message: "Can only toggle things which are enabled"});
    return;
  }
  if (doSelectElement(element, !doIsElementSelected(element_id), false)) {
    port.postMessage({response: "toggle element", status: true, selected: doIsElementSelected(element_id)});
  } else {
    port.postMessage({response: "toggle element", status: false, message: "Can only toggle multiselect options and checkboxes"});
  }
}

function is_element_selected(element_id) {
  port.postMessage({response: "is element selected", value: doIsElementSelected(element_id)});
}

function is_element_enabled(element_id) {
  if ((element = internal_get_element(element_id)) != null) {
    port.postMessage({response: "is element enabled", value: !element.disabled});
  }
}

function getTagName(element_id) {
  if ((element = internal_get_element(element_id)) != null) {
    port.postMessage({response: "tag name", status: true, tagName: element.tagName.toLowerCase()});
  } else {
    port.postMessage({response: "tag name", status: false});
  }
}

function getCookies() {
  var cookies = [];
  var cookie_strings = getAllCookies();
  for (var i = 0; i < cookie_strings.length; ++i) {
    var cookie = cookie_strings[i].split("=");
    cookies.push({name: cookie[0], value: cookie[1], secure: false, "class": "org.openqa.selenium.internal.ReturnedCookie"});
  }
  port.postMessage({response: "get cookies", "cookies": cookies});
}

function deleteAllCookies() {
  var cookies = getAllCookies();
  for (var i = 0; i < cookies.length; ++i) {
    var cookie = cookies[i].split("=");
    deleteCookie(cookie[0]);
  }
  port.postMessage({response: "delete all cookies", status: true});
}

function getSource() {
  if (guessPageType() == "html") {
    console.log("Source: " + document.getElementsByTagName("html")[0].outerHTML);
    port.postMessage({response: "get source", source: document.getElementsByTagName("html")[0].outerHTML});
  } else if (guessPageType() == "text") {
    port.postMessage({response: "get source", source: document.getElementsByTagName("pre")[0].innerHTML});
  }
}



function find_element_coords(element) {
  var x = y = 0;
  do {
    x += element.offsetLeft;
    y += element.offsetTop;
  } while (element = element.offsetParent);
  return [x, y];
}

function get_xpath_of_element(element) {
  var path = "";
  for (; element && element.nodeType == 1; element = element.parentNode) {
    index = get_element_index(element);
    path = "/" + element.tagName + "[" + index + "]" + path;
  }
  return path;	
}

function get_element_index(element) {
  var index = 1;
  for (var sibling = element.previousSibling; sibling ; sibling = sibling.previousSibling) {
    if (sibling.nodeType == 1 && sibling.tagName == element.tagName) {
      index++
    }
  }
  return index;
}

function get_elements_by_xpath(xpath) {
  var elements = [];
  var found_elements = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
  var this_element = found_elements.iterateNext();
  while (this_element) {
    elements.push(this_element);
    this_element = found_elements.iterateNext();
  }
  return elements;
}

function internal_get_element(element_id) {
  if (element_id != null && element_array.length >= element_id + 1) {
    return element_array[element_id];
  } else {
    return null;
  }
}

function getCookie(name) {
  if (document.cookie.length > 0) {
    var index = document.cookie.indexOf(name + '=');
    var cookie = '';
    if (index == -1) {
      var start = index + name.length + 1;
      return unescape(document.cookie.substring(start, document.cookie.indexOf(";",start)));
    }
  }
  //TODO(danielwh): Fail somehow
}

function getAllCookies() {
  var cookie_strings = document.cookie.split('; ');
  var cookies = [];
  for (var i = 0; i < cookie_strings.length; ++i) {
    if (cookie_strings[i] == '') {
      break;
    }
     cookies.push(cookie_strings[i]);
  }
   return cookies;
}

function setCookie(cookie) {
  var currLocation = document.location;
  var currDomain = currLocation.host;
  if (currLocation.port != 80) { currDomain += ":" + currLocation.port; }
  if (cookie.domain != null && cookie.domain != undefined &&
      currDomain.indexOf(cookie.domain) == -1) {
      // Not quite right, but close enough. (See r783)
    port.postMessage({response: "add cookie", status: false,
        message: "You may only set cookies for the current domain"});
    return;
    } else if (guessPageType() != "html") {
      port.postMessage({response: "add cookie", status: false,
          message: "You may only set cookies on html documents"});
      return;
  } else {
    document.cookie = cookie.name + '=' + escape(cookie.value) +
        ((cookie.expiry == null || cookie.expiry == undefined) ?
            '' : ';expires=' + (new Date(cookie.expiry.time)).toGMTString()) +
        ((cookie.path == null || cookie.path == undefined) ?
            '' : ';path=' + cookie.path);
    port.postMessage({response: "add cookie", status: true});
    return;
  }
}

function deleteCookie(name) {
  document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

/**
 * @param allowSingular Whether we allow this element to be selected,
 *                      even if it can't necessarily be un-selected
 */
function doSelectElement(element, select, allowSingular) {
  var hasSelected = false;
  try {
    var tagName = element.tagName.toLowerCase();
    //TODO(danielwh): Find parent which is select
    if (tagName == "option") {
      var parent = element;
      while (parent != null && parent.tagName.toLowerCase() != "select") {
        parent = parent.parentElement;
      }
      if (allowSingular || parent.multiple) {
        element.selected = select;
        hasSelected = true;
      }
    } else if (tagName == "input") {
      var type = element.getAttribute("type").toLowerCase();
      if (type == "checkbox") {
        element.checked = select;
        hasSelected = true;
      } else if (allowSingular && type == "radio") {
        element.checked = select;
        hasSelected = true;
      }
    }
  } catch (e) {
    //TODO(danielwh): Fail somehow
  }
  return hasSelected;
}

function doIsElementSelected(element_id) {
  var selected = false;
  if ((element = internal_get_element(element_id)) != null) {
    try {
      var tagName = element.tagName.toLowerCase();
      if (tagName == "option") {
        selected = element.selected;
      } else if (tagName == "input") {
        var type = element.getAttribute("type").toLowerCase();
        if (type == "checkbox" || type == "radio") {
          selected = element.checked;
        }
      }
    } catch (e) {
      //TODO(danielwh): Fail somehow
    }
  }
  return selected;
}

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
