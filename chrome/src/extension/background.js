//TODO(danielwh): Add failure HTTP messages if things unexpectedly faily
//TODO(danielwh): A nice consistent naming convention

ports = [];

active_port = null;
primary_display_tab_id = null;
session_id_ = null;
context_ = null;
capabilities_ = null;
path_offset_ = 1; //TODO(danielwh): Grab this from the initial URL

chrome.self.onConnect.addListener(function(port) {
  console.log("Connected");
  ports.push(port);
  active_port = port; //TODO(danielwh): Probably move this
  port.onMessage.addListener(parse_port_message);
});

function parse_port_message(message) {
  console.log("Received response to: " + message.response);
  switch(message.response) {
  case "title":
    SendValue(message.title);
    break;
  case "inject embed":
    active_port.postMessage({request: "remove embed", uuid: message.uuid});
    break;
  case "remove embed":
    SendNoContent();
    break;
  case "get element":
    if (message.status) {
      SendValue(message.elements);
    } else {
      SendNotFound({message: "Unable to locate element with " + message.by + " " + message.value, class: "org.openqa.selenium.NoSuchElementException"});
    }
    break;
  case "get element attribute":
    if (message.status) {
      SendValue(message.value);
    } else {
      SendNotFound({message: "An error occured while finding attribute of " + message.attribute + " " + message.value, class: "org.openqa.selenium.NotFoundException"});
    }
    break;
  case "get element value":
    SendValue(message.value);
    break;
  case "is element selected":
    SendValue(message.value);
    break;
  case "get element text":
    SendValue(message.value);
    break;
  case "send element keys":
    document.embeds[0].return_send_element_keys(message.status, message.value);
    break;
  case "clear element":
    if (message.status) {
      SendNoContent();
    }
    break;
  case "click element":
    document.embeds[0].return_click_element(message.status, message.x, message.y);
    break;
  case "submit element":
    if (message.status) {
      SendNoContent();
    }
    break;
  case "url":
    SendValue(message.url);
    break;
  case "add cookie":
    if (message.status) {
      SendNoContent();
    } else {
      SendNotFound({message: message.message, class: "org.openqa.selenium.WebDriverException"});
    }
    break;
  case "delete cookie":
    if (message.status) {
      SendNoContent();
    }
    break;
  case "get cookies":
    SendValue(message.cookies);
    break;
  case "delete all cookies":
    if (message.status) {
      SendNoContent();
    }
    break;
  }
}

function HandleGet(uri) {
  var path = uri.split("/").slice(path_offset_);
  if (path.length < 3 || path[0] != "session" || path[1] != session_id_) {
    //TODO(danielwh): Fail with an HTTP message
    console.log("Invalid session setup");
    return;
  }
  switch (path.length) {
  case 3:
    SendValue(capabilities_);
    break;
  case 4:
    switch (path[3]) {
    case "title":
      active_port.postMessage({request: "title"});
      break;
    case "url":
      active_port.postMessage({request: "url"});
      break;
    case "cookie":
      active_port.postMessage({request: "get cookies"});
      break;
    }
    break;
  case 6:
    if (path[3] == "element") {
      var element_id = parseInt(path[4]);
      if (element_id == null) {
        //TODO(danielwh): Fail with an HTTP message
        console.log("Not an integer element id: " + path[4]);
        return;
      }
      switch (path[5]) {
      case "value":
        active_port.postMessage({request: "get element value", "element_id": element_id});
        break;
      case "text":
        active_port.postMessage({request: "get element text", "element_id": element_id});
        break;
      case "selected":
        active_port.postMessage({request: "is element selected", "element_id": element_id});
        break;
      }
    }
    break;
  case 7:
    if (path[3] == "element" && path[5] == "attribute") {
      var element_id = parseInt(path[4]);
      if (element_id == null) {
        //TODO(danielwh): Fail with an HTTP message
        console.log("Not an integer element id: " + path[4]);
        return;
      }
      active_port.postMessage({request: "get element attribute", "element_id": element_id, "attribute": path[6]});
    }
    break;
  }
}

function HandlePost(uri, post_data, session_id, context) {
  if (!session_id_) {
    session_id_ = session_id;
  }
  if (!context_) {
    context_ = context;
  }
  var path = uri.split("/").slice(path_offset_);
  var value = JSON.parse(post_data);
  switch (path.length) {
  case 1:
    if (path[0] == "session") {
      create_session(value);
    }
    break;
  case 4:
    switch (path[3]) {
    case "element":
      active_port.postMessage({request: "get element", value: value});
      break;
    case "elements":
      active_port.postMessage({request: "get elements", value: value});
      break;
    case "cookie":
      var cookie = JSON.parse(post_data)[0];
      if (cookie.class == "org.openqa.selenium.Cookie") {
        active_port.postMessage({request: "add cookie", cookie: cookie});
      } else {
        //TODO(danielwh): Fail somehow
      }
      break;
    }
    break;
  case 6:
    if (path[3] == "element") {
      element_id = parseInt(value[0].id);
      switch (path[5]) {
      case "value":
        active_port.postMessage({request: "send element keys",
                                 "element_id": element_id,
                                 "value": value[0].value[0]});
        break;
      case "clear":
        active_port.postMessage({request: "clear element", "element_id": element_id});
        break;
      case "click":
        active_port.postMessage({request: "click element", "element_id": element_id});
        break;
      case "submit":
        active_port.postMessage({request: "submit element", "element_id": element_id});
        break;
       }
     }
     break;
  case 7:
    if (path[3] == "element") {
      switch (path[5]) {
      case "element":
        active_port.postMessage({request: "get element", "value": value});
        break;
      case "elements":
        active_port.postMessage({request: "get elements", "value": value});
        break;
      }
    }
  }
}

function HandleDelete(uri) {
  var path = uri.split("/").slice(path_offset_);
  switch (path.length) {
  case 2:
    if (path[0] == "session" && path[1] == session_id_) {
      SendNoContent();
    }
    break;
  case 4:
    if (path[3] == "cookie") {
      active_port.postMessage({request: "delete all cookies"});
    }
    break;
  case 5:
    if (path[3] == "cookie") {
      active_port.postMessage({request: "delete cookie", name: path[4]});
    }
    break;
  }
}

//TODO(danielwh): Some kind of filtering so that arbitrary HTTP can't be sent by random javascript
function SendHttp(http) {
  console.log("Sending HTTP: " + http);
  document.embeds[0].SendHttp(http);
}

function SendNoContent() {
  SendHttp("HTTP/1.1 204 No Content");
}

function SendNotFound(value) {
  var response_data = '{"error":true,"sessionId":\"%u\",' +
      '"context":"' + context_ + '","value":' + JSON.stringify(value) + 
      ',"class":"org.openqa.selenium.remote.Response"}';
  var response = "HTTP/1.1 404 Not Found" +
      "\r\nContent-Length: " + response_data.length +
      "\r\nContent-Type: application/json; charset=ISO-8859-1" +
      "\r\n\r\n" + response_data;
  SendHttp(response);
}

function SendValue(value) {
  var response_data = '{"error":false,"sessionId":"' + session_id_ + 
      '","value":' + JSON.stringify(value) + ',"context":"' + context_ + 
      '","class":"org.openqa.selenium.remote.Response"}';
  
  var response = "HTTP/1.1 200 OK" +
      "\r\nContent-Length: " + response_data.length + 
      "\r\nContent-Type: application/json; charset=ISO-8859-1" +
      "\r\n\r\n" + response_data;
  SendHttp(response);
}

function create_session(request) {
  capabilities_ = request[0];
  //TODO(danielwh): Better check for OS
  //TODO(danielwh): Don't hard code url or port
  if (request[0].platform == "WINDOWS" && request[0].browserName == "chrome") {
    var response = "HTTP/1.1 302 Found" +
    "\r\nLocation: http://localhost:7601/session/" + session_id_ + "/" + context_ +
    "\r\nContent-Length: 0";
    SendHttp(response);
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
