// Copyright 2011 Software Freedom Conservancy
// Licensed under the Apache License, Version 2.0 (the "License");
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
#include "json.h"
#include "command_handler.h"
#include "command.h"
#include "Element.h"
#include "response.h"

using namespace std;

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
                               const LocatorMap& locator_parameters,
                               const ParametersMap& command_parameters,
                               Response* response);
  int GetElement(const IECommandExecutor& executor,
                 const std::string& element_id,
                 ElementHandle* element_wrapper);
};

typedef std::tr1::shared_ptr<IECommandHandler> CommandHandlerHandle;

} // namespace webdriver

#endif // WEBDRIVER_IE_COMMANDHANDLER_H_
