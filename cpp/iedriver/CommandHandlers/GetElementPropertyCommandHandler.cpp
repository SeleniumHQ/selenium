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

#include "GetElementPropertyCommandHandler.h"
#include "errorcodes.h"
#include "../Browser.h"
#include "../Element.h"
#include "../IECommandExecutor.h"
#include "../VariantUtilities.h"

namespace webdriver {

GetElementPropertyCommandHandler::GetElementPropertyCommandHandler(void) {
}

GetElementPropertyCommandHandler::~GetElementPropertyCommandHandler(void) {
}

void GetElementPropertyCommandHandler::ExecuteInternal(
    const IECommandExecutor& executor,
    const ParametersMap& command_parameters,
    Response* response) {
  ParametersMap::const_iterator id_parameter_iterator = command_parameters.find("id");
  ParametersMap::const_iterator name_parameter_iterator = command_parameters.find("name");
  if (id_parameter_iterator == command_parameters.end()) {
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT, "Missing parameter in URL: id");
    return;
  } else if (name_parameter_iterator == command_parameters.end()) {
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT, "Missing parameter in URL: name");
    return;
  } else {
    std::string element_id = id_parameter_iterator->second.asString();
    std::string name = name_parameter_iterator->second.asString();

    BrowserHandle browser_wrapper;
    int status_code = executor.GetCurrentBrowser(&browser_wrapper);
    if (status_code != WD_SUCCESS) {
      response->SetErrorResponse(ERROR_NO_SUCH_WINDOW, "Unable to get browser");
      return;
    }

    ElementHandle element_wrapper;
    status_code = this->GetElement(executor, element_id, &element_wrapper);
    if (status_code == WD_SUCCESS) {
      CComVariant value;
      status_code = element_wrapper->GetPropertyValue(name,
                                                      &value);
      if (status_code != WD_SUCCESS) {
        response->SetErrorResponse(status_code, "Unable to get property");
        return;
      } else {
        Json::Value json_value;
        IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
        VariantUtilities::VariantAsJsonValue(mutable_executor.element_manager(), value, &json_value);
        response->SetSuccessResponse(json_value);
        return;
      }
    } else if (status_code == ENOSUCHELEMENT) {
      response->SetErrorResponse(ERROR_NO_SUCH_ELEMENT, "Invalid internal element ID requested: " + element_id);
      return;
    } else {
      response->SetErrorResponse(ERROR_STALE_ELEMENT_REFERENCE, "Element is no longer valid");
      return;
    }
  }
}

} // namespace webdriver
