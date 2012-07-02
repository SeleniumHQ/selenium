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

#ifndef WEBDRIVER_IE_GETACTIVEELEMENTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_GETACTIVEELEMENTCOMMANDHANDLER_H_

#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"

namespace webdriver {

class GetActiveElementCommandHandler : public IECommandHandler {
 public:
  GetActiveElementCommandHandler(void) 	{
  }

  virtual ~GetActiveElementCommandHandler(void) {
  }

 protected:
  void ExecuteInternal(const IECommandExecutor& executor,
                       const LocatorMap& locator_parameters,
                       const ParametersMap& command_parameters,
                       Response* response) {
    BrowserHandle browser_wrapper;
    int status_code = executor.GetCurrentBrowser(&browser_wrapper);
    if (status_code != SUCCESS) {
      response->SetErrorResponse(status_code, "Unable to get browser");
      return;
    }

    CComPtr<IHTMLDocument2> doc;
    browser_wrapper->GetDocument(&doc);
    if (!doc) {
      response->SetErrorResponse(ENOSUCHDOCUMENT, "Document is not found");
      return;
    }

    CComPtr<IHTMLElement> element;
    doc->get_activeElement(&element);

    // For some contentEditable frames, the <body> element will be the
    // active element. However, to properly have focus, we must explicitly
    // set focus to the element.
    CComQIPtr<IHTMLBodyElement> body_element(element);
    if (body_element) {
      CComQIPtr<IHTMLElement2> body_element2(body_element);
      body_element2->focus();
    }

    // If we don't have an element at this point, just return the
    // body element so that we don't return a NULL pointer.
    if (!element) {
      doc->get_body(&element);
    }

    if (element) {
      IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
      IHTMLElement* dom_element;
      HRESULT hr = element.CopyTo(&dom_element);
      ElementHandle element_wrapper;
      mutable_executor.AddManagedElement(dom_element, &element_wrapper);
      response->SetSuccessResponse(element_wrapper->ConvertToJson());
    }
  }
};

} // namespace webdriver

#endif // WEBDRIVER_IE_GETACTIVEELEMENTCOMMANDHANDLER_H_
