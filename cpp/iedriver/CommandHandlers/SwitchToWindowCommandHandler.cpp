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

#include "SwitchToWindowCommandHandler.h"
#include "errorcodes.h"
#include "../Browser.h"
#include "../IECommandExecutor.h"

namespace webdriver {

SwitchToWindowCommandHandler::SwitchToWindowCommandHandler(void) {
}

SwitchToWindowCommandHandler::~SwitchToWindowCommandHandler(void) {
}

void SwitchToWindowCommandHandler::ExecuteInternal(
    const IECommandExecutor& executor,
    const ParametersMap& command_parameters,
    Response* response) {
  ParametersMap::const_iterator name_parameter_iterator = command_parameters.find("handle");
  if (name_parameter_iterator == command_parameters.end()) {
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT, "Missing parameter: name");
    return;
  } else {
    std::string found_browser_handle = "";
    std::string desired_name = name_parameter_iterator->second.asString();	  

    unsigned int limit = 10;
    unsigned int tries = 0;
    do {
      tries++;

      std::vector<std::string> handle_list;
      executor.GetManagedBrowserHandles(&handle_list);

      for (unsigned int i = 0; i < handle_list.size(); ++i) {
        BrowserHandle browser_wrapper;
        int get_handle_loop_status_code = executor.GetManagedBrowser(handle_list[i],
                                                                     &browser_wrapper);
        if (get_handle_loop_status_code == WD_SUCCESS) {
          std::string browser_handle = handle_list[i];
          if (browser_handle == desired_name) {
            found_browser_handle = handle_list[i];
            break;
          }
        }
      }

      // Wait until new window name becomes available
      ::Sleep(100);
    } while (tries < limit && found_browser_handle == "");

    if (found_browser_handle == "") {
      response->SetErrorResponse(ERROR_NO_SUCH_WINDOW, "No window found");
      return;
    } else {
      // Reset the path to the focused frame before switching window context.
      BrowserHandle current_browser;
      int status_code = executor.GetCurrentBrowser(&current_browser);
      if (status_code == WD_SUCCESS) {
        current_browser->SetFocusedFrameByElement(NULL);
      }

      IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
      mutable_executor.set_current_browser_id(found_browser_handle);
      status_code = executor.GetCurrentBrowser(&current_browser);
      current_browser->set_wait_required(true);
      response->SetSuccessResponse(Json::Value::null);
    }
  }
}

} // namespace webdriver
