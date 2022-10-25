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
#include "../WebDriverConstants.h"

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
  long long timeout = 0;
  ParametersMap::const_iterator timeout_parameter_iterator = command_parameters.begin();
  for (; timeout_parameter_iterator != command_parameters.end(); ++timeout_parameter_iterator) {
    std::string timeout_type = timeout_parameter_iterator->first;
    Json::Value timeout_value = timeout_parameter_iterator->second;
    if (timeout_type == SCRIPT_TIMEOUT_NAME && timeout_value.isNull()) {
      // Special case for the script timeout, which is nullable.
      mutable_executor.set_async_script_timeout(-1);
      return;
    }
    if (!timeout_value.isNumeric() ||
        !timeout_value.isIntegral()) {
      response->SetErrorResponse(ERROR_INVALID_ARGUMENT,
                                 "Timeout value for timeout type " + timeout_type + " must be an integer");
      return;
    }
    timeout = timeout_value.asInt64();
    if (timeout < 0 || timeout > MAX_SAFE_INTEGER) {
      response->SetErrorResponse(ERROR_INVALID_ARGUMENT,
                                 "Timeout value for timeout type " + timeout_type + " must be an integer between 0 and 2^53 - 1");
      return;
    }
    if (timeout_type == IMPLICIT_WAIT_TIMEOUT_NAME) {
      mutable_executor.set_implicit_wait_timeout(timeout);
    } else if (timeout_type == SCRIPT_TIMEOUT_NAME) {
      mutable_executor.set_async_script_timeout(timeout);
    } else if (timeout_type == PAGE_LOAD_TIMEOUT_NAME) {
      mutable_executor.set_page_load_timeout(timeout);
    }
  }
}

} // namespace webdriver
