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

#include "GetElementTextCommandHandler.h"
#include "errorcodes.h"
#include "../Browser.h"
#include "../Element.h"
#include "../Generated/atoms.h"
#include "../IECommandExecutor.h"
#include "../Script.h"

namespace webdriver {

GetElementTextCommandHandler::GetElementTextCommandHandler(void) {
}

GetElementTextCommandHandler::~GetElementTextCommandHandler(void) {
}

void GetElementTextCommandHandler::ExecuteInternal(
    const IECommandExecutor& executor,
    const ParametersMap& command_parameters,
    Response* response) {
  ParametersMap::const_iterator id_parameter_iterator = command_parameters.find("id");
  if (id_parameter_iterator == command_parameters.end()) {
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT, "Missing parameter in URL: id");
    return;
  } else {
    std::string element_id = id_parameter_iterator->second.asString();

    BrowserHandle browser_wrapper;
    int status_code = executor.GetCurrentBrowser(&browser_wrapper);
    if (status_code != WD_SUCCESS) {
      response->SetErrorResponse(status_code, "Unable to get browser");
      return;
    }

    ElementHandle element_wrapper;
    status_code = this->GetElement(executor, element_id, &element_wrapper);
    if (status_code == WD_SUCCESS) {
      // The atom is just the definition of an anonymous
      // function: "function() {...}"; Wrap it in another function so
      // we can invoke it with our arguments without polluting the
      // current namespace.
      std::wstring script_source = L"(function() { return (";
      script_source += atoms::asString(atoms::GET_TEXT);
      script_source += L")})();";

      CComPtr<IHTMLDocument2> doc;
      browser_wrapper->GetDocument(&doc);
      Script script_wrapper(doc, script_source, 1);
      script_wrapper.AddArgument(element_wrapper->element());
      status_code = script_wrapper.Execute();

      if (status_code == WD_SUCCESS) {
        Json::Value text_value;
        IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
        int is_null = script_wrapper.ConvertResultToJsonValue(mutable_executor.element_manager(), &text_value);
        if (!text_value.isString()) {
          // This really should never happen, since we're executing an atom
          // over which we have complete control. Nevertheless, check for
          // the error here, just in case.
          response->SetErrorResponse(ERROR_JAVASCRIPT_ERROR,
                                     "Atom retrieving text was executed, but did not return a string");
          return;
        }
        response->SetSuccessResponse(text_value.asString());
        return;
      } else {
        response->SetErrorResponse(status_code,
                                   "Unable to get element text");
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
