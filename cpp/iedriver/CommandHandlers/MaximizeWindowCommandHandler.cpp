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

#include "MaximizeWindowCommandHandler.h"
#include "errorcodes.h"
#include "../Browser.h"
#include "../IECommandExecutor.h"

namespace webdriver {

MaximizeWindowCommandHandler::MaximizeWindowCommandHandler(void) {
}

MaximizeWindowCommandHandler::~MaximizeWindowCommandHandler(void) {
}

void MaximizeWindowCommandHandler::ExecuteInternal(
    const IECommandExecutor& executor,
    const ParametersMap& command_parameters,
    Response* response) {
  ParametersMap::const_iterator id_parameter_iterator = command_parameters.find("windowHandle");
  if (id_parameter_iterator == command_parameters.end()) {
    response->SetErrorResponse(400, "Missing parameter in URL: windowHandle");
    return;
  } else {
    int status_code = WD_SUCCESS;
    std::string window_id = id_parameter_iterator->second.asString();

    BrowserHandle browser_wrapper;
    if (window_id == "current") {
      status_code = executor.GetCurrentBrowser(&browser_wrapper);
    } else {
      status_code = executor.GetManagedBrowser(window_id, &browser_wrapper);
    }
    if (status_code != WD_SUCCESS) {
      response->SetErrorResponse(status_code, "Error retrieving window with handle " + window_id);
      return;
    }

    HWND window_handle = browser_wrapper->GetTopLevelWindowHandle();
    if (!::IsZoomed(window_handle)) {
      ::ShowWindow(window_handle, SW_MAXIMIZE);
    }
    response->SetSuccessResponse(Json::Value::null);
  }
}

} // namespace webdriver
