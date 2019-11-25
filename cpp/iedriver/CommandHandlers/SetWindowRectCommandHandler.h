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
#ifndef WEBDRIVER_IE_SETWINDOWRECTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_SETWINDOWRECTCOMMANDHANDLER_H_

#include "../IECommandHandler.h"

namespace Json {
  class Value;
}

namespace webdriver {

class SetWindowRectCommandHandler : public IECommandHandler {
 public:
  SetWindowRectCommandHandler(void);
  virtual ~SetWindowRectCommandHandler(void);

 protected:
  void ExecuteInternal(const IECommandExecutor& executor,
                       const ParametersMap& command_parameters,
                       Response* response);

 private:
  bool GetNumericParameter(const std::string& argument_name,
                           const bool is_positive_required,
                           const Json::Value& parameter_value,
                           int* argument_value,
                           std::string* error_message);
  bool IsParameterDefined(const ParametersMap& command_parameters,
                          const std::string& parameter_name,
                          Json::Value* parameter_value);
};

} // namespace webdriver

#endif // WEBDRIVER_IE_SETWINDOWRECTCOMMANDHANDLER_H_
