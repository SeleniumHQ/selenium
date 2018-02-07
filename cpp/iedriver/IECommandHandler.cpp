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

#include "IECommandHandler.h"

#include "command_handler.h"
#include "errorcodes.h"
#include "logging.h"

#include "DocumentHost.h"
#include "Element.h"
#include "IECommandExecutor.h"

namespace webdriver {

IECommandHandler::IECommandHandler() {
}

IECommandHandler::~IECommandHandler() {
}

void IECommandHandler::ExecuteInternal(const IECommandExecutor& executor,
                                       const ParametersMap& command_parameters,
                                       Response* response) {
  LOG(TRACE) << "Entering IECommandHandler::ExecuteInternal";
  response->SetErrorResponse(501, "Command not implemented");
}

int IECommandHandler::GetElement(const IECommandExecutor& executor,
                                 const std::string& element_id,
                                 ElementHandle* element_wrapper) {
  LOG(TRACE) << "Entering IECommandHandler::GetElement";
  return executor.GetManagedElement(element_id, element_wrapper);
}

Json::Value IECommandHandler::RecreateJsonParameterObject(const ParametersMap& command_parameters) {
  Json::Value result;
  ParametersMap::const_iterator param_iterator = command_parameters.begin();
  for (; param_iterator != command_parameters.end(); ++param_iterator) {
    std::string key = param_iterator->first;
    Json::Value value = param_iterator->second;
    result[key] = value;
  }
  return result;
}

} // namespace webdriver
