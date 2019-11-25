// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#include "AddCookieCommandHandler.h"
#include <ctime>
#include "errorcodes.h"
#include "../Browser.h"
#include "../BrowserCookie.h"
#include "../CookieManager.h"
#include "../IECommandExecutor.h"

#define MAX_EXPIRATION_SECONDS 2147483647

namespace webdriver {

AddCookieCommandHandler::AddCookieCommandHandler(void) {
}

AddCookieCommandHandler::~AddCookieCommandHandler(void) {
}

void AddCookieCommandHandler::ExecuteInternal(
    const IECommandExecutor& executor,
    const ParametersMap& command_parameters,
    Response* response) {
  ParametersMap::const_iterator cookie_parameter_iterator = command_parameters.find("cookie");
  if (cookie_parameter_iterator == command_parameters.end()) {
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT, "Missing parameter: cookie");
    return;
  }

  Json::Value cookie_value = cookie_parameter_iterator->second;
  BrowserCookie cookie = BrowserCookie::FromJson(cookie_value);

  if (cookie.expiration_time() > MAX_EXPIRATION_SECONDS) {
    time_t current_time;
    time(&current_time);
    time_t max_time = current_time + MAX_EXPIRATION_SECONDS;
    std::vector<char> raw_formatted_time(30);
    tm time_info;
    gmtime_s(&time_info, &max_time);
    std::string format_string = "%a, %d %b %Y %H:%M:%S GMT";
    strftime(&raw_formatted_time[0], 30, format_string.c_str(), &time_info);
    std::string formatted_time(&raw_formatted_time[0]);

    std::string error_message = "Internet Explorer does not allow cookies to ";
    error_message.append("be set more than ");
    error_message.append(std::to_string(MAX_EXPIRATION_SECONDS)).append(" ");
    error_message.append("(2 ^ 32 - 1) seconds into the future, or ");
    error_message.append(formatted_time).append(". This ia a limitaton of ");
    error_message.append("the browser, not the driver.");
    response->SetErrorResponse(ERROR_UNABLE_TO_SET_COOKIE, error_message);
    return;
  }

  BrowserHandle browser_wrapper;
  int status_code = executor.GetCurrentBrowser(&browser_wrapper);
  if (status_code != WD_SUCCESS) {
    response->SetErrorResponse(status_code, "Unable to get current browser");
    return;
  }

  size_t last_path_slash_index = cookie.path().find_last_of("/");
  if (last_path_slash_index != std::string::npos) {
    std::string last_path_segment = cookie.path().substr(last_path_slash_index);
    if (last_path_segment.size() > 1 &&
      last_path_segment.find(".") != std::string::npos) {
      // This algorithm is far from perfect. If the "path" property of the
      // cookie includes the document name, the cookie won't be properly set,
      // as IE's cookie handling expects a directory for path, not a file
      // or document name. Strip the last segment of the path property (if
      // if the path segment doesn't already end in a slash, and contains
      // a period).
      cookie.set_path(cookie.path().substr(0, last_path_slash_index));
    }
  }

  status_code = browser_wrapper->cookie_manager()->SetCookie(
      browser_wrapper->GetCurrentUrl(),
      cookie);

  if (status_code == EUNHANDLEDERROR) {
    std::string error = "Could not set cookie. The most common cause ";
    error.append("of this error is a mismatch in the bitness between the ");
    error.append("driver and browser. In particular, be sure you are not ");
    error.append("attempting to use a 64-bit IEDriverServer.exe against ");
    error.append("IE 10 or 11, even on 64-bit Windows.");
    response->SetErrorResponse(status_code, error);
    return;
  }
  else if (status_code != WD_SUCCESS) {
    response->SetErrorResponse(status_code, "Unable to add cookie to page");
    return;
  }

  response->SetSuccessResponse(Json::Value::null);
}

} // namespace webdriver
