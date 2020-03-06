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

#include "ClearElementCommandHandler.h"
#include "errorcodes.h"
#include "../Browser.h"
#include "../Element.h"
#include "../IECommandExecutor.h"
#include "../Generated/atoms.h"
#include "../Script.h"
#include "../WebDriverConstants.h"

namespace webdriver {

ClearElementCommandHandler::ClearElementCommandHandler(void) {
}

ClearElementCommandHandler::~ClearElementCommandHandler(void) {
}

void ClearElementCommandHandler::ExecuteInternal(
    const IECommandExecutor& executor,
    const ParametersMap& command_parameters,
    Response* response) {
  ParametersMap::const_iterator id_parameter_iterator = command_parameters.find("id");
  if (id_parameter_iterator == command_parameters.end()) {
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT, "Missing parameter in URL: id");
    return;
  } else {
    int status_code = WD_SUCCESS;
    std::string element_id = id_parameter_iterator->second.asString();

    BrowserHandle browser_wrapper;
    status_code = executor.GetCurrentBrowser(&browser_wrapper);
    if (status_code != WD_SUCCESS) {
      response->SetErrorResponse(status_code, "Unable to get browser");
      return;
    }

    ElementHandle element_wrapper;
    status_code = this->GetElement(executor, element_id, &element_wrapper);
    if (status_code == WD_SUCCESS) {
      // Yes, the clear atom should check this for us, but executing it asynchronously
      // does not return the proper error code when this error condition is encountered.
      // Thus, we'll check the interactable and editable states of the element before 
      // attempting to clear it.
      if (!element_wrapper->IsEditable() || !element_wrapper->IsEnabled()) {
        response->SetErrorResponse(ERROR_INVALID_ELEMENT_STATE,
                                   "Element must not be read-only or disabled");
        return;
      }
      if (!element_wrapper->IsInteractable()) {
        response->SetErrorResponse(ERROR_ELEMENT_NOT_INTERACTABLE,
                                   "Element is not interactable, it must not be hidden and it must be able to receive focus");
        return;
      }

      // The atom is just the definition of an anonymous
      // function: "function() {...}"; Wrap it in another function so we can
      // invoke it with our arguments without polluting the current namespace.
      std::wstring script_source = L"(function() { return (";
      script_source += atoms::asString(atoms::CLEAR);
      script_source += L")})();";

      Json::Value args(Json::arrayValue);
      args.append(element_wrapper->ConvertToJson());

      HWND async_executor_handle;
      CComPtr<IHTMLDocument2> doc;
      browser_wrapper->GetDocument(&doc);
      Script script_wrapper(doc, script_source);
      status_code = script_wrapper.ExecuteAsync(executor,
                                                args,
                                                ASYNC_SCRIPT_EXECUTION_TIMEOUT_IN_MILLISECONDS,
                                                &async_executor_handle);
      if (status_code != WD_SUCCESS) {
        // Assume that a JavaScript error returned by the atom is that
        // the element is either invisible, disabled, or read-only.
        // This may be a bad assumption, but we currently have no way
        // to get information about exceptions thrown from JS.
        response->SetErrorResponse(EELEMENTNOTENABLED,
                                    "A JavaScript error was encountered clearing the element. The driver assumes this is because the element is hidden, disabled or read-only, and it must not be to clear the element.");
        return;
      }
    } else if (status_code == ENOSUCHELEMENT) {
      response->SetErrorResponse(ERROR_NO_SUCH_ELEMENT, "Invalid internal element ID requested: " + element_id);
      return;
    } else {
      response->SetErrorResponse(status_code, "Element is no longer valid");
      return;
    }

    response->SetSuccessResponse(Json::Value::null);
  }
}

} // namespace webdriver
