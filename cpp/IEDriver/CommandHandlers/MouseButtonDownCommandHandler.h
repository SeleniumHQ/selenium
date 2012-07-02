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

#ifndef WEBDRIVER_IE_MOUSEBUTTONDOWNCOMMANDHANDLER_H_
#define WEBDRIVER_IE_MOUSEBUTTONDOWNCOMMANDHANDLER_H_

#include "interactions.h"
#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"

namespace webdriver {

class MouseButtonDownCommandHandler : public IECommandHandler {
 public:
  MouseButtonDownCommandHandler(void) {
  }

  virtual ~MouseButtonDownCommandHandler(void) {
  }

 protected:
  void ExecuteInternal(const IECommandExecutor& executor,
                       const LocatorMap& locator_parameters,
                       const ParametersMap& command_parameters,
                       Response* response) {
    BrowserHandle browser_wrapper;
    int status_code = executor.GetCurrentBrowser(&browser_wrapper);
    if (status_code != SUCCESS) {
      response->SetErrorResponse(status_code, "Unable to get current browser");
      return;
    }

    if (executor.enable_native_events()) {
      HWND browser_window_handle = browser_wrapper->GetWindowHandle();
      //TODO: json wire protocol allows 3 mouse button types for this command
      mouseDownAt(browser_window_handle,
                  executor.last_known_mouse_x(),
                  executor.last_known_mouse_y(),
                  MOUSEBUTTON_LEFT);
      response->SetSuccessResponse(Json::Value::null);
    } else {
      std::wstring script_source = L"(function() { return function(){" + 
                                    atoms::asString(atoms::INPUTS) + 
                                    L"; return webdriver.atoms.inputs.mouseButtonDown(arguments[0]);" + 
                                    L"};})();";

      CComPtr<IHTMLDocument2> doc;
      browser_wrapper->GetDocument(&doc);
      Script script_wrapper(doc, script_source, 1);
      script_wrapper.AddArgument(executor.mouse_state());
      status_code = script_wrapper.Execute();
      if (status_code == SUCCESS) {
        IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
        mutable_executor.set_mouse_state(script_wrapper.result());
      } else {
        LOG(WARN) << "Unable to execute js to perform mouse button down";
      }
    }
  }
};

} // namespace webdriver

#endif // WEBDRIVER_IE_MOUSEBUTTONDOWNCOMMANDHANDLER_H_
