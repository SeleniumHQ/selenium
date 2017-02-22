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

  ParametersMap::const_iterator width_parameter_iterator = command_parameters.find("width");
  ParametersMap::const_iterator height_parameter_iterator = command_parameters.find("height");
  ParametersMap::const_iterator x_parameter_iterator = command_parameters.find("x");
  ParametersMap::const_iterator y_parameter_iterator = command_parameters.find("y");
  
  if (width_parameter_iterator != command_parameters.end()) {
    width = width_parameter_iterator->second.asInt();
  }
  
  if (height_parameter_iterator != command_parameters.end()) {
    height = height_parameter_iterator->second.asInt();
  }
  
  if (x_parameter_iterator != command_parameters.end()) {
    x = x_parameter_iterator->second.asInt();
  }
  
  if (y_parameter_iterator != command_parameters.end()) {
    y = y_parameter_iterator->second.asInt();
  } 
  
  int status_code = WD_SUCCESS;

  BrowserHandle browser_wrapper;
  status_code = executor.GetCurrentBrowser(&browser_wrapper);
  if (status_code != WD_SUCCESS) {
    response->SetErrorResponse(ERROR_NO_SUCH_WINDOW, "Error retrieving current window");
    return;
  }

  // If the window is maximized, the window needs to be restored.
  HWND window_handle = browser_wrapper->GetTopLevelWindowHandle();
  if (::IsZoomed(window_handle) || ::IsIconic(window_handle)) {
    ::ShowWindow(window_handle, SW_RESTORE);
  }

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

  Json::Value returned_rect;
  returned_rect["x"] = x;
  returned_rect["y"] = y;
  returned_rect["width"] = width;
  returned_rect["height"] = height;
  response->SetSuccessResponse(returned_rect);
}

} // namespace webdriver
