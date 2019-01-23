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

#include "GetTimeoutsCommandHandler.h"
#include "errorcodes.h"
#include "../Browser.h"
#include "../IECommandExecutor.h"
#include "../WebDriverConstants.h"

namespace webdriver {

GetTimeoutsCommandHandler::GetTimeoutsCommandHandler(void) {
}

GetTimeoutsCommandHandler::~GetTimeoutsCommandHandler(void) {
}

void GetTimeoutsCommandHandler::ExecuteInternal(
    const IECommandExecutor& executor,
    const ParametersMap& command_parameters,
    Response* response) {
  Json::Value response_value;
  response_value[IMPLICIT_WAIT_TIMEOUT_NAME] = executor.implicit_wait_timeout();
  if (executor.async_script_timeout() < 0) {
    response_value[SCRIPT_TIMEOUT_NAME] = Json::Value::null;
  } else {
    response_value[SCRIPT_TIMEOUT_NAME] = executor.async_script_timeout();
  }
  response_value[PAGE_LOAD_TIMEOUT_NAME] = executor.page_load_timeout();
  response->SetSuccessResponse(response_value);
}

} // namespace webdriver
