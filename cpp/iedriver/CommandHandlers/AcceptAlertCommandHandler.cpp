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

#include "AcceptAlertCommandHandler.h"
#include "errorcodes.h"
#include "../Alert.h"
#include "../Browser.h"
#include "../IECommandExecutor.h"

namespace webdriver {

AcceptAlertCommandHandler::AcceptAlertCommandHandler(void) {
}

AcceptAlertCommandHandler::~AcceptAlertCommandHandler(void) {
}

void AcceptAlertCommandHandler::ExecuteInternal(
    const IECommandExecutor& executor,
    const ParametersMap& command_parameters,
    Response* response) {
  BrowserHandle browser_wrapper;
  int status_code = executor.GetCurrentBrowser(&browser_wrapper);
  if (status_code != WD_SUCCESS) {
    response->SetErrorResponse(status_code, "Unable to get current browser");
    return;
  }
  // This sleep is required to give IE time to draw the dialog.
  ::Sleep(100);
  HWND alert_handle = browser_wrapper->GetActiveDialogWindowHandle();
  if (alert_handle == NULL) {
    response->SetErrorResponse(ENOSUCHALERT, "No alert is active");
  } else {
    Alert dialog(browser_wrapper, alert_handle);
    status_code = dialog.Accept();
    if (status_code != WD_SUCCESS) {
      response->SetErrorResponse(status_code,
                                 "Could not find OK button");
    }

    // Add sleep to give IE time to close dialog and start Navigation if it's necessary
    ::Sleep(100);
    browser_wrapper->set_wait_required(true);

    response->SetSuccessResponse(Json::Value::null);
  }
}

} // namespace webdriver
