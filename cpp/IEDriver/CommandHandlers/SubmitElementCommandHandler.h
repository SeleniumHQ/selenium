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

#ifndef WEBDRIVER_IE_SUBMITELEMENTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_SUBMITELEMENTCOMMANDHANDLER_H_

#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"
#include "../Generated/atoms.h"

namespace webdriver {

class SubmitElementCommandHandler : public IECommandHandler {
 public:
  SubmitElementCommandHandler(void) {
  }

  virtual ~SubmitElementCommandHandler(void) {
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
      std::string element_id = id_parameter_iterator->second;

      BrowserHandle browser_wrapper;
      int status_code = executor.GetCurrentBrowser(&browser_wrapper);
      if (status_code != SUCCESS) {
        response->SetErrorResponse(status_code, "Unable to get browser");
        return;
      }

      ElementHandle element_wrapper;
      status_code = this->GetElement(executor, element_id, &element_wrapper);
      if (status_code == SUCCESS) {
        // Use native events if we can. If not, use the automation atom.
        bool handled_with_native_events = false;
        CComQIPtr<IHTMLInputElement> input(element_wrapper->element());
        if (input) {
          CComBSTR type_name;
          input->get_type(&type_name);

          std::wstring type(type_name);

          if (_wcsicmp(L"submit", type.c_str()) == 0 ||
              _wcsicmp(L"image", type.c_str()) == 0) {
            element_wrapper->Click(executor.scroll_behavior());
            handled_with_native_events = true;
          }
        }

        if (!handled_with_native_events) {
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
          status_code = script_wrapper.Execute();

          if (status_code != SUCCESS) {
            response->SetErrorResponse(status_code,
                                       "Error submitting when not using native events");
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

 private:
  void SubmitElementCommandHandler::FindParentForm(IHTMLElement *element,
                                                   IHTMLFormElement **form_element) {
    CComQIPtr<IHTMLElement> current(element);

    while (current) {
      CComQIPtr<IHTMLFormElement> form(current);
      if (form) {
        *form_element = form.Detach();
        return;
      }

      CComPtr<IHTMLElement> temp;
      current->get_parentElement(&temp);
      current = temp;
    }
  }
};

} // namespace webdriver

#endif // WEBDRIVER_IE_SUBMITELEMENTCOMMANDHANDLER_H_
