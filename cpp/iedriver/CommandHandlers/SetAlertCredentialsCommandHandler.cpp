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

#include "SetAlertCredentialsCommandHandler.h"
#include "errorcodes.h"
#include "../Alert.h"
#include "../Browser.h"
#include "../IECommandExecutor.h"

namespace webdriver {

SetAlertCredentialsCommandHandler::SetAlertCredentialsCommandHandler(void) {
}

SetAlertCredentialsCommandHandler::~SetAlertCredentialsCommandHandler(void) {
}

void SetAlertCredentialsCommandHandler::ExecuteInternal(
    const IECommandExecutor& executor,
    const ParametersMap& command_parameters,
    Response* response) {
  ParametersMap::const_iterator username_parameter_iterator = command_parameters.find("username");
  if (username_parameter_iterator == command_parameters.end()) {
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT, "Missing parameter: username");
    return;
  }
  std::string username = username_parameter_iterator->second.asString();

  ParametersMap::const_iterator password_parameter_iterator = command_parameters.find("password");
  if (password_parameter_iterator == command_parameters.end()) {
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT, "Missing parameter: password");
    return;
  }
  std::string password = password_parameter_iterator->second.asString();

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
    response->SetErrorResponse(ERROR_NO_SUCH_ALERT, "No alert is active");
  } else {
    Alert dialog(browser_wrapper, alert_handle);
    status_code = dialog.SetUserName(username);
    if (status_code != WD_SUCCESS) {
      response->SetErrorResponse(status_code,
                                 "Could not set user name");
      return;
    }
    status_code = dialog.SetPassword(password);
    if (status_code != WD_SUCCESS) {
      response->SetErrorResponse(status_code,
                                 "Could not set password");
      return;
    }
    response->SetSuccessResponse(Json::Value::null);
  }
}

} // namespace webdriver
