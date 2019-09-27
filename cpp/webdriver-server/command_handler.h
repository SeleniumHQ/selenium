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

// Defines a template class for a command handler. Implementations of
// this class are intended to provide a command executor class which is
// responsible for the actual execution of commands.

#ifndef WEBDRIVER_SERVER_COMMAND_HANDLER_H_
#define WEBDRIVER_SERVER_COMMAND_HANDLER_H_

#include <map>
#include <string>
#include "json.h"
#include "command.h"
#include "response.h"

namespace webdriver {

template <class T>
class CommandHandler {
 public:
  CommandHandler(void) {}
  virtual ~CommandHandler(void) {}
  void Execute(const T& executor, const Command& command, Response* response) {
    this->ExecuteInternal(executor,
                          command.command_parameters(),
                          response);
  }

 protected:
  virtual void ExecuteInternal(const T& executor,
                               const ParametersMap& command_parameters,
                               Response* response) = 0;

  DISALLOW_COPY_AND_ASSIGN(CommandHandler);
};

}  // namespace webdriver

#endif  // WEBDRIVER_SERVER_COMMAND_HANDLER_H_
