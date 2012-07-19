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

#ifndef WEBDRIVER_IE_GOTOURLCOMMANDHANDLER_H_
#define WEBDRIVER_IE_GOTOURLCOMMANDHANDLER_H_

#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"

namespace webdriver {

class GoToUrlCommandHandler : public IECommandHandler {
 public:
  GoToUrlCommandHandler(void) {
  }

  virtual ~GoToUrlCommandHandler(void) {
  }

 protected:
  void ExecuteInternal(const IECommandExecutor& executor,
                       const LocatorMap& locator_parameters,
                       const ParametersMap& command_parameters,
                       Response* response) {
    ParametersMap::const_iterator url_parameter_iterator = command_parameters.find("url");
    if (url_parameter_iterator == command_parameters.end()) {
      response->SetErrorResponse(400, "Missing parameter: url");
      return;
    } else {
      BrowserHandle browser_wrapper;
      int status_code = executor.GetCurrentBrowser(&browser_wrapper);
      if (status_code != SUCCESS) {
        response->SetErrorResponse(status_code, "Unable to get browser");
        return;
      }

      // TODO: check result for error
      std::string url = url_parameter_iterator->second.asString();
      status_code = browser_wrapper->NavigateToUrl(url);
      if (status_code != SUCCESS) {
        response->SetErrorResponse(status_code, "Failed to navigate to "
                                                    + url
                                                    + ". This usually means that a call to the COM method IWebBrowser2::Navigate2() failed.");
        return;
      }
      browser_wrapper->SetFocusedFrameByElement(NULL);
      response->SetSuccessResponse(Json::Value::null);
    }
  }
};

} // namespace webdriver

#endif // WEBDRIVER_IE_GOTOURLCOMMANDHANDLER_H_
