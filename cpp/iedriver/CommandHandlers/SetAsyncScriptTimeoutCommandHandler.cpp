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

#include "SetAsyncScriptTimeoutCommandHandler.h"
#include "../Browser.h"
#include "../IECommandExecutor.h"

namespace webdriver {

SetAsyncScriptTimeoutCommandHandler::SetAsyncScriptTimeoutCommandHandler(void) {
}

SetAsyncScriptTimeoutCommandHandler::~SetAsyncScriptTimeoutCommandHandler(void) {
}

void SetAsyncScriptTimeoutCommandHandler::ExecuteInternal(
    const IECommandExecutor& executor,
    const ParametersMap& command_parameters,
    Response* response) {
  ParametersMap::const_iterator ms_parameter_iterator = command_parameters.find("ms");
  if (ms_parameter_iterator == command_parameters.end()) {
    response->SetErrorResponse(400, "Missing parameter: ms");
    return;
  } else {
    int timeout = ms_parameter_iterator->second.asInt();
    IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
    mutable_executor.set_async_script_timeout(timeout);
    response->SetSuccessResponse(Json::Value::null);
  }
}

} // namespace webdriver
