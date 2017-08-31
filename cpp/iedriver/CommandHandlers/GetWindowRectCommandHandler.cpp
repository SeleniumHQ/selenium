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

#include "GetWindowRectCommandHandler.h"
#include "errorcodes.h"
#include "logging.h"
#include "../Browser.h"
#include "../IECommandExecutor.h"
#include "../Script.h"

namespace webdriver {

GetWindowRectCommandHandler::GetWindowRectCommandHandler(void) {
}

GetWindowRectCommandHandler::~GetWindowRectCommandHandler(void) {
}

void GetWindowRectCommandHandler::ExecuteInternal(
    const IECommandExecutor& executor,
    const ParametersMap& command_parameters,
    Response* response) {
  int status_code = WD_SUCCESS;

  BrowserHandle browser_wrapper;
  status_code = executor.GetCurrentBrowser(&browser_wrapper);
  if (status_code != WD_SUCCESS) {
    response->SetErrorResponse(ERROR_NO_SUCH_WINDOW, "Error retrieving window");
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
  response_value["x"] = window_rect.left;
  response_value["y"] = window_rect.top;
  response->SetSuccessResponse(response_value);
}

} // namespace webdriver
