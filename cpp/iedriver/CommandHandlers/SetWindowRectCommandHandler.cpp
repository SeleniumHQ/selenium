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
#include "json.h"
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
  Json::Value width_parameter;
  bool is_width_defined = this->IsParameterDefined(command_parameters,
                                                   "width",
                                                   &width_parameter);

  if (is_width_defined) {
    if (!this->GetNumericParameter("width",
                                   true,
                                   width_parameter,
                                   &width,
                                   &argument_error_message)) {
      response->SetErrorResponse(ERROR_INVALID_ARGUMENT,
                                 argument_error_message);
      return;
    }
  }

  Json::Value height_parameter;
  bool is_height_defined = this->IsParameterDefined(command_parameters,
                                                    "height",
                                                    &height_parameter);
  if (is_height_defined) {
    if (!this->GetNumericParameter("height",
                                   true,
                                   height_parameter,
                                   &height,
                                   &argument_error_message)) {
      response->SetErrorResponse(ERROR_INVALID_ARGUMENT,
                                 argument_error_message);
      return;
    }
  }

  Json::Value x_parameter;
  bool is_x_defined = this->IsParameterDefined(command_parameters,
                                               "x",
                                               &x_parameter);
  if (is_x_defined) {
    if (!this->GetNumericParameter("x",
                                   false,
                                   x_parameter,
                                   &x,
                                   &argument_error_message)) {
      response->SetErrorResponse(ERROR_INVALID_ARGUMENT,
                                 argument_error_message);
      return;
    }
  }

  Json::Value y_parameter;
  bool is_y_defined = this->IsParameterDefined(command_parameters,
                                               "y",
                                               &y_parameter);

  if (is_y_defined) {
    if (!GetNumericParameter("y",
                             false,
                             y_parameter,
                             &y,
                             &argument_error_message)) {
      response->SetErrorResponse(ERROR_INVALID_ARGUMENT,
                                 argument_error_message);
      return;
    }
  }

  int status_code = WD_SUCCESS;

  BrowserHandle browser_wrapper;
  status_code = executor.GetCurrentBrowser(&browser_wrapper);
  if (status_code != WD_SUCCESS) {
    response->SetErrorResponse(ERROR_NO_SUCH_WINDOW,
                               "Error retrieving current window");
    return;
  }

  // If the window is minimized, maximized, or full screen,
  // the window needs to be restored.
  browser_wrapper->Restore();

  HWND window_handle = browser_wrapper->GetTopLevelWindowHandle();
  RECT current_window_rect;
  ::GetWindowRect(window_handle, &current_window_rect);
  if (!is_x_defined || !is_y_defined) {
    x = current_window_rect.left;
    y = current_window_rect.top;
  }
  if (!is_height_defined || !is_width_defined) {
    height = current_window_rect.bottom - current_window_rect.top;
    width = current_window_rect.right - current_window_rect.left;
  }

  BOOL set_window_pos_result = ::SetWindowPos(window_handle,
                                              NULL,
                                              x,
                                              y,
                                              width,
                                              height,
                                              0);
  if (!set_window_pos_result) {
    response->SetErrorResponse(ERROR_UNKNOWN_ERROR,
                              "Unexpected error setting window size (SetWindowPos API failed)");
    return;
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
    const std::string& argument_name,
    const bool is_positive_required,
    const Json::Value& parameter_value,
    int* argument_value,
    std::string* error_message) {
  int max_value = MAXINT;
  std::string max_value_description = "2^31 - 1";
  int min_value = MININT;
  std::string min_value_description = "-2^31";
  if (is_positive_required) {
    min_value = 0;
    min_value_description = "zero";
  }
  if (!parameter_value.isNumeric()) {
    *error_message = argument_name + " must be a numeric parameter.";
    return false;
  }
  int value = parameter_value.asInt();
  if (value < min_value) {
    *error_message = argument_name + " must be a numeric parameter greater than " + min_value_description;
    return false;
  }
  if (value > max_value) {
    *error_message = argument_name + " must be a numeric parameter less than " + max_value_description;
    return false;
  }

  *argument_value = value;
  return true;
}

bool SetWindowRectCommandHandler::IsParameterDefined(
    const ParametersMap& command_parameters,
    const std::string& parameter_name,
    Json::Value* parameter_value) {
  ParametersMap::const_iterator parameter_iterator = command_parameters.find(parameter_name);
  if (parameter_iterator == command_parameters.end()) {
    return false;
  }
  if (parameter_iterator->second.isNull()) {
    return false;
  }
  *parameter_value = parameter_iterator->second;
  return true;
}

} // namespace webdriver
