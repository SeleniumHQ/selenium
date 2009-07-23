#include "webdriver/http_handler.h"

#include "webdriver/chrome_driver_plugin.h"
#include "webdriver/javascript_executor.h"
#include "webdriver/javascript_commands.h"
#include "webdriver/logging.h"

#include "mongoose/mongoose.h"

#include "webdriver/webdriver_utils.h"

#if defined(UNIX)
#include <stdlib.h> //for atoi
#endif

using namespace std;

namespace webdriver {

HttpHandler::HttpHandler(JavascriptExecutor *javascript_executor) :
    javascript_executor_(javascript_executor) {
}

bool HttpHandler::ValidateRequest(vector<string> uri) {
  if (uri.size() == 1 && !uri[0].compare("session")) {
    return true;
  }
  if (chrome_driver_plugin_ == NULL || !chrome_driver_plugin_->IsReady()) {
    return false;
  }
  if (uri.size() >= 2 &&
          chrome_driver_plugin_->session_id() == atoi(uri[1].c_str())) {
    //All is good
    return true;
  }
  chrome_driver_plugin_->SendGeneralFailure();
  return false;
}

void HttpHandler::set_chrome_driver_plugin(
    ChromeDriverPlugin *chrome_driver_plugin) {
  chrome_driver_plugin_ = chrome_driver_plugin;
}

void HttpHandler::HandleGet(vector<string> uri,
                            vector<HttpHeader> headers,
                            mg_connection *connection) {
  if (!ValidateRequest(uri)) {
    return;
  }
  switch (uri.size()) {
    case 3: {
      chrome_driver_plugin_->ConfirmSession();
      break;
    }
    case 4: {
      if (uri[3] == "title") {
        chrome_driver_plugin_->ExecuteJavascript(kGetTitleCommand);
      }
      break;
    }
    case 6: {
      if (uri[3] == "element") {
        if (uri[5] == "value") {
          uri[5] = ("attribute");
          uri.push_back(string("value"));
          HandleGet(uri, headers, connection);
        } else if (uri[5] == "text") {
          char *command = new char[strlen(kGetElementText) +
                                   kMaxSize_tDigits + 1];
          sprintf(command, kGetElementText,
              atoi(uri[4].c_str()));
          chrome_driver_plugin_->ExecuteJavascript(command);
          delete[] command;
        } else if (uri[5] == "selected") {
          char *command = new char[strlen(kIsElementSelected) +
                                   kMaxSize_tDigits + 1];
          sprintf(command, kIsElementSelected,
              atoi(uri[4].c_str()));
          chrome_driver_plugin_->ExecuteJavascript(command);
          delete[] command;
        }
      }
      break;
    }
    case 7: {
      if (uri[3] == "element") {
        if (uri[5] == "attribute") {
          char *command = new char[strlen(kGetElementAttribute) +
                                   kMaxSize_tDigits + uri[6].length() + 1];
          sprintf(command, kGetElementAttribute,
              atoi(uri[4].c_str()), uri[6].c_str());
          chrome_driver_plugin_->ExecuteJavascript(command);
          delete[] command;
        }
      }
      break;
    }
    default: {
      mg_printf(connection, "HTTP/1.1 400 Bad Request\r\n"
      "Content-Type: text/plain\r\n"
      "Content-Length: 19\r\n"
      "\r\nUnknown GET command");
      break;
    }
  }
}

void HttpHandler::HandlePost(vector<string> uri,
                             vector<HttpHeader> headers,
                             string post_data,
                             mg_connection *connection) {
  if (!ValidateRequest(uri)) {
    return;
  }
  const char *command = NULL;
  switch (uri.size()) {
    case 1: {
      if (uri[0] == "session") {
        command = kCreateSessionCommand;
      }
      break;
    }
    case 4: {
      if (uri[3] == "url") {
        char *guid = GenerateGuidString();
        char *buf = new char[strlen(kGetUrlCommand) + post_data.length() +
                             kMaxSize_tDigits + strlen(guid) + 1];
        sprintf(buf, kGetUrlCommand, post_data.c_str(),
                chrome_driver_plugin_->session_id(), guid);
        chrome_driver_plugin_->ExecuteJavascript(buf);
        delete[] buf;
        delete[] guid;
      } else if (uri[3] == "element") {
        command = kGetElementCommand;
      } else if (uri[3] == "elements") {
        command = kGetElementsCommand;
      }
      break;
    }
    case 5: {
      if (uri[3] == "window") {
        command = kSwitchWindow;
      }
      break;
    }
    case 6: {
      if (uri[3] == "element") {
        if (uri[5] == "value") {
          command = kSendElementKeysCommand;
        } else if (uri[5] == "clear") {
          command = kClearElementCommand;
        } else if (uri[5] == "click") {
          command = kClickElementCommand;
        } else if (uri[5] == "submit") {
          command = kSubmitElementCommand;
        }
      }
      break;
    }
    case 7: {
      if (uri[3] == "element") {
        if (uri[5] == "element") {
          command = kGetChildElementCommand;
        } else if (uri[5] == "elements") {
          command = kGetChildrenElementCommand;
        }
      }
      break;
    }
    default: {
      mg_printf(connection, "HTTP/1.1 400 Bad Request\r\n"
      "Content-Type: text/plain\r\n"
      "Content-Length: 20\r\n"
      "\r\nUnknown POST command:");
      break;
    }
  }
  if (command != NULL) {
    FillAndExecutePost(command, post_data);
  }
}

void HttpHandler::HandleDelete(vector<string> uri,
                             vector<HttpHeader> headers,
                             mg_connection *connection) {
  if (!ValidateRequest(uri)) {
    return;
  }
  switch (uri.size()) {
    case 2: {
      chrome_driver_plugin_->DeleteSession();
      break;
    }
    default: {
      mg_printf(connection, "HTTP/1.1 400 Bad Request\r\n"
      "Content-Type: text/plain\r\n"
      "Content-Length: 22\r\n"
      "\r\nUnknown DELETE command:");
      break;
    }
  }
}

void HttpHandler::FillAndExecutePost(const char *command_format,
                                     string post_data) {
  char *command = new char[strlen(command_format) + post_data.length() + 1];
  sprintf(command, command_format, post_data.c_str());
  WEBDRIVER_LOG("Executing: ");
  WEBDRIVER_LOG(command);
  WEBDRIVER_LOG("\n");
  chrome_driver_plugin_->ExecuteJavascript((command));
  delete[] command;
}

} //namespace webdriver
