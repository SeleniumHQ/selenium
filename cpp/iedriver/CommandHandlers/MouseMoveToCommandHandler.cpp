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

#include "MouseMoveToCommandHandler.h"
#include "errorcodes.h"
#include "../Browser.h"
#include "../IECommandExecutor.h"
#include "../InputManager.h"

namespace webdriver {

MouseMoveToCommandHandler::MouseMoveToCommandHandler(void) {
}

MouseMoveToCommandHandler::~MouseMoveToCommandHandler(void) {
}

void MouseMoveToCommandHandler::ExecuteInternal(
    const IECommandExecutor& executor,
    const ParametersMap& command_parameters,
    Response* response) {
  ParametersMap::const_iterator element_parameter_iterator = command_parameters.find("element");
  ParametersMap::const_iterator xoffset_parameter_iterator = command_parameters.find("xoffset");
  ParametersMap::const_iterator yoffset_parameter_iterator = command_parameters.find("yoffset");
  bool element_specified(element_parameter_iterator != command_parameters.end());
  bool offset_specified((xoffset_parameter_iterator != command_parameters.end()) &&
                        (yoffset_parameter_iterator != command_parameters.end()));
  if (!element_specified && !offset_specified) {
    response->SetErrorResponse(400,
                                "Missing parameters: element, xoffset, yoffset");
    return;
  } else {
    int status_code = WD_SUCCESS;
    IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
    BrowserHandle browser_wrapper;
    status_code = executor.GetCurrentBrowser(&browser_wrapper);
    if (status_code != WD_SUCCESS) {
      response->SetErrorResponse(status_code,
                                  "Unable to get browser");
      return;
    }
    Json::Value value = this->RecreateJsonParameterObject(command_parameters);
    value["action"] = "moveto";
    Json::UInt index = 0;
    Json::Value actions(Json::arrayValue);
    actions[index] = value;
    mutable_executor.input_manager()->PerformInputSequence(browser_wrapper, actions);
    response->SetSuccessResponse(Json::Value::null);
  }
}

} // namespace webdriver
