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

#include "SetTimeoutCommandHandler.h"
#include "errorcodes.h"
#include "../Browser.h"
#include "../IECommandExecutor.h"

namespace webdriver {

SetTimeoutCommandHandler::SetTimeoutCommandHandler(void) {
}

SetTimeoutCommandHandler::~SetTimeoutCommandHandler(void) {
}

void SetTimeoutCommandHandler::ExecuteInternal(
    const IECommandExecutor& executor,
    const ParametersMap& command_parameters,
    Response* response) {
  ParametersMap::const_iterator type_parameter_iterator = command_parameters.find("type");
  ParametersMap::const_iterator ms_parameter_iterator = command_parameters.find("ms");
  if (type_parameter_iterator == command_parameters.end()) {
    response->SetErrorResponse(400, "Missing parameter: type");
    return;
  } else if (ms_parameter_iterator == command_parameters.end()) {
    response->SetErrorResponse(400, "Missing parameter: ms");
    return;
  } else {
    std::string timeout_type = type_parameter_iterator->second.asString();
    int timeout = ms_parameter_iterator->second.asInt();
    IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
    if (timeout_type == "implicit") {
      mutable_executor.set_implicit_wait_timeout(timeout);
    } else if (timeout_type == "script") {
      mutable_executor.set_async_script_timeout(timeout);
    } else if (timeout_type == "page load") {
        mutable_executor.set_page_load_timeout(timeout);
    } else {
      response->SetErrorResponse(EUNHANDLEDERROR, "Invalid timeout type specified: " + timeout_type);
      return;
    }
    response->SetSuccessResponse(Json::Value::null);
  }
}

} // namespace webdriver
