// Copyright 2011 Software Freedom Conservancy
// Licensed under the Apache License, Version 2.0 (the "License");
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

#ifndef WEBDRIVER_IE_DELETECOOKIECOMMANDHANDLER_H_
#define WEBDRIVER_IE_DELETECOOKIECOMMANDHANDLER_H_

#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"

namespace webdriver {

class DeleteCookieCommandHandler : public IECommandHandler {
 public:
  DeleteCookieCommandHandler(void) {
  }

  virtual ~DeleteCookieCommandHandler(void) {
  }

 protected:
  void ExecuteInternal(const IECommandExecutor& executor,
                       const LocatorMap& locator_parameters,
                       const ParametersMap& command_parameters,
                       Response* response) {
    LocatorMap::const_iterator name_parameter_iterator = locator_parameters.find("name");
    if (name_parameter_iterator == locator_parameters.end()) {
      response->SetErrorResponse(400, "Missing parameter in URL: name");
      return;
    }

    std::string cookie_name = name_parameter_iterator->second;
    BrowserHandle browser_wrapper;
    int status_code = executor.GetCurrentBrowser(&browser_wrapper);
    if (status_code != SUCCESS) {
      response->SetErrorResponse(status_code, "Unable to get browser");
      return;
    }
    status_code = browser_wrapper->DeleteCookie(cookie_name);
    if (status_code != SUCCESS) {
      response->SetErrorResponse(status_code, "Unable to delete cookie");
      return;
    }

    response->SetSuccessResponse(Json::Value::null);
  }
};

} // namespace webdriver

#endif // WEBDRIVER_IE_DELETECOOKIECOMMANDHANDLER_H_
