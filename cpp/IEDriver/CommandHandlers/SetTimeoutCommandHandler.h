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

#ifndef WEBDRIVER_IE_SETTIMEOUTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_SETTIMEOUTCOMMANDHANDLER_H_

#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"

namespace webdriver {

class SetTimeoutCommandHandler : public IECommandHandler {
 public:
  SetTimeoutCommandHandler(void) {
  }

  virtual ~SetTimeoutCommandHandler(void) {
  }

 protected:
  void ExecuteInternal(const IECommandExecutor& executor,
                       const LocatorMap& locator_parameters,
                       const ParametersMap& command_parameters,
                       Response* response) {
    ParametersMap::const_iterator type_parameter_iterator = command_parameters.find("type");
    ParametersMap::const_iterator ms_parameter_iterator = command_parameters.find("ms");
    if (type_parameter_iterator == command_parameters.end()) {
      response->SetErrorResponse(400, "Missing parameter: type");
      return;
    } else if (ms_parameter_iterator == command_parameters.end()) {
      response->SetErrorResponse(400, "Missing parameter: ms");
      return;
    } else {
      std::string timeout_type = type_parameter_iterator->second.asString();
      int timeout = ms_parameter_iterator->second.asInt();
      IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
      if (timeout_type == "implicit") {
        mutable_executor.set_implicit_wait_timeout(timeout);
      } else if (timeout_type == "script") {
        mutable_executor.set_async_script_timeout(timeout);
      } else if (timeout_type == "page load") {
         mutable_executor.set_page_load_timeout(timeout);
      } else {
        response->SetErrorResponse(EUNHANDLEDERROR, "Invalid timeout type specified: " + timeout_type);
        return;
      }
      response->SetSuccessResponse(Json::Value::null);
    }
  }
};

} // namespace webdriver

#endif // WEBDRIVER_IE_SETTIMEOUTCOMMANDHANDLER_H_
