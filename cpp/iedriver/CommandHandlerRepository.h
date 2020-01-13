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

#ifndef WEBDRIVER_IE_COMMANDHANDLERREPOSITORY_H_
#define WEBDRIVER_IE_COMMANDHANDLERREPOSITORY_H_

#include <map>
#include <memory>
#include <string>

namespace webdriver {

// Forward declaration of classes.
class IECommandHandler;

typedef std::shared_ptr<IECommandHandler> CommandHandlerHandle;

class CommandHandlerRepository {
 public:
  CommandHandlerRepository(void);
  virtual ~CommandHandlerRepository(void);

  bool IsValidCommand(const std::string& command_name);
  CommandHandlerHandle GetCommandHandler(const std::string& command_name);

 private:
   typedef std::map<std::string, CommandHandlerHandle> CommandHandlerMap;

   void PopulateCommandHandlers(void);
   
   CommandHandlerMap command_handlers_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_COMMANDHANDLERREPOSITORY_H_
