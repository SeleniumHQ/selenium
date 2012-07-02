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

#ifndef WEBDRIVER_IE_MOUSECLICKCOMMANDHANDLER_H_
#define WEBDRIVER_IE_MOUSECLICKCOMMANDHANDLER_H_

#include "interactions.h"
#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"

namespace webdriver {

class MouseClickCommandHandler : public IECommandHandler {
 public:
  MouseClickCommandHandler(void) {
  }

  virtual ~MouseClickCommandHandler(void) {
  }

 protected:
  void ExecuteInternal(const IECommandExecutor& executor,
                       const LocatorMap& locator_parameters,
                       const ParametersMap& command_parameters,
                       Response* response) {
    ParametersMap::const_iterator button_parameter_iterator = command_parameters.find("button");
    if (button_parameter_iterator == command_parameters.end()) {
      response->SetErrorResponse(400, "Missing parameter: button");
      return;
    } else {
      int button = button_parameter_iterator->second.asInt();
      BrowserHandle browser_wrapper;
      int status_code = executor.GetCurrentBrowser(&browser_wrapper);
      if (status_code != SUCCESS) {
        response->SetErrorResponse(status_code,
                                   "Unable to get current browser");
        return;
      }

      if (executor.enable_native_events()) {
        HWND browser_window_handle = browser_wrapper->GetWindowHandle();
        clickAt(browser_window_handle,
                executor.last_known_mouse_x(),
                executor.last_known_mouse_y(),
                button);
      } else {
        int script_arg_count = 2;
        std::wstring script_source = L"(function() { return function(){" + 
                                     atoms::asString(atoms::INPUTS) + 
                                     L"; return webdriver.atoms.inputs.click(arguments[0], arguments[1]);" + 
                                     L"};})();";
        if (button == WD_CLIENT_RIGHT_MOUSE_BUTTON) {
          script_arg_count = 1;
          script_source = L"(function() { return function(){" + 
                         atoms::asString(atoms::INPUTS) + 
                         L"; return webdriver.atoms.inputs.rightClick(arguments[0]);" + 
                         L"};})();";
        } else if (button == WD_CLIENT_MIDDLE_MOUSE_BUTTON) {
          LOG(WARN) << "Only right and left mouse click types are supported by synthetic events. A left mouse click will be performed.";
        } else if (button < WD_CLIENT_LEFT_MOUSE_BUTTON || button > WD_CLIENT_RIGHT_MOUSE_BUTTON) {
          // Write to the log, but still attempt the "click" anyway. The atom should catch the error.
          LOG(ERROR) << "Unsupported mouse button type is specified: " << button;
        }

        CComPtr<IHTMLDocument2> doc;
        browser_wrapper->GetDocument(&doc);
        Script script_wrapper(doc, script_source, script_arg_count);

        if (script_arg_count > 1) {
          // The click input atom takes an element as its first argument,
          // but if we're passing a mouse state (which we are), it contains
          // the element we're interested in, so pass a null value. Other
          // input atoms only take a single argument.
          script_wrapper.AddNullArgument();
        }

        script_wrapper.AddArgument(executor.mouse_state());
        status_code = script_wrapper.Execute();
        if (status_code == SUCCESS) {
          IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
          mutable_executor.set_mouse_state(script_wrapper.result());
        } else {
          LOG(WARN) << "Unable to execute js to perform mouse click";
        }
      }
      response->SetSuccessResponse(Json::Value::null);
    }
  }
};

} // namespace webdriver

#endif // WEBDRIVER_IE_MOUSECLICKCOMMANDHANDLER_H_
