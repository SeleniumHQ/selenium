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
        if (IsOptionElement(element_wrapper)) {
          this->ClickOption(browser_wrapper, element_wrapper, response);
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
  bool IsOptionElement(ElementHandle element_wrapper) {
    CComQIPtr<IHTMLOptionElement> option(element_wrapper->element());
    return option != NULL;
  }

  void ClickOption(BrowserHandle browser_wrapper,
                   ElementHandle element_wrapper,
                   Response* response) {
    int status_code = SUCCESS;
    CComPtr<IHTMLDocument2> doc;
    browser_wrapper->GetDocument(&doc);

    // The atom is just the definition of an anonymous
    // function: "function() {...}"; Wrap it in another function so we can
    // invoke it with our arguments without polluting the current namespace.
    std::wstring script_source = L"(function() { return (";
    script_source += atoms::asString(atoms::CLICK);
    script_source += L")})();";

    Script script_wrapper(doc, script_source, 1);
    script_wrapper.AddArgument(element_wrapper);
    status_code = script_wrapper.Execute();
    if (status_code != SUCCESS) {
      response->SetErrorResponse(status_code,
                                 "An error occurred executing the click atom");
      return;
    }

    // Require a short sleep here to let the browser update the DOM.
    ::Sleep(100);
    response->SetSuccessResponse(Json::Value::null);
  }
};

} // namespace webdriver

#endif // WEBDRIVER_IE_CLICKELEMENTCOMMANDHANDLER_H_
