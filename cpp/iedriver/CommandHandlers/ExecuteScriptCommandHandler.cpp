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

#include "ExecuteScriptCommandHandler.h"
#include "errorcodes.h"
#include "logging.h"
#include "../Browser.h"
#include "../IECommandExecutor.h"
#include "../Script.h"

namespace webdriver {

ExecuteScriptCommandHandler::ExecuteScriptCommandHandler(void) {
}

ExecuteScriptCommandHandler::~ExecuteScriptCommandHandler(void) {
}

void ExecuteScriptCommandHandler::ExecuteInternal(
    const IECommandExecutor& executor,
    const ParametersMap& command_parameters,
    Response* response) {
  ParametersMap::const_iterator script_parameter_iterator = command_parameters.find("script");
  ParametersMap::const_iterator args_parameter_iterator = command_parameters.find("args");
  if (script_parameter_iterator == command_parameters.end()) {
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT,
                               "Missing parameter: script");
    return;
  }

  if (!script_parameter_iterator->second.isString()) {
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT,
                               "script parameter must be a string");
    return;
  }

  if (args_parameter_iterator == command_parameters.end()) {
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT,
                               "Missing parameter: args");
    return;
  }

  if (!args_parameter_iterator->second.isArray()) {
    response->SetErrorResponse(ERROR_INVALID_ARGUMENT,
                               "args parameter must be an array");
    return;
  }

  std::string script_body = script_parameter_iterator->second.asString();
  const std::string script_source = "(function() { return function(){\n" + script_body + "\n};})();";

  Json::Value json_args(args_parameter_iterator->second);

  BrowserHandle browser_wrapper;
  int status_code = executor.GetCurrentBrowser(&browser_wrapper);
  if (status_code != WD_SUCCESS) {
    response->SetErrorResponse(status_code, "Unable to get browser");
    return;
  }

  CComPtr<IHTMLDocument2> doc;
  browser_wrapper->GetDocument(&doc);
  Script script_wrapper(doc, script_source);

  HWND async_executor_handle;
  status_code = script_wrapper.ExecuteAsync(executor,
                                            json_args,
                                            &async_executor_handle);
  browser_wrapper->set_script_executor_handle(async_executor_handle);

  if (status_code != WD_SUCCESS) {
    response->SetErrorResponse(status_code, "JavaScript error");
    return;
  }
}

} // namespace webdriver
