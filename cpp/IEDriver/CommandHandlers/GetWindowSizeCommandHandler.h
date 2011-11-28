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
#ifndef WEBDRIVER_IE_GETWINDOWSIZECOMMANDHANDLER_H_
#define WEBDRIVER_IE_GETWINDOWSIZECOMMANDHANDLER_H_

#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"
#include "../Generated/atoms.h"

namespace webdriver {

class GetWindowSizeCommandHandler : public IECommandHandler {
 public:
  GetWindowSizeCommandHandler(void) {
  }

  virtual ~GetWindowSizeCommandHandler(void) {
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

      // Though there is an atom for getting window size, we cannot use it
      // as IE doesn't allow JavaScript to get the outer window dimensions
      // (including chrome).
      HWND browser_window_handle = browser_wrapper->GetTopLevelWindowHandle();
      RECT window_rect;
      ::GetWindowRect(browser_window_handle, &window_rect);
      Json::Value response_value;
      response_value["width"] = window_rect.right - window_rect.left;
      response_value["height"] = window_rect.bottom - window_rect.top;
      response->SetSuccessResponse(response_value);
    }
  }
};

} // namespace webdriver

#endif // WEBDRIVER_IE_GETWINDOWSIZECOMMANDHANDLER_H_
