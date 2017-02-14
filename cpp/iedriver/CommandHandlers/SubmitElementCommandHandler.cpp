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

#include "SubmitElementCommandHandler.h"
#include "errorcodes.h"
#include "../Browser.h"
#include "../Element.h"
#include "../Generated/atoms.h"
#include "../IECommandExecutor.h"
#include "../InputManager.h"
#include "../Script.h"
#include "../StringUtilities.h"

namespace webdriver {

SubmitElementCommandHandler::SubmitElementCommandHandler(void) {
}

SubmitElementCommandHandler::~SubmitElementCommandHandler(void) {
}

void SubmitElementCommandHandler::ExecuteInternal(
    const IECommandExecutor& executor,
    const ParametersMap& command_parameters,
    Response* response) {
  ParametersMap::const_iterator id_parameter_iterator = command_parameters.find("id");
  if (id_parameter_iterator == command_parameters.end()) {
    response->SetErrorResponse(400, "Missing parameter in URL: id");
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
      if (!this->FindParentForm(element_wrapper)) {
        response->SetErrorResponse(ENOSUCHELEMENT, "Requested element is not within a form, and thus cannot be submitted");
        return;
      }
      // Use native events if we can. If not, use the automation atom.
      bool handled_with_native_events = false;
      CComPtr<IHTMLInputElement> input;
      element_wrapper->element()->QueryInterface<IHTMLInputElement>(&input);
      if (input) {
        CComBSTR type_name;
        input->get_type(&type_name);

        std::wstring type(type_name);

        if (_wcsicmp(L"submit", type.c_str()) == 0 ||
            _wcsicmp(L"image", type.c_str()) == 0) {
          Json::Value move_action;
          move_action["action"] = "moveto";
          move_action["element"] = element_wrapper->element_id();

          Json::Value click_action;
          click_action["action"] = "click";
          click_action["button"] = 0;
            
          Json::UInt index = 0;
          Json::Value actions(Json::arrayValue);
          actions[index] = move_action;
          ++index;
          actions[index] = click_action;
            
          IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
          status_code = mutable_executor.input_manager()->PerformInputSequence(browser_wrapper, actions);
          handled_with_native_events = true;
        }
      }

      if (!handled_with_native_events) {
        std::string submit_error = "";
        status_code = this->ExecuteAtom(browser_wrapper,
                                        element_wrapper,
                                        &submit_error);
        if (status_code != WD_SUCCESS) {
          response->SetErrorResponse(status_code,
                                      "Error submitting when not using native events. " + submit_error);
          return;
        }
      }
      browser_wrapper->set_wait_required(true);
      response->SetSuccessResponse(Json::Value::null);
      return;
    } else {
      response->SetErrorResponse(status_code, "Element is no longer valid");
      return;
    }
  }
}

bool SubmitElementCommandHandler::FindParentForm(
    ElementHandle element_wrapper) {
  CComPtr<IHTMLElement> current(element_wrapper->element());
  while (current) {
    CComPtr<IHTMLFormElement> form;
    HRESULT hr = current->QueryInterface<IHTMLFormElement>(&form);
    if (SUCCEEDED(hr) && form) {
      return true;
    }

    CComPtr<IHTMLElement> temp;
    hr = current->get_parentElement(&temp);
    if (FAILED(hr)) {
      return false;
    }
    current = temp;
  }
  return false;
}

int SubmitElementCommandHandler::ExecuteAtom(BrowserHandle browser_wrapper,
                                              ElementHandle element_wrapper,
                                              std::string* error_msg) {
  // The atom is just the definition of an anonymous
  // function: "function() {...}"; Wrap it in another function so we can
  // invoke it with our arguments without polluting the current namespace.
  std::wstring script_source = L"(function() { return (";
  script_source += atoms::asString(atoms::SUBMIT);
  script_source += L")})();";

  CComPtr<IHTMLDocument2> doc;
  browser_wrapper->GetDocument(&doc);
  Script script_wrapper(doc, script_source, 1);
  script_wrapper.AddArgument(element_wrapper);
  int status_code = script_wrapper.ExecuteAsync(ASYNC_SCRIPT_EXECUTION_TIMEOUT_IN_MILLISECONDS);
  if (status_code != WD_SUCCESS) {
    if (script_wrapper.ResultIsString()) {
      std::wstring error = script_wrapper.result().bstrVal;
      *error_msg = StringUtilities::ToString(error);
    } else {
      std::string error = "Executing JavaScript submit function returned an";
      error.append(" unexpected error, but no error could be returned from");
      error.append(" Internet Explorer's JavaScript engine.");
      *error_msg = error;
    }
  }
  return status_code;
}

} // namespace webdriver
