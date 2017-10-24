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

#include "GetAllCookiesCommandHandler.h"
#include "errorcodes.h"
#include "../Browser.h"
#include "../BrowserCookie.h"
#include "../CookieManager.h"
#include "../IECommandExecutor.h"

namespace webdriver {

GetAllCookiesCommandHandler::GetAllCookiesCommandHandler(void) {
}

GetAllCookiesCommandHandler::~GetAllCookiesCommandHandler(void) {
}

void GetAllCookiesCommandHandler::ExecuteInternal(
    const IECommandExecutor& executor,
    const ParametersMap& command_parameters,
    Response* response) {
  Json::Value response_value(Json::arrayValue);
  BrowserHandle browser_wrapper;
  int status_code = executor.GetCurrentBrowser(&browser_wrapper);
  if (status_code != WD_SUCCESS) {
    response->SetErrorResponse(status_code, "Unable to get browser");
    return;
  }

  std::vector<BrowserCookie> cookies;
  status_code = browser_wrapper->cookie_manager()->GetCookies(
      browser_wrapper->GetCurrentUrl(),
      &cookies);
  if (status_code == EUNHANDLEDERROR) {
    std::string error = "Could not retrieve cookies. The most common cause ";
    error.append("of this error is a mismatch in the bitness between the ");
    error.append("driver and browser. In particular, be sure you are not ");
    error.append("attempting to use a 64-bit IEDriverServer.exe against ");
    error.append("IE 10 or 11, even on 64-bit Windows.");
    response->SetErrorResponse(status_code, error);
    return;
  }
  std::vector<BrowserCookie>::iterator it = cookies.begin();
  for (; it != cookies.end(); ++it) {
    response_value.append(it->ToJson());
  }

  response->SetSuccessResponse(response_value);
}

} // namespace webdriver
