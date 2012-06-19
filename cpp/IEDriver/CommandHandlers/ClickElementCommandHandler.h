// Copyright 2011 Software Freedom Conservancy
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
        if (executor.enable_native_events()) {
          if (IsOptionElement(element_wrapper)) {
            this->ClickOption(browser_wrapper, element_wrapper, response);
            return;
          } else {
            status_code = element_wrapper->Click(executor.scroll_behavior());
            browser_wrapper->set_wait_required(true);
            if (status_code != SUCCESS) {
              if (status_code == EELEMENTCLICKPOINTNOTSCROLLED) {
                // We hard-code the error code here to be "Element not visible"
                // to maintain compatibility with previous behavior.
                response->SetErrorResponse(EELEMENTNOTDISPLAYED, "The point at which the driver is attempting to click on the element was not scrolled into the viewport.");
              } else {
                response->SetErrorResponse(status_code, "Cannot click on element");
              }
              return;
            }
          }
        } else {
          std::wstring script_source = L"(function() { return function(){" + 
                                       atoms::asString(atoms::INPUTS) + 
                                       L"; return webdriver.atoms.inputs.click(arguments[0], arguments[1]);" + 
                                       L"};})();";

          CComPtr<IHTMLDocument2> doc;
          browser_wrapper->GetDocument(&doc);
          Script script_wrapper(doc, script_source, 2);
          script_wrapper.AddArgument(element_wrapper);
          script_wrapper.AddArgument(executor.mouse_state());
          status_code = script_wrapper.Execute();
          if (status_code != SUCCESS) {
            // This is a hack. We should change this when we can get proper error
            // codes back from the atoms. We'll assume the script failed because
            // the element isn't visible.
            response->SetErrorResponse(EELEMENTNOTDISPLAYED, 
                "Received a JavaScript error attempting to click on the element using synthetic events. We are assuming this is because the element isn't displayed, but it may be due to other problems with executing JavaScript.");
            return;
          } else {
            IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
            mutable_executor.set_mouse_state(script_wrapper.result());
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
