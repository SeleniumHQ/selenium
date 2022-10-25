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
#include "logging.h"
#include "../Browser.h"
#include "../Element.h"
#include "../Generated/atoms.h"
#include "../IECommandExecutor.h"
#include "../InputManager.h"
#include "../Script.h"
#include "../StringUtilities.h"
#include "../WebDriverConstants.h"

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
      if (this->IsFileUploadElement(element_wrapper)) {
        response->SetErrorResponse(ERROR_INVALID_ARGUMENT, "Cannot call click on an <input type='file'> element. Use sendKeys to upload files.");
        return;
      }
      std::string navigation_url = "";
      bool reattach_after_click = false;
      if (this->IsPossibleNavigation(element_wrapper, &navigation_url)) {
        reattach_after_click = browser_wrapper->IsCrossZoneUrl(navigation_url);
      }
      if (executor.input_manager()->enable_native_events()) {
        if (this->IsOptionElement(element_wrapper)) {
          std::string option_click_error = "";
          status_code = this->ExecuteAtom(executor,
                                          this->GetClickAtom(),
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
            
          Json::Value parameters_value;
          parameters_value["pointerType"] = "mouse";

          Json::Value value;
          value["type"] = "pointer";
          value["id"] = "click action mouse";
          value["parameters"] = parameters_value;
          value["actions"] = action_array;

          Json::Value actions(Json::arrayValue);
          actions.append(value);

          int double_click_time = ::GetDoubleClickTime();
          int milliseconds_since_last_click = (clock() - executor.input_manager()->last_click_time()) * CLOCKS_PER_SEC / 1000;
          if (double_click_time - milliseconds_since_last_click > 0) {
            ::Sleep(double_click_time - milliseconds_since_last_click);
          }

          // Scroll the target element into view before executing the action
          // sequence.
          LocationInfo location = {};
          std::vector<LocationInfo> frame_locations;
          status_code = element_wrapper->GetLocationOnceScrolledIntoView(executor.input_manager()->scroll_behavior(),
                                                                         &location,
                                                                         &frame_locations);

          bool displayed;
          status_code = element_wrapper->IsDisplayed(true, &displayed);
          if (status_code != WD_SUCCESS || !displayed) {
            response->SetErrorResponse(EELEMENTNOTDISPLAYED,
                                       "Element is not displayed");
            return;
          }

          LocationInfo click_location = {};
          long obscuring_element_index = -1;
          std::string obscuring_element_description = "";
          bool obscured = element_wrapper->IsObscured(&click_location,
                                                      &obscuring_element_index,
                                                      &obscuring_element_description);
          if (obscured) {
            std::string error_msg = StringUtilities::Format("Element not clickable at point (%d,%d). Other element would receive the click: %s (elementsFromPoint index %d)",
                                                            click_location.x,
                                                            click_location.y,
                                                            obscuring_element_description.c_str(),
                                                            obscuring_element_index);
            response->SetErrorResponse(ERROR_ELEMENT_CLICK_INTERCEPTED, error_msg);
            return;
          }

          if (reattach_after_click) {
            browser_wrapper->InitiateBrowserReattach();
          }
          std::string error_info = "";
          IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
          status_code = mutable_executor.input_manager()->PerformInputSequence(browser_wrapper,
                                                                               actions,
                                                                               &error_info);
          browser_wrapper->set_wait_required(true);
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
        status_code = this->ExecuteAtom(executor,
                                        this->GetSyntheticClickAtom(),
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

bool ClickElementCommandHandler::IsOptionElement(ElementHandle element_wrapper) {
  CComPtr<IHTMLOptionElement> option;
  HRESULT(hr) = element_wrapper->element()->QueryInterface<IHTMLOptionElement>(&option);
  return SUCCEEDED(hr) && !!option;
}

std::wstring ClickElementCommandHandler::GetSyntheticClickAtom() {
  std::wstring script_source = L"(function() { return function(){" + 
  atoms::asString(atoms::INPUTS_BIN) + 
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
    const IECommandExecutor& executor,
    const std::wstring& atom_script_source,
    BrowserHandle browser_wrapper,
    ElementHandle element_wrapper,
    std::string* error_msg) {
  HWND async_executor_handle;
  CComPtr<IHTMLDocument2> doc;
  browser_wrapper->GetDocument(&doc);
  Script script_wrapper(doc, atom_script_source);
  Json::Value args(Json::arrayValue);
  args.append(element_wrapper->ConvertToJson());
  int status_code = script_wrapper.ExecuteAsync(executor,
                                                args,
                                                ASYNC_SCRIPT_EXECUTION_TIMEOUT_IN_MILLISECONDS,
                                                &async_executor_handle);
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

bool ClickElementCommandHandler::IsFileUploadElement(ElementHandle element) {
  CComPtr<IHTMLInputFileElement> file;
  element->element()->QueryInterface<IHTMLInputFileElement>(&file);
  CComPtr<IHTMLInputElement> input;
  element->element()->QueryInterface<IHTMLInputElement>(&input);
  CComBSTR element_type;
  if (input) {
    input->get_type(&element_type);
    HRESULT hr = element_type.ToLower();
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Failed converting type attribute of <input> element to lowercase using ToLower() method of BSTR";
    }
  }
  bool is_file_element = (file != NULL) ||
                         (input != NULL && element_type == L"file");
  return is_file_element;
}

bool ClickElementCommandHandler::IsPossibleNavigation(ElementHandle element_wrapper,
                                                      std::string* url) {
  CComPtr<IHTMLAnchorElement> anchor;
  element_wrapper->element()->QueryInterface<IHTMLAnchorElement>(&anchor);
  if (anchor) {
    CComVariant href_value;
    element_wrapper->GetAttributeValue("href", &href_value);
    if (href_value.vt == VT_BSTR) {
      std::wstring wide_url = href_value.bstrVal;
      CComPtr<IUri> parsed_url;
      ::CreateUri(wide_url.c_str(), Uri_CREATE_ALLOW_RELATIVE, 0, &parsed_url);
      DWORD url_scheme = 0;
      parsed_url->GetScheme(&url_scheme);
      if (url_scheme == URL_SCHEME_HTTPS || url_scheme == URL_SCHEME_HTTP) {
        *url = StringUtilities::ToString(wide_url);
        return true;
      }
    }
  }
  return false;
}

} // namespace webdriver
