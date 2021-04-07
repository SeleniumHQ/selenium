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


#include "FindChildElementCommandHandler.h"
#include <ctime>
#include "errorcodes.h"
#include "../Browser.h"
#include "../IECommandExecutor.h"
#include "../WebDriverConstants.h"

namespace webdriver {

FindChildElementCommandHandler::FindChildElementCommandHandler(void) {
}

FindChildElementCommandHandler::~FindChildElementCommandHandler(void) {
}

void FindChildElementCommandHandler::ExecuteInternal(
    const IECommandExecutor& executor,
    const ParametersMap& command_parameters,
    Response* response) {
  ParametersMap::const_iterator id_parameter_iterator = command_parameters.find("id");
  ParametersMap::const_iterator using_parameter_iterator = command_parameters.find("using");
  ParametersMap::const_iterator value_parameter_iterator = command_parameters.find("value");
  if (id_parameter_iterator == command_parameters.end()) {
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT, "Missing parameter in URL: id");
    return;
  }
  if (using_parameter_iterator == command_parameters.end()) {
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT, "Missing parameter: using");
    return;
  }
  if (!using_parameter_iterator->second.isString()) {
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT, "using parameter must be a string");
    return;
  }
  if (value_parameter_iterator == command_parameters.end()) {
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT, "Missing parameter: value");
    return;
  }
  if (!value_parameter_iterator->second.isString()) {
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT, "value parameter must be a string");
    return;
  }

  std::string mechanism = using_parameter_iterator->second.asString();
  std::string value = value_parameter_iterator->second.asString();
  std::string element_id = id_parameter_iterator->second.asString();

  if (mechanism != "css selector" &&
      mechanism != "tag name" &&
      mechanism != "link text" &&
      mechanism != "partial link text" &&
      mechanism != "xpath") {
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT, "using parameter value '" + mechanism + "' is not a valid value");
    return;
  }

  BrowserHandle browser_wrapper;
  int status_code = executor.GetCurrentBrowser(&browser_wrapper);
  if (status_code != WD_SUCCESS) {
    response->SetErrorResponse(status_code, "Currently focused window has been closed.");
    return;
  }

  ElementHandle parent_element_wrapper;
  status_code = this->GetElement(executor,
                                 element_id,
                                 &parent_element_wrapper);

  if (status_code == WD_SUCCESS) {
    Json::Value found_element;

    int timeout = static_cast<int>(executor.implicit_wait_timeout());
    clock_t end = clock() + (timeout / 1000 * CLOCKS_PER_SEC);
    if (timeout > 0 && timeout < 1000) {
      end += 1 * CLOCKS_PER_SEC;
    }

    do {
      status_code = executor.LocateElement(parent_element_wrapper,
                                           mechanism,
                                           value,
                                           &found_element);
      if (status_code == WD_SUCCESS) {
        response->SetSuccessResponse(found_element);
        return;
      }
      if (status_code == ENOSUCHWINDOW) {
        response->SetErrorResponse(ERROR_NO_SUCH_WINDOW, 
                                   "Unable to find element on closed window");
        return;
      }
      if (status_code != ENOSUCHELEMENT) {
        response->SetErrorResponse(status_code, found_element.asString());
        return;
      }

      // Release the thread so that the browser doesn't starve.
      ::Sleep(FIND_ELEMENT_WAIT_TIME_IN_MILLISECONDS);
    } while (clock() < end);

    // This code is executed when status_code == ENOSUCHELEMENT
    response->SetErrorResponse(ERROR_NO_SUCH_ELEMENT, 
        "Unable to find element with " + mechanism + " == " + value);
  } else {
    if (status_code == EOBSOLETEELEMENT) {
      response->SetErrorResponse(ERROR_STALE_ELEMENT_REFERENCE,
                                 "Specified parent element is no longer attached to the DOM");
    } else {
      response->SetErrorResponse(ERROR_INVALID_ARGUMENT,
                                 "Element is no longer valid");
    }
  }
}

} // namespace webdriver
