// Copyright 2011 Software Freedom Conservatory
// Licensed under the Apache License, Version 2.0 (the "License");
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

#ifndef WEBDRIVER_IE_CLICKELEMENTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_CLICKELEMENTCOMMANDHANDLER_H_

#include "../Generated/atoms.h"
#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"
#include "logging.h"

namespace webdriver {

class ClickElementCommandHandler : public IECommandHandler {
 public:
  ClickElementCommandHandler(void) {
  }

  virtual ~ClickElementCommandHandler(void) {
  }

 protected:
  void ExecuteInternal(const IECommandExecutor& executor,
                       const LocatorMap& locator_parameters,
                       const ParametersMap& command_parameters,
                       Response* response) {
    LocatorMap::const_iterator id_parameter_iterator = locator_parameters.find("id");
    if (id_parameter_iterator == locator_parameters.end()) {
      response->SetErrorResponse(400, "Missing parameter in URL: id");
      return;
    } else {
      int status_code = SUCCESS;
      std::string element_id = id_parameter_iterator->second;

      BrowserHandle browser_wrapper;
      status_code = executor.GetCurrentBrowser(&browser_wrapper);
      if (status_code != SUCCESS) {
        response->SetErrorResponse(status_code, "Unable to get browser");
        return;
      }

      ElementHandle element_wrapper;
      status_code = this->GetElement(executor, element_id, &element_wrapper);
      if (status_code == SUCCESS) {
        if (this->ClickOption(browser_wrapper, element_wrapper, response)) {
          return;
        } else {
          status_code = element_wrapper->Click();
          browser_wrapper->set_wait_required(true);
          if (status_code != SUCCESS) {
            response->SetErrorResponse(status_code, "Cannot click on element");
            return;
          }
        }
      } else {
        response->SetErrorResponse(status_code, "Element is no longer valid");
        return;
      }

      response->SetSuccessResponse(Json::Value::null);
    }
  }

 private:
  bool ClickOption(BrowserHandle browser_wrapper,
                   ElementHandle element_wrapper,
                   Response* response) {
    CComQIPtr<IHTMLOptionElement> option(element_wrapper->element());
    if (option == NULL) {
      return false;
    }

    // This is a simulated click. There may be issues if there are things like
    // alert() messages in certain events. A potential way to handle these
    // problems is to marshal the select element onto a separate thread and
    // perform the operation there.
    CComPtr<IHTMLElement> parent_element;
    HRESULT hr = element_wrapper->element()->get_parentElement(&parent_element);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Cannot get parent element";
      response->SetErrorResponse(ENOSUCHELEMENT, "cannot get parent element");
      return true;
    }

    CComPtr<IHTMLSelectElement> select;
    HRESULT select_hr = parent_element.QueryInterface<IHTMLSelectElement>(&select);
    while (SUCCEEDED(hr) && FAILED(select_hr)) {
      hr = parent_element->get_parentElement(&parent_element);
      select_hr = parent_element.QueryInterface<IHTMLSelectElement>(&select);
    }

    if (!select) {
      LOG(WARN) << "Parent element is not a select element";
      response->SetErrorResponse(ENOSUCHELEMENT,
                                 "Parent element is not a select element");
      return true;
    }

    VARIANT_BOOL multiple;
    hr = select->get_multiple(&multiple);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Cannot determine if parent element supports multiple selection";
      response->SetErrorResponse(ENOSUCHELEMENT,
                                 "Cannot determine if parent element supports multiple selection");
      return true;
    }

    bool parent_is_multiple = multiple == VARIANT_TRUE;

    int status_code = SUCCESS;
    CComPtr<IHTMLDocument2> doc;
    browser_wrapper->GetDocument(&doc);

    // The atom is just the definition of an anonymous
    // function: "function() {...}"; Wrap it in another function so we can
    // invoke it with our arguments without polluting the current namespace.
    std::wstring script_source = L"(function() { return (";
    script_source += atoms::asString(atoms::CLICK);
    script_source += L")})();";

    // If not multi-select, click the parent (<select>) element.
    if (!parent_is_multiple) {
      Script click_parent_script_wrapper(doc, script_source, 1);
      click_parent_script_wrapper.AddArgument(parent_element);
      status_code = click_parent_script_wrapper.Execute();
    }

    Script script_wrapper(doc, script_source, 1);
    script_wrapper.AddArgument(element_wrapper->element());
    status_code = script_wrapper.Execute();

    // Require a short sleep here to let the browser update the DOM.
    ::Sleep(100);
    response->SetSuccessResponse(Json::Value::null);
    return true;
  }
};

} // namespace webdriver

#endif // WEBDRIVER_IE_CLICKELEMENTCOMMANDHANDLER_H_
