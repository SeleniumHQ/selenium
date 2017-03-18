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

#include "GetAllWindowHandlesCommandHandler.h"
#include "../Browser.h"
#include "../IECommandExecutor.h"

namespace webdriver {

GetAllWindowHandlesCommandHandler::GetAllWindowHandlesCommandHandler(void) {
}

GetAllWindowHandlesCommandHandler::~GetAllWindowHandlesCommandHandler(void) {
}

void GetAllWindowHandlesCommandHandler::ExecuteInternal(
    const IECommandExecutor& executor,
    const ParametersMap& command_parameters,
    Response* response) {
  Json::Value handles(Json::arrayValue);
  std::vector<std::string> handle_list;
  executor.GetManagedBrowserHandles(&handle_list);
  for (unsigned int i = 0; i < handle_list.size(); ++i) {
    handles.append(handle_list[i]);
  }

  response->SetSuccessResponse(handles);
}

} // namespace webdriver
