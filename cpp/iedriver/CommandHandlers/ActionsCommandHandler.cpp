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

#include "ActionsCommandHandler.h"
#include "errorcodes.h"
#include "json.h"
#include "../Alert.h"
#include "../Browser.h"
#include "../IECommandExecutor.h"
#include "../InputManager.h"

namespace webdriver {

ActionsCommandHandler::ActionsCommandHandler(void) {
}

ActionsCommandHandler::~ActionsCommandHandler(void) {
}

void ActionsCommandHandler::ExecuteInternal(
    const IECommandExecutor& executor,
    const ParametersMap& command_parameters,
    Response* response) {
  BrowserHandle browser_wrapper;
  int status_code = executor.GetCurrentBrowser(&browser_wrapper);
  if (status_code != WD_SUCCESS) {
    response->SetErrorResponse(status_code, "Unable to get current browser");
    return;
  }
  ParametersMap::const_iterator actions_parameter_iterator = command_parameters.find("actions");
  if (actions_parameter_iterator == command_parameters.end()) {
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT, "Missing parameter: actions");
    return;
  }
  if (!actions_parameter_iterator->second.isArray()) {
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT, "Actions value is not an array");
    return;
  }
  std::string error_info = "";
  status_code = executor.input_manager()->PerformInputSequence(browser_wrapper,
                                                               actions_parameter_iterator->second,
                                                               &error_info);
  if (status_code != WD_SUCCESS) {
    if (status_code == EMOVETARGETOUTOFBOUNDS) {
      response->SetErrorResponse(status_code, error_info);
    } else {
      response->SetErrorResponse(status_code, "Unexpected error performing action sequence.");
    }
    return;
  }
  response->SetSuccessResponse(Json::Value::null);
}

} // namespace webdriver
