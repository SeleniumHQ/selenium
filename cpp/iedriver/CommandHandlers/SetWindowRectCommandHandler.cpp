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

#include "SetWindowRectCommandHandler.h"
#include "errorcodes.h"
#include "../Browser.h"
#include "../IECommandExecutor.h"

namespace webdriver {

SetWindowRectCommandHandler::SetWindowRectCommandHandler(void) {
}

SetWindowRectCommandHandler::~SetWindowRectCommandHandler(void) {
}

void SetWindowRectCommandHandler::ExecuteInternal(
    const IECommandExecutor& executor,
    const ParametersMap& command_parameters,
    Response* response) {
  int width = -1;
  int height = -1;
  int x = -1;
  int y = -1;

  std::string argument_error_message = "";
  if (!GetNumericParameter(command_parameters, "width", &width, &argument_error_message)) {
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT, argument_error_message);
    return;
  }

  if (!GetNumericParameter(command_parameters, "height", &height, &argument_error_message)) {
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT, argument_error_message);
    return;
  }

  if (!GetNumericParameter(command_parameters, "x", &x, &argument_error_message)) {
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT, argument_error_message);
    return;
  }

  if (!GetNumericParameter(command_parameters, "y", &y, &argument_error_message)) {
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT, argument_error_message);
    return;
  }

  int status_code = WD_SUCCESS;

  BrowserHandle browser_wrapper;
  status_code = executor.GetCurrentBrowser(&browser_wrapper);
  if (status_code != WD_SUCCESS) {
    response->SetErrorResponse(ERROR_NO_SUCH_WINDOW, "Error retrieving current window");
    return;
  }

  // If the window is minimized, maximized, or full screen,
  // the window needs to be restored.
  browser_wrapper->Restore();

  HWND window_handle = browser_wrapper->GetTopLevelWindowHandle();
  if (x >= 0 && y >= 0) {
    BOOL set_window_pos_result = ::SetWindowPos(window_handle, NULL, x, y, 0, 0, SWP_NOSIZE);
    if (!set_window_pos_result) {
      response->SetErrorResponse(ERROR_UNKNOWN_ERROR,
                                "Unexpected error setting window size (SetWindowPos API failed)");
      return;
    }
  }

  if (width >= 0 && height >= 0) {
    BOOL set_window_size_result = ::SetWindowPos(window_handle, NULL, 0, 0, width, height, SWP_NOMOVE);
    if (!set_window_size_result) {
      response->SetErrorResponse(ERROR_UNKNOWN_ERROR,
                                 "Unexpected error setting window size (SetWindowPos API failed)");
      return;
    }
  }

  HWND browser_window_handle = browser_wrapper->GetTopLevelWindowHandle();
  RECT window_rect;
  ::GetWindowRect(browser_window_handle, &window_rect);
  Json::Value returned_rect;
  returned_rect["width"] = window_rect.right - window_rect.left;
  returned_rect["height"] = window_rect.bottom - window_rect.top;
  returned_rect["x"] = window_rect.left;
  returned_rect["y"] = window_rect.top;
  response->SetSuccessResponse(returned_rect);
}

bool SetWindowRectCommandHandler::GetNumericParameter(
    const ParametersMap& command_parameters,
    const std::string& argument_name,
    int* argument_value,
    std::string* error_message) {
  ParametersMap::const_iterator parameter_iterator = command_parameters.find(argument_name);
  if (parameter_iterator != command_parameters.end()) {
    if (!parameter_iterator->second.isNumeric()) {
      *error_message = argument_name + " must be a numeric parameter.";
      return false;
    }
    int value = parameter_iterator->second.asInt();
    if (value < 0) {
      *error_message = argument_name + " must be a numeric parameter greater than zero.";
      return false;
    }

    *argument_value = value;
    return true;
  }
  return true;
}

} // namespace webdriver
