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

#ifndef WEBDRIVER_IE_FINDCHILDELEMENTSCOMMANDHANDLER_H_
#define WEBDRIVER_IE_FINDCHILDELEMENTSCOMMANDHANDLER_H_

#include <ctime>
#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"

namespace webdriver {

class FindChildElementsCommandHandler : public IECommandHandler {
 public:
  FindChildElementsCommandHandler(void) {
  }

  virtual ~FindChildElementsCommandHandler(void) {
  }

 protected:
  void ExecuteInternal(const IECommandExecutor& executor,
                       const LocatorMap& locator_parameters,
                       const ParametersMap& command_parameters,
                       Response* response) {
    LocatorMap::const_iterator id_parameter_iterator = locator_parameters.find("id");
    ParametersMap::const_iterator using_parameter_iterator = command_parameters.find("using");
    ParametersMap::const_iterator value_parameter_iterator = command_parameters.find("value");
    if (id_parameter_iterator == locator_parameters.end()) {
      response->SetErrorResponse(400, "Missing parameter in URL: id");
      return;
    } else if (using_parameter_iterator == command_parameters.end()) {
      response->SetErrorResponse(400, "Missing parameter: using");
      return;
    } else if (value_parameter_iterator == command_parameters.end()) {
      response->SetErrorResponse(400, "Missing parameter: value");
      return;
    } else {
      std::string mechanism = using_parameter_iterator->second.asString();
      std::string value = value_parameter_iterator->second.asString();
      std::string element_id = id_parameter_iterator->second;

      ElementHandle parent_element_wrapper;
      int status_code = this->GetElement(executor,
                                         element_id,
                                         &parent_element_wrapper);

      if (status_code == SUCCESS) {
        Json::Value found_elements(Json::arrayValue);

        int timeout = executor.implicit_wait_timeout();
        clock_t end = clock() + (timeout / 1000 * CLOCKS_PER_SEC);
        if (timeout > 0 && timeout < 1000) {
          end += 1 * CLOCKS_PER_SEC;
        }

        do {
          status_code = executor.LocateElements(parent_element_wrapper,
                                                mechanism,
                                                value,
                                                &found_elements);
          if (status_code == SUCCESS && found_elements.size() > 0) {
            response->SetSuccessResponse(found_elements);
            return;
          }
          if (status_code == EINVALIDSELECTOR) {
            response->SetErrorResponse(status_code, 
              "The xpath expression '" + value + "' cannot be evaluated or does not" +
              "result in a WebElement");
            return;
          }
          if (status_code == EUNHANDLEDERROR) {
            response->SetErrorResponse(status_code, 
              "Unknown finder mechanism: " + mechanism);
            return;
          }
            // Release the thread so that the browser doesn't starve.
            ::Sleep(FIND_ELEMENT_WAIT_TIME_IN_MILLISECONDS);
        } while (clock() < end);

        // This code is executed when no elements where found and no errors occurred.
        if (status_code == SUCCESS) {
          response->SetSuccessResponse(found_elements);
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

#endif // WEBDRIVER_IE_FINDCHILDELEMENTSCOMMANDHANDLER_H_
