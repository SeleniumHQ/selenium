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

#include "ElementEqualsCommandHandler.h"
#include "errorcodes.h"
#include "../Browser.h"
#include "../Element.h"
#include "../IECommandExecutor.h"

namespace webdriver {

ElementEqualsCommandHandler::ElementEqualsCommandHandler(void) {
}

ElementEqualsCommandHandler::~ElementEqualsCommandHandler(void) {
}

void ElementEqualsCommandHandler::ExecuteInternal(
    const IECommandExecutor& executor,
    const ParametersMap& command_parameters,
    Response* response) {
  ParametersMap::const_iterator id_parameter_iterator = command_parameters.find("id");
  ParametersMap::const_iterator other_parameter_iterator = command_parameters.find("other");
  if (id_parameter_iterator == command_parameters.end()) {
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT, "Missing parameter in URL: id");
    return;
  }
  else if (other_parameter_iterator == command_parameters.end()) {
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT, "Missing parameter in URL: other");
    return;
  } else {
    std::string element_id = id_parameter_iterator->second.asString();
    std::string other_element_id = other_parameter_iterator->second.asString();

    BrowserHandle browser_wrapper;
    int status_code = executor.GetCurrentBrowser(&browser_wrapper);
    if (status_code != WD_SUCCESS) {
      response->SetErrorResponse(status_code, "Unable to get browser");
      return;
    }

    ElementHandle element_wrapper;
    status_code = this->GetElement(executor, element_id, &element_wrapper);
    if (status_code == WD_SUCCESS)
    {
      ElementHandle other_element_wrapper;
      status_code = this->GetElement(executor,
                                      other_element_id,
                                      &other_element_wrapper);
      if (status_code == WD_SUCCESS) {
        response->SetSuccessResponse((element_wrapper->element() == other_element_wrapper->element()));
        return;
      } else {
        response->SetErrorResponse(status_code,
                                    "Element specified by 'other' is no longer valid");
        return;
      }
    } else {
      response->SetErrorResponse(status_code,
                                  "Element specified by 'id' is no longer valid");
      return;
    }
  }

}

} // namespace webdriver
