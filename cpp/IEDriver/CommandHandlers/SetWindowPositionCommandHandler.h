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
#ifndef WEBDRIVER_IE_SETWINDOWPOSITIONCOMMANDHANDLER_H_
#define WEBDRIVER_IE_SETWINDOWPOSITIONCOMMANDHANDLER_H_

#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"
#include "../Generated/atoms.h"

namespace webdriver {

class SetWindowPositionCommandHandler : public IECommandHandler {
 public:
  SetWindowPositionCommandHandler(void) {
  }

  virtual ~SetWindowPositionCommandHandler(void) {
  }

 protected:
  void ExecuteInternal(const IECommandExecutor& executor,
                       const LocatorMap& locator_parameters,
                       const ParametersMap& command_parameters,
                       Response* response) {
    LocatorMap::const_iterator id_parameter_iterator = locator_parameters.find("windowHandle");
    ParametersMap::const_iterator x_parameter_iterator = command_parameters.find("x");
    ParametersMap::const_iterator y_parameter_iterator = command_parameters.find("y");
    if (id_parameter_iterator == locator_parameters.end()) {
      response->SetErrorResponse(400, "Missing parameter in URL: windowHandle");
      return;
    } else if (x_parameter_iterator == command_parameters.end()) {
      response->SetErrorResponse(400, "Missing parameter: x");
      return;
    } else if (y_parameter_iterator == command_parameters.end()) {
      response->SetErrorResponse(400, "Missing parameter: y");
      return;
    } else {
      int status_code = SUCCESS;
      int x = x_parameter_iterator->second.asInt();
      int y = y_parameter_iterator->second.asInt();
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
      POINT desired_location;
      desired_location.x = x;
      desired_location.y = y;
      
      BOOL set_window_pos_result = ::SetWindowPos(window_handle, NULL, desired_location.x, desired_location.y, 0, 0, SWP_NOSIZE);
      if (!set_window_pos_result) {
        response->SetErrorResponse(EUNHANDLEDERROR,
                                   "Unexpected error setting window size (SetWindowPos API failed)");
        return;
      }

      response->SetSuccessResponse(Json::Value::null);
    }
  }
};

} // namespace webdriver

#endif // WEBDRIVER_IE_SETWINDOWPOSITIONCOMMANDHANDLER_H_
