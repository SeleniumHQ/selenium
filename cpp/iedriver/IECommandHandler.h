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

#ifndef WEBDRIVER_IE_COMMANDHANDLER_H_
#define WEBDRIVER_IE_COMMANDHANDLER_H_

#include <map>
#include <string>

#include "command_handler.h"
#include "command.h"
#include "response.h"

#include "CustomTypes.h"

namespace webdriver {

// Forward declaration of classes to avoid
// circular include files.
class IECommandExecutor;

class IECommandHandler : public CommandHandler<IECommandExecutor> {
 public:
  IECommandHandler(void);
  virtual ~IECommandHandler(void);

 protected:
  virtual void ExecuteInternal(const IECommandExecutor& executor,
                               const ParametersMap& command_parameters,
                               Response* response);
  int GetElement(const IECommandExecutor& executor,
                 const std::string& element_id,
                 ElementHandle* element_wrapper);
  Json::Value RecreateJsonParameterObject(const ParametersMap& command_parameters);
};

} // namespace webdriver

#endif // WEBDRIVER_IE_COMMANDHANDLER_H_
