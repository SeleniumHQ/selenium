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

#include "command_handler.h"
#include "IECommandHandler.h"
#include "IECommandExecutor.h"

namespace webdriver {

IECommandHandler::IECommandHandler() {
}

IECommandHandler::~IECommandHandler() {
}

void IECommandHandler::ExecuteInternal(const IECommandExecutor& executor,
                                       const LocatorMap& locator_parameters,
                                       const ParametersMap& command_parameters,
                                       Response* response) {
  response->SetErrorResponse(501, "Command not implemented");
}

int IECommandHandler::GetElement(const IECommandExecutor& executor,
                                 const std::string& element_id,
                                 ElementHandle* element_wrapper) {
  int status_code = EOBSOLETEELEMENT;
  ElementHandle candidate_wrapper;
  int result = executor.GetManagedElement(element_id, &candidate_wrapper);
  if (result != SUCCESS) {
    status_code = 404;
  } else {
    // Verify that the element is still valid by walking up the
    // DOM tree until we find no parent or the html tag
    CComPtr<IHTMLElement> parent(candidate_wrapper->element());
    while (parent) {
      CComQIPtr<IHTMLHtmlElement> html(parent);
      if (html) {
        status_code = SUCCESS;
        *element_wrapper = candidate_wrapper;
        break;
      }

      CComPtr<IHTMLElement> next;
      HRESULT hr = parent->get_parentElement(&next);
      if (FAILED(hr)) {
        //std::cout << hr << " [" << (_bstr_t(_com_error((DWORD) hr).ErrorMessage())) << "]";
      }

      if (next == NULL) {
        BSTR tag;
        parent->get_tagName(&tag);
        //std::cout << "Found null parent of element with tag " << _bstr_t(tag);
      }
      parent = next;
    }

    if (status_code != SUCCESS) {
      IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
      mutable_executor.RemoveManagedElement(element_id);
    }
  }

  return status_code;
}

} // namespace webdriver