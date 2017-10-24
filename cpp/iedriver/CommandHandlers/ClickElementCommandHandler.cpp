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

#define CLICK_OPTION_EVENT_NAME L"ClickOptionEvent"

#include "ClickElementCommandHandler.h"
#include "errorcodes.h"
#include "../Browser.h"
#include "../Element.h"
#include "../Generated/atoms.h"
#include "../IECommandExecutor.h"
#include "../InputManager.h"
#include "../Script.h"
#include "../StringUtilities.h"

namespace webdriver {

ClickElementCommandHandler::ClickElementCommandHandler(void) {
}

ClickElementCommandHandler::~ClickElementCommandHandler(void) {
}

void ClickElementCommandHandler::ExecuteInternal(const IECommandExecutor& executor,
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
      if (executor.input_manager()->enable_native_events()) {
        if (this->IsOptionElement(element_wrapper)) {
          std::string option_click_error = "";
          status_code = this->ExecuteAtom(this->GetClickAtom(),
                                          browser_wrapper,
                                          element_wrapper,
                                          &option_click_error);
          if (status_code != WD_SUCCESS) {
            response->SetErrorResponse(status_code, "Cannot click on option element. " + option_click_error);
            return;
          }
        } else {
          Json::Value move_action;
          move_action["type"] = "pointerMove";
          move_action["origin"] = element_wrapper->ConvertToJson();
          move_action["duration"] = 0;

          Json::Value down_action;
          down_action["type"] = "pointerDown";
          down_action["button"] = 0;
            
          Json::Value up_action;
          up_action["type"] = "pointerUp";
          up_action["button"] = 0;

          Json::Value action_array(Json::arrayValue);
          action_array.append(move_action);
          action_array.append(down_action);
          action_array.append(up_action);
            
          // Check to make sure we're not within the double-click time for this element
          // since the last click.
          int double_click_time = ::GetDoubleClickTime();

          Json::Value parameters_value;
          parameters_value["pointerType"] = "mouse";

          Json::Value value;
          value["type"] = "pointer";
          value["id"] = "click action mouse";
          value["parameters"] = parameters_value;
          value["actions"] = action_array;

          Json::Value actions(Json::arrayValue);
          actions.append(value);

          IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
          status_code = mutable_executor.input_manager()->PerformInputSequence(browser_wrapper, actions);
          browser_wrapper->set_wait_required(true);
          ::Sleep(double_click_time + 10);
          if (status_code != WD_SUCCESS) {
            if (status_code == EELEMENTCLICKPOINTNOTSCROLLED) {
              // We hard-code the error code here to be "Element not visible"
              // to maintain compatibility with previous behavior.
              response->SetErrorResponse(ERROR_ELEMENT_NOT_INTERACTABLE, "The point at which the driver is attempting to click on the element was not scrolled into the viewport.");
            } else {
              response->SetErrorResponse(status_code, "Cannot click on element");
            }
            return;
          }
        }
      } else {
        bool displayed;
        status_code = element_wrapper->IsDisplayed(true, &displayed);
        if (status_code != WD_SUCCESS) {
          response->SetErrorResponse(status_code, "Unable to determine element is displayed");
          return;
        } 

        if (!displayed) {
          response->SetErrorResponse(ERROR_ELEMENT_NOT_INTERACTABLE, "Element is not displayed");
          return;
        }
        std::string synthetic_click_error = "";
        status_code = this->ExecuteAtom(this->GetSyntheticClickAtom(),
                                        browser_wrapper,
                                        element_wrapper,
                                        &synthetic_click_error);
        if (status_code != WD_SUCCESS) {
          // This is a hack. We should change this when we can get proper error
          // codes back from the atoms. We'll assume the script failed because
          // the element isn't visible.
          response->SetErrorResponse(ERROR_ELEMENT_NOT_INTERACTABLE,
              "Received a JavaScript error attempting to click on the element using synthetic events. We are assuming this is because the element isn't displayed, but it may be due to other problems with executing JavaScript.");
          return;
        }
        browser_wrapper->set_wait_required(true);
      }
    } else {
      response->SetErrorResponse(status_code, "Element is no longer valid");
      return;
    }

    response->SetSuccessResponse(Json::Value::null);
  }
}

bool ClickElementCommandHandler::IsOptionElement(ElementHandle element_wrapper) {
  CComPtr<IHTMLOptionElement> option;
  HRESULT(hr) = element_wrapper->element()->QueryInterface<IHTMLOptionElement>(&option);
  return SUCCEEDED(hr) && !!option;
}

std::wstring ClickElementCommandHandler::GetSyntheticClickAtom() {
  std::wstring script_source = L"(function() { return function(){" + 
  atoms::asString(atoms::INPUTS) + 
  L"; return webdriver.atoms.inputs.click(arguments[0]);" + 
  L"};})();";
  return script_source;
}

std::wstring ClickElementCommandHandler::GetClickAtom() {
  std::wstring script_source = L"(function() { return (";
  script_source += atoms::asString(atoms::CLICK);
  script_source += L")})();";
  return script_source;
}

int ClickElementCommandHandler::ExecuteAtom(
    const std::wstring& atom_script_source,
    BrowserHandle browser_wrapper,
    ElementHandle element_wrapper,
    std::string* error_msg) {
  CComPtr<IHTMLDocument2> doc;
  browser_wrapper->GetDocument(&doc);
  Script script_wrapper(doc, atom_script_source, 1);
  script_wrapper.AddArgument(element_wrapper);
  int status_code = script_wrapper.ExecuteAsync(ASYNC_SCRIPT_EXECUTION_TIMEOUT_IN_MILLISECONDS);
  if (status_code != WD_SUCCESS) {
    if (script_wrapper.ResultIsString()) {
      std::wstring error = script_wrapper.result().bstrVal;
      *error_msg = StringUtilities::ToString(error);
    } else {
      std::string error = "Executing JavaScript click function returned an";
      error.append(" unexpected error, but no error could be returned from");
      error.append(" Internet Explorer's JavaScript engine.");
      *error_msg = error;
    }
  }
  return status_code;
}

} // namespace webdriver
