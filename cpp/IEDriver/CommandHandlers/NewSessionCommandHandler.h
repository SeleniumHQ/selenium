// Copyright 2011 Software Freedom Conservatory
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

#ifndef WEBDRIVER_IE_NEWSESSIONCOMMANDHANDLER_H_
#define WEBDRIVER_IE_NEWSESSIONCOMMANDHANDLER_H_

#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"

namespace webdriver {

class NewSessionCommandHandler : public IECommandHandler {
 public:
  NewSessionCommandHandler(void) {
  }

  virtual ~NewSessionCommandHandler(void) {
  }

 protected:
  void NewSessionCommandHandler::ExecuteInternal(const IECommandExecutor& executor,
                                                 const LocatorMap& locator_parameters,
                                                 const ParametersMap& command_parameters,
                                                 Response* response) {
    IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
    ParametersMap::const_iterator it = command_parameters.find("desiredCapabilities");
    if (it != command_parameters.end()) {
      Json::Value ignore_protected_mode_settings = it->second.get("ignoreProtectedModeSettings", false);
      mutable_executor.set_ignore_protected_mode_settings(ignore_protected_mode_settings.asBool());
    }
    int result_code = mutable_executor.CreateNewBrowser();
    if (result_code != SUCCESS) {
      // The browser was not created successfully, therefore the
      // session must be marked as invalid so the server can
      // properly shut it down.
      mutable_executor.set_is_valid(false);
      response->SetErrorResponse(result_code,
                                 "Unexpected error launching Internet Explorer. Protected Mode must be set to the same value (enabled or disabled) for all zones.");
      return;
    }
    std::string id = executor.session_id();
    response->SetResponse(303, "/session/" + id);
  }
};

} // namespace webdriver

#endif // WEBDRIVER_IE_NEWSESSIONCOMMANDHANDLER_H_
