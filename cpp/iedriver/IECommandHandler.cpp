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
    LOG(WARN) << "Unable to get managed element, element not found";
    return result;
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

      if (candidate_wrapper->IsDocumentFocused(focused_doc)) {
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
