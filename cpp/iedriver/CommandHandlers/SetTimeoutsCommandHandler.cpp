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

#include "SetTimeoutsCommandHandler.h"
#include "errorcodes.h"
#include "../Browser.h"
#include "../IECommandExecutor.h"

namespace webdriver {

SetTimeoutsCommandHandler::SetTimeoutsCommandHandler(void) {
}

SetTimeoutsCommandHandler::~SetTimeoutsCommandHandler(void) {
}

void SetTimeoutsCommandHandler::ExecuteInternal(
    const IECommandExecutor& executor,
    const ParametersMap& command_parameters,
    Response* response) {
  IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
  int timeout = 0;
  ParametersMap::const_iterator timeout_parameter_iterator = command_parameters.begin();
  for (; timeout_parameter_iterator != command_parameters.end(); ++timeout_parameter_iterator) {
    std::string timeout_type = timeout_parameter_iterator->first;
    timeout = timeout_parameter_iterator->second.asInt();
    if (timeout_type == "implicit") {
      mutable_executor.set_implicit_wait_timeout(timeout);
    } else if (timeout_type == "script") {
      mutable_executor.set_async_script_timeout(timeout);
    } else if (timeout_type == "pageLoad") {
      mutable_executor.set_page_load_timeout(timeout);
    } else {
      response->SetErrorResponse(ERROR_INVALID_ARGUMENT, "Invalid timeout type specified: " + timeout_type);
      return;
    }
  }
}

} // namespace webdriver
