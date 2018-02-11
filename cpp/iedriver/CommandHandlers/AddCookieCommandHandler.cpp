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

  BrowserHandle browser_wrapper;
  int status_code = executor.GetCurrentBrowser(&browser_wrapper);
  if (status_code != WD_SUCCESS) {
    response->SetErrorResponse(status_code, "Unable to get current browser");
    return;
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
