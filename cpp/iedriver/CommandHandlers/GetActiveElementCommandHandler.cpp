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

#include "GetActiveElementCommandHandler.h"
#include "errorcodes.h"
#include "../Browser.h"
#include "../Element.h"
#include "../IECommandExecutor.h"

namespace webdriver {

GetActiveElementCommandHandler::GetActiveElementCommandHandler(void) {
}

GetActiveElementCommandHandler::~GetActiveElementCommandHandler(void) {
}

void GetActiveElementCommandHandler::ExecuteInternal(
  const IECommandExecutor& executor,
  const ParametersMap& command_parameters,
  Response* response) {
  BrowserHandle browser_wrapper;
  int status_code = executor.GetCurrentBrowser(&browser_wrapper);
  if (status_code != WD_SUCCESS) {
    response->SetErrorResponse(ERROR_NO_SUCH_WINDOW, "Unable to get browser");
    return;
  }

  CComPtr<IHTMLDocument2> doc;
  browser_wrapper->GetDocument(&doc);
  if (!doc) {
    response->SetErrorResponse(ERROR_NO_SUCH_WINDOW, "Document is not found");
    return;
  }

  CComPtr<IHTMLElement> element(NULL);
  HRESULT hr = doc->get_activeElement(&element);

  if (FAILED(hr)) {
    // For some contentEditable frames, the <body> element will be the
    // active element. However, to properly have focus, we must explicitly
    // set focus to the element.
    CComPtr<IHTMLBodyElement> body_element;
    HRESULT body_hr = element->QueryInterface<IHTMLBodyElement>(&body_element);
    if (body_element) {
      CComPtr<IHTMLElement2> body_element2;
      body_element->QueryInterface<IHTMLElement2>(&body_element2);
      body_element2->focus();
    }
  }

  // If we don't have an element at this point, but the document
  // has a body element, we should return a null result, as that's
  // what document.activeElement() returns. However, if there is no
  // body element, throw no such element.
  if (!element) {
    CComPtr<IHTMLElement> body;
    hr = doc->get_body(&body);
    if (body) {
      response->SetSuccessResponse(Json::Value::null);
    } else {
      response->SetErrorResponse(ERROR_NO_SUCH_ELEMENT, "No active element found, and no body element present.");
    }
    return;
  }

  if (element) {
    IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
    ElementHandle element_wrapper;
    mutable_executor.AddManagedElement(element, &element_wrapper);
    response->SetSuccessResponse(element_wrapper->ConvertToJson());
  } else {
    response->SetErrorResponse(ERROR_NO_SUCH_ELEMENT, "An unexpected error occurred getting the active element");
  }
}

} // namespace webdriver
