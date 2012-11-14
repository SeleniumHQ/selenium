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

#define SUBMIT_EVENT_NAME L"SubmitEvent"

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
          std::string submit_error = "";
          if (executor.allow_asynchronous_javascript()) {
            status_code = element_wrapper->ExecuteAsyncAtom(
                SUBMIT_EVENT_NAME,
                &SubmitElementCommandHandler::SubmitFormThreadProc,
                &submit_error);
          } else {
            CComPtr<IHTMLDocument2> doc;
            browser_wrapper->GetDocument(&doc);
            CComVariant element_variant(element_wrapper->element());
            status_code = ExecuteSubmitAtom(doc, element_variant);
          }

          if (status_code != SUCCESS) {
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

  static int ExecuteSubmitAtom(IHTMLDocument2* doc, VARIANT element_variant) {
    // The atom is just the definition of an anonymous
    // function: "function() {...}"; Wrap it in another function so we can
    // invoke it with our arguments without polluting the current namespace.
    std::wstring script_source = L"(function() { return (";
    script_source += atoms::asString(atoms::SUBMIT);
    script_source += L")})();";

    Script script_wrapper(doc, script_source, 1);
    script_wrapper.AddArgument(element_variant);
    int status_code = script_wrapper.Execute();

    // Require a short sleep here to let the browser update the DOM.
    ::Sleep(100);
    return status_code;
  }

  static unsigned int WINAPI SubmitFormThreadProc(LPVOID param) {
    BOOL bRet; 
    MSG msg;
    LOG(DEBUG) << "Initializing message pump on new thread";
    ::PeekMessage(&msg, NULL, WM_USER, WM_USER, PM_NOREMOVE);

    LOG(DEBUG) << "Initializing COM on new thread";
    HRESULT hr = ::CoInitializeEx(NULL, COINIT_APARTMENTTHREADED);

    LOG(DEBUG) << "Unmarshaling document from stream";
    CComPtr<IHTMLDocument2> doc;
    LPSTREAM message_payload = reinterpret_cast<LPSTREAM>(param);
    hr = ::CoGetInterfaceAndReleaseStream(message_payload,
                                          IID_IHTMLDocument2,
                                          reinterpret_cast<void**>(&doc));

    LOG(DEBUG) << "Signaling parent thread that the worker thread is ready for messages";
    HANDLE event_handle = ::OpenEvent(EVENT_MODIFY_STATE, FALSE, SUBMIT_EVENT_NAME);
    if (event_handle != NULL) {
      ::SetEvent(event_handle);
      ::CloseHandle(event_handle);
    }

    while ((bRet = ::GetMessage(&msg, NULL, 0, 0)) != 0) {
      if (msg.message == WD_EXECUTE_ASYNC_SCRIPT) {
        LOG(DEBUG) << "Received execution message. Unmarshaling element from stream.";
        int status_code = SUCCESS;
        CComPtr<IDispatch> dispatch;
        LPSTREAM message_payload = reinterpret_cast<LPSTREAM>(param);
        hr = ::CoGetInterfaceAndReleaseStream(message_payload, IID_IDispatch, reinterpret_cast<void**>(&dispatch));
        LOG(DEBUG) << "Element unmarshaled from stream, executing JavaScript on worker thread";
        if (SUCCEEDED(hr) && dispatch != NULL) {
          CComVariant element(dispatch);
          status_code = ExecuteSubmitAtom(doc, element);

          // The atom is just the definition of an anonymous
          // function: "function() {...}"; Wrap it in another function so we can
          // invoke it with our arguments without polluting the current namespace.
          //std::wstring script_source = L"(function() { return (";
          //script_source += atoms::asString(atoms::SUBMIT);
          //script_source += L")})();";

          //Script script_wrapper(doc, script_source, 1);
          //script_wrapper.AddArgument(element);
          //status_code = script_wrapper.Execute();

          //// Require a short sleep here to let the browser update the DOM.
          //::Sleep(100);
        } else {
          status_code = EUNEXPECTEDJSERROR;
        }
        ::CoUninitialize();
        return status_code;
      }
    }

    return 0;
  }
};

} // namespace webdriver

#endif // WEBDRIVER_IE_SUBMITELEMENTCOMMANDHANDLER_H_
