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

#include "IECommandHandler.h"

#include "command_handler.h"
#include "errorcodes.h"
#include "logging.h"

#include "DocumentHost.h"
#include "Element.h"
#include "IECommandExecutor.h"

namespace webdriver {

IECommandHandler::IECommandHandler() {
}

IECommandHandler::~IECommandHandler() {
}

void IECommandHandler::ExecuteInternal(const IECommandExecutor& executor,
                                       const ParametersMap& command_parameters,
                                       Response* response) {
  LOG(TRACE) << "Entering IECommandHandler::ExecuteInternal";
  response->SetErrorResponse(501, "Command not implemented");
}

int IECommandHandler::GetElement(const IECommandExecutor& executor,
                                 const std::string& element_id,
                                 ElementHandle* element_wrapper) {
  LOG(TRACE) << "Entering IECommandHandler::GetElement";

  ElementHandle candidate_wrapper;
  int result = executor.GetManagedElement(element_id, &candidate_wrapper);
  if (result != WD_SUCCESS) {
    // This bears some explanation. Technically, passing an invalid ID in the
    // URL for an element command should result in a 404. However, since the
    // language bindings don't make up their own element IDs, any call from
    // a language binding is more than likely an ID that the IE driver assigned
    // it, and it was at one time valid. Therefore, we'll assume that not finding
    // the element ID in the cache means it's stale.
    LOG(WARN) << "Unable to get managed element, element not found, assuming stale";
    return EOBSOLETEELEMENT;
  } else {
    if (!candidate_wrapper->IsAttachedToDom()) {
      LOG(WARN) << "Found managed element is no longer valid";
      IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
      mutable_executor.RemoveManagedElement(element_id);
      return EOBSOLETEELEMENT;
    } else {
      // If the element is attached to the DOM, validate that its document
      // is the currently-focused document (via frames).
      BrowserHandle current_browser;
      executor.GetCurrentBrowser(&current_browser);
      CComPtr<IHTMLDocument2> focused_doc;
      current_browser->GetDocument(&focused_doc);

      CComPtr<IDispatch> parent_doc_dispatch;
      candidate_wrapper->element()->get_document(&parent_doc_dispatch);

      if (focused_doc.IsEqualObject(parent_doc_dispatch)) {
        *element_wrapper = candidate_wrapper;
        return WD_SUCCESS;
      } else {
        LOG(WARN) << "Found managed element's document is not currently focused";
      }
    }
  }

  return EOBSOLETEELEMENT;
}

Json::Value IECommandHandler::RecreateJsonParameterObject(const ParametersMap& command_parameters) {
  Json::Value result;
  ParametersMap::const_iterator param_iterator = command_parameters.begin();
  for (; param_iterator != command_parameters.end(); ++param_iterator) {
    std::string key = param_iterator->first;
    Json::Value value = param_iterator->second;
    result[key] = value;
  }
  return result;
}

} // namespace webdriver