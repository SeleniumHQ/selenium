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

#include "CreateNewWindowCommandHandler.h"
#include "errorcodes.h"
#include "../Browser.h"
#include "../IECommandExecutor.h"
#include "../WebDriverConstants.h"

namespace webdriver {

CreateNewWindowCommandHandler::CreateNewWindowCommandHandler(void) {
}

CreateNewWindowCommandHandler::~CreateNewWindowCommandHandler(void) {
}

void CreateNewWindowCommandHandler::ExecuteInternal(
    const IECommandExecutor& executor,
    const ParametersMap& command_parameters,
    Response* response) {
  ParametersMap::const_iterator type_parameter_iterator = command_parameters.find("type");
  if (type_parameter_iterator == command_parameters.end()) {
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT, "Missing parameter: type");
    return;
  }
  if (!type_parameter_iterator->second.isString() &&
      !type_parameter_iterator->second.isNull()) {
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT, "type parameter must be a string or null");
    return;
  }

  std::string window_type = WINDOW_WINDOW_TYPE;
  if (type_parameter_iterator->second.isString()) {
    std::string parameter_value = type_parameter_iterator->second.asString();
    if (parameter_value == TAB_WINDOW_TYPE) {
      window_type = TAB_WINDOW_TYPE;
    }
  }

  BrowserHandle browser_wrapper;
  int status_code = executor.GetCurrentBrowser(&browser_wrapper);
  if (status_code != WD_SUCCESS) {
    response->SetErrorResponse(ERROR_NO_SUCH_WINDOW,
                               "Error retrieving current window");
    return;
  }

  IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
  std::string new_window_handle = mutable_executor.OpenNewBrowsingContext(window_type);
  if (new_window_handle.size() == 0) {
    response->SetErrorResponse(ERROR_NO_SUCH_WINDOW, "New window not created");
    return;
  }
  if (window_type == WINDOW_WINDOW_TYPE) {
    BrowserHandle tmp_browser;
    executor.GetManagedBrowser(new_window_handle, &tmp_browser);
    tmp_browser->NavigateToUrl("about:blank");
  }
  Json::Value result;
  result["handle"] = new_window_handle;
  result["type"] = window_type;
  response->SetSuccessResponse(result);
}

} // namespace webdriver
