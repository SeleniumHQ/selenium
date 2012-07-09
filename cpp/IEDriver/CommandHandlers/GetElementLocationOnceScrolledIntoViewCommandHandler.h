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

#ifndef WEBDRIVER_IE_GETELEMENTLOCATIONONCESCROLLEDINTOVIEWCOMMANDHANDLER_H_
#define WEBDRIVER_IE_GETELEMENTLOCATIONONCESCROLLEDINTOVIEWCOMMANDHANDLER_H_

#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"
#include "../Generated/atoms.h"

namespace webdriver {

class GetElementLocationOnceScrolledIntoViewCommandHandler : public IECommandHandler {
 public:
  GetElementLocationOnceScrolledIntoViewCommandHandler(void) {
  }

  virtual ~GetElementLocationOnceScrolledIntoViewCommandHandler(void) {
  }

 protected:
  void ExecuteInternal(const IECommandExecutor& executor,
                       const LocatorMap& locator_parameters,
                       const ParametersMap& command_parameters,
                       Response* response) {
    LocatorMap::const_iterator id_parameter_iterator = locator_parameters.find("id");
    if (id_parameter_iterator == locator_parameters.end()) {
      response->SetErrorResponse(400, "Missing parameter in URL: id");
      return;
    } else {
      std::string element_id = id_parameter_iterator->second;

      BrowserHandle browser_wrapper;
      int status_code = executor.GetCurrentBrowser(&browser_wrapper);
      if (status_code != SUCCESS) {
        response->SetErrorResponse(status_code, "Unable to get browser");
        return;
      }

      ElementHandle element_wrapper;
      status_code = this->GetElement(executor, element_id, &element_wrapper);
      if (status_code == SUCCESS) {
        long x = 0, y = 0, width = 0, height = 0;
        status_code = element_wrapper->GetLocationOnceScrolledIntoView(executor.scroll_behavior(),
                                                                       &x,
                                                                       &y,
                                                                       &width,
                                                                       &height);
        if (status_code == SUCCESS) {
          Json::Value response_value;
          response_value["x"] = x;
          response_value["y"] = y;
          response->SetSuccessResponse(response_value);
          return;
        } else {
          response->SetErrorResponse(status_code,
                                     "Unable to get element location.");
          return;
        }
      } else {
        response->SetErrorResponse(status_code, "Element is no longer valid");
        return;
      }
    }
  }
};

} // namespace webdriver

#endif // WEBDRIVER_IE_GETELEMENTLOCATIONONCESCROLLEDINTOVIEWCOMMANDHANDLER_H_
