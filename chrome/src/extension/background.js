ports = new Array();

active_port = null;

primary_display_tab_id = null;

chrome.self.onConnect.addListener(function(port) {
  console.log("Connected");
  ports.push(port);
  active_port = port;
  port.onMessage.addListener(parse_port_message);
});

function parse_port_message(message) {
  console.log("Received response to: " + message.response);
  switch(message.response) {
  case "title":
    document.embeds[0].return_get_title_success(message.title);
    break;
  case "inject embed":
    active_port.postMessage({request: "remove embed", uuid: message.uuid});
    break;
  case "remove embed":
    document.embeds[0].confirm_url_loaded();
    break;
  case "get element":
    if (message.status) {
      document.embeds[0].return_get_elements(message.elements);
    } else {
      document.embeds[0].return_get_elements_failed(message.by + " '" + message.value + "'");
    }
    break;
  case "get element attribute":
    document.embeds[0].return_get_element_attribute(message.value);
    break;
  case "is element selected":
    document.embeds[0].return_is_element_selected(message.value);
    break;
  case "get element text":
    document.embeds[0].return_get_element_text(message.value);
    break;
  case "send element keys":
    document.embeds[0].return_send_element_keys(message.status, message.value);
    break;
  case "clear element":
    document.embeds[0].return_clear_element(message.status);
    break;
  case "click element":
    document.embeds[0].return_click_element(message.status, message.x, message.y);
    break;
  case "submit element":
    document.embeds[0].return_submit_element(message.status);
    break;
  }
}

function get_element_attribute(element_id, attribute) {
  document.embeds[0].return_get_element_attribute(
      element_array[element_id].getAttribute(attribute));
}

function get_element_text(element_id) {
  document.embeds[0].return_element_text(element_array[element_id].innerText);
}

function create_session(capabilities) {
  var start_session_request = JSON.parse(capabilities);
  //TODO(danielwh): Better check for OS
  if (start_session_request[0].platform == "WINDOWS" && start_session_request[0].browserName == "chrome") {
    document.embeds[0].approve_session(JSON.stringify(start_session_request[0]));
  } else {
    document.embeds[0].deny_session();
  }
}

//XXX(danielwh): This may change to a chrome.tabs.onCreated/onUpdated/onRemoved event listener, if it turns out to conflict with multiple windows
function get_url(url_json, session_id, uuid) {
  var url_string = JSON.parse(url_json)[0];
  active_port = null;
  if (primary_display_tab_id) {
    chrome.tabs.remove(primary_display_tab_id);
  }
  primary_display_tab_id = null;
  g_session_id = session_id;
  g_uuid = uuid;
  chrome.tabs.create({url: url_string, selected: true}, get_url_loaded_callback_first_time);
}

function get_url_loaded_callback() {
  document.embeds[0].confirm_url_loaded();
}

function get_url_loaded_callback_first_time(tab) {
  if (tab && tab.status != "complete" || !active_port) {
    setTimeout("get_url_check_loaded_first_time(" + tab.id + ")", 10);
  } else {
    primary_display_tab_id = tab.id;
    active_port.postMessage({request: "inject embed", session_id: g_session_id, uuid: g_uuid});
    g_session_id = null;
    g_uuid = null;
  }
}

function get_url_check_loaded_first_time(tab_id) {
  chrome.tabs.get(tab_id, get_url_loaded_callback_first_time);
}

function get_title() {
  active_port.postMessage({request: "title"});
}

function get_element(plural, json_lookup) {
  active_port.postMessage({request: "get element", "plural": plural, "json_lookup": json_lookup});
}

function get_element_attribute(element_id, attribute) {
  active_port.postMessage({request: "get element attribute", "element_id": element_id, "attribute": attribute});
}

function is_element_selected(element_id) {
  active_port.postMessage({request: "is element selected", "element_id": element_id});
}

function get_element_text(element_id) {
  active_port.postMessage({request: "get element text", "element_id": element_id});
}

function send_element_keys(json_param) {
  active_port.postMessage({request: "send element keys", "json_param": json_param});
}

function clear_element(json_param) {
  active_port.postMessage({request: "clear element", "json_param": json_param});
}

function click_element(json_param) {
  active_port.postMessage({request: "click element", "json_param": json_param});
}

function submit_element(json_param) {
  active_port.postMessage({request: "submit element", "json_param": json_param});
}