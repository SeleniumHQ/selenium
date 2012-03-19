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
#ifndef WEBDRIVER_IE_MAXIMIZEWINDOWCOMMANDHANDLER_H_
#define WEBDRIVER_IE_MAXIMIZEWINDOWCOMMANDHANDLER_H_

#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"

namespace webdriver {

class MaximizeWindowCommandHandler : public IECommandHandler {
 public:
  MaximizeWindowCommandHandler(void) {
  }

  virtual ~MaximizeWindowCommandHandler(void) {
  }

 protected:
  void ExecuteInternal(const IECommandExecutor& executor,
                       const LocatorMap& locator_parameters,
                       const ParametersMap& command_parameters,
                       Response* response) {
    LocatorMap::const_iterator id_parameter_iterator = locator_parameters.find("windowHandle");
    if (id_parameter_iterator == locator_parameters.end()) {
      response->SetErrorResponse(400, "Missing parameter in URL: windowHandle");
      return;
    } else {
      int status_code = SUCCESS;
      std::string window_id = id_parameter_iterator->second;

      BrowserHandle browser_wrapper;
      if (window_id == "current") {
        status_code = executor.GetCurrentBrowser(&browser_wrapper);
      } else {
        status_code = executor.GetManagedBrowser(window_id, &browser_wrapper);
      }
      if (status_code != SUCCESS) {
        response->SetErrorResponse(status_code, "Error retrieving window with handle " + window_id);
        return;
      }

      HWND window_handle = browser_wrapper->GetTopLevelWindowHandle();
      if (!::IsZoomed(window_handle)) {
        ::ShowWindow(window_handle, SW_MAXIMIZE);
      }
      response->SetSuccessResponse(Json::Value::null);
    }
  }
};

} // namespace webdriver

#endif // WEBDRIVER_IE_MAXIMIZEWINDOWCOMMANDHANDLER_H_
