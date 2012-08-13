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

#ifndef WEBDRIVER_IE_SENDKEYSTOALERTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_SENDKEYSTOALERTCOMMANDHANDLER_H_

#include "../Alert.h"
#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"

namespace webdriver {

class SendKeysToAlertCommandHandler : public IECommandHandler {
 public:

  SendKeysToAlertCommandHandler(void)
  {
  }

  virtual ~SendKeysToAlertCommandHandler(void)
  {
  }
 protected:
  void ExecuteInternal(const IECommandExecutor& executor,
                       const LocatorMap& locator_parameters,
                       const ParametersMap& command_parameters,
                       Response* response) {
    ParametersMap::const_iterator text_parameter_iterator = command_parameters.find("text");
    if (text_parameter_iterator == command_parameters.end()) {
      response->SetErrorResponse(400, "Missing parameter: text");
      return;
    }

    BrowserHandle browser_wrapper;
    int status_code = executor.GetCurrentBrowser(&browser_wrapper);
    if (status_code != SUCCESS) {
      response->SetErrorResponse(status_code, "Unable to get browser");
      return;
    }
    // This sleep is required to give IE time to draw the dialog.
    ::Sleep(100);
    HWND alert_handle = browser_wrapper->GetActiveDialogWindowHandle();
    if (alert_handle == NULL) {
      response->SetErrorResponse(EMODALDIALOGOPEN, "No alert is active");
    } else {
      Alert dialog(browser_wrapper, alert_handle);
      status_code = dialog.SendKeys(text_parameter_iterator->second.asString());
      if (status_code != SUCCESS) {
        response->SetErrorResponse(status_code,
                                   "Modal dialog did not have a text box - maybe it was an alert");
        return;
      }
      response->SetSuccessResponse(Json::Value::null);
    }
  }
};

} // namespace webdriver

#endif // WEBDRIVER_IE_SENDKEYSTOALERTCOMMANDHANDLER_H_
