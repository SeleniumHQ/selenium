var port = chrome.extension.connect();

port.onMessage.addListener(parse_port_message);

element_array = new Array();

function parse_port_message(message) {
  console.log("Received request for: " + message.request);
  switch (message.request) {
  case "title":
    port.postMessage({response: "title", title: document.title});
    break;
  case "inject embed":
    inject_webdriver_embed(message.session_id, message.uuid);
    break;
  case "remove embed":
    remove_webdriver_embed(message.uuid);
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
  case "is element selected":
    is_element_selected(message.element_id);
    break;
  case "get element text":
    get_element_text(message.element_id);
    break;
  case "send element keys":
    send_element_keys(message.value);
    break;
  case "clear element":
    clear_element(message.json_param);
    break;
  case "click element":
    click_element(message.json_param);
    break;
  case "submit element":
    submit_element(message.json_param);
    break;
  case "url":
    port.postMessage({response: "url", url: document.location.href});
    break;
  }
}

function inject_webdriver_embed(session_id, uuid) {
  console.log("Injecting: " + session_id + ", " + uuid);
  var embed = document.createElement('embed');
  embed.setAttribute("type", "application/x-webdriver-reporter");
  embed.setAttribute("session_id", session_id);
  embed.setAttribute("id", uuid);
  document.getElementsByTagName("body")[0].appendChild(embed);
  port.postMessage({response: "inject embed", "uuid": uuid});
}

function remove_webdriver_embed(uuid) {
  //TODO(danielwh): See just how much of a race condition we have here between browser rendering the embed, and message being sent
  document.getElementsByTagName("body")[0].removeChild(document.getElementById(uuid));
  port.postMessage({response: "remove embed"});
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
  
  var elements = new Array();
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
    var elements_array = new Array();
    //var elements_id_string = '[';
    if (plural) {
      var from = element_array.length;
      element_array = element_array.concat(elements);
      for (var i = from; i < element_array.length; i++) {
        elements_array.push('element/' + i);
      }
    } else {
      if (!elements[0]) {
        port.postMessage({response: "get element", status: false, by: lookup_by, value: lookup_value});
        return;
      }
      element_array.push(elements[0]);
      elements_array.push('element/' + (element_array.length - 1));
    }
    port.postMessage({response: "get element", status: true, "elements": elements_array});
    return;
  }
}

function getElementsByLinkText(parent, link_text) {
  //TODO(danielwh): Check that this works for children
  var links = parent.getElementsByTagName("a");
  var matching_links = new Array();
  for (var i = 0; i < links.length; i++) {
    if (links[i].innerText == link_text) {
      matching_links.push(links[i]);
    }
  }
  return matching_links;
}

function getElementsByPartialLinkText(parent, partial_link_text) {
  var links = parent.getElementsByTagName("a");
  var matching_links = new Array();
  for (var i = 0; i < links.length; i++) {
    if (links[i].innerText.indexOf(partial_link_text) > -1) {
      matching_links.push(links[i]);
    }
  }
  return matching_links;
}

function get_element_attribute(element_id, attribute) {
  port.postMessage({response: "get element attribute", value: element_array[element_id].getAttribute(attribute)});
}

function get_element_text(element_id) {
  port.postMessage({response: "get element text", value: element_array[element_id].innerText});
}

function send_element_keys(request) {
  if (parseInt(request.id) != null && element_array.length >= parseInt(request.id) + 1) {
    element_array[request.id].focus();
    port.postMessage({response: "send element keys", status: true, value: request.value[0]});
  } else {
    port.postMessage({response: "send element keys", status: false, value: ""});
  }
}

function clear_element(json_param) {
  var request = JSON.parse(json_param)[0];
  if (parseInt(request.id) != null && element_array.length >= parseInt(request.id) + 1) {
    element_array[request.id].value = '';
    port.postMessage({response: "clear element", status: true});
  } else {
    port.postMessage({response: "clear element", status: false});
  }
}

function click_element(json_param) {
  var request = JSON.parse(json_param)[0];
  var request_id = parseInt(request.id);
  if (parseInt(request.id) != null && element_array.length >= request_id + 1) {
    var coords = find_element_coords(element_array[request_id]);
    port.postMessage({response: "click element", status: true, x: coords[0], y: coords[1]});
  } else {
    port.postMessage({response: "click element", status: false, x: -1, y: -1});
  }
}

function submit_element(json_param) {
  var request = JSON.parse(json_param)[0];
  var request_id = parseInt(request.id);
  if (parseInt(request.id) != null && element_array.length >= request_id + 1) {
    element_array[request_id].submit();
    port.postMessage({response: "submit element", status: true});
  } else {
    port.postMessage({response: "submit element", status: false});
  }
}

function is_element_selected(element_id) {
  var element = element_array[element_id];
  var selected = false;
  try {
    var type = element.getAttribute("type").toLowerCase();
    if (type == "option") {
      selected = element.selected;
    } else if (type == "checkbox" || type == "radio") {
      selected = element.checked;
    }
  } catch(e) {}
  port.postMessage({response: "is element selected", value: selected});
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
  var elements = new Array();
  var found_elements = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
  var this_element = found_elements.iterateNext();
  while (this_element) {
    elements.push(this_element);
    this_element = found_elements.iterateNext();
  }
  return elements;
}