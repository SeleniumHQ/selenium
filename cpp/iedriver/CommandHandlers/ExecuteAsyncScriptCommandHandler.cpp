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

#include "ExecuteAsyncScriptCommandHandler.h"
#include "errorcodes.h"
#include "../Browser.h"
#include "../IECommandExecutor.h"
#include "../Script.h"
#include "../StringUtilities.h"

#define GUID_STRING_LEN 40

namespace webdriver {

ExecuteAsyncScriptCommandHandler::ExecuteAsyncScriptCommandHandler(void) {
}

ExecuteAsyncScriptCommandHandler::~ExecuteAsyncScriptCommandHandler(void) {
}

void ExecuteAsyncScriptCommandHandler::ExecuteInternal(
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

  std::vector<wchar_t> page_id_buffer(GUID_STRING_LEN);
  GUID page_id_guid;
  ::CoCreateGuid(&page_id_guid);
  ::StringFromGUID2(page_id_guid, &page_id_buffer[0], GUID_STRING_LEN);
  std::wstring page_id = &page_id_buffer[0];

  std::vector<wchar_t> pending_id_buffer(GUID_STRING_LEN);
  GUID pending_id_guid;
  ::CoCreateGuid(&pending_id_guid);
  ::StringFromGUID2(pending_id_guid, &pending_id_buffer[0], GUID_STRING_LEN);
  std::wstring pending_id = &pending_id_buffer[0];

  Json::Value json_args = args_parameter_iterator->second;

  unsigned long long timeout_value = executor.async_script_timeout();
  std::wstring timeout = std::to_wstring(static_cast<long long>(timeout_value));

  std::wstring script_body = StringUtilities::ToWString(script_parameter_iterator->second.asString());

  std::wstring async_script = L"(function() { return function(){\n";
  async_script += L"document.__$webdriverAsyncExecutor = {\n";
  async_script += L"  pageId: '" + page_id + L"',\n";
  async_script += L"  asyncTimeout: 0\n";
  async_script += L"};\n";
  async_script += L"var timeoutId = window.setTimeout(function() {\n";
  async_script += L"  window.setTimeout(function() {\n";
  async_script += L"    document.__$webdriverAsyncExecutor.asyncTimeout = 1;\n";
  async_script += L"  }, 0);\n";
  async_script += L"}," + timeout + L");\n";
  async_script += L"var callback = function(value) {\n";
  async_script += L"  document.__$webdriverAsyncExecutor.asyncTimeout = 0;\n";
  async_script += L"  document.__$webdriverAsyncExecutor.asyncScriptResult = value;\n";
  async_script += L"  window.clearTimeout(timeoutId);\n";
  async_script += L"};\n";
  async_script += L"var argsArray = Array.prototype.slice.call(arguments);\n";
  async_script += L"argsArray.push(callback);\n";
  async_script += L"if (document.__$webdriverAsyncExecutor.asyncScriptResult !== undefined) {\n";
  async_script += L"  delete document.__$webdriverAsyncExecutor.asyncScriptResult;\n";
  async_script += L"}\n";
  async_script += L"(function() {\n" + script_body + L"\n}).apply(null, argsArray);\n";
  async_script += L"};})();";

  std::wstring polling_script = L"(function() { return function(){\n";
  polling_script += L"var pendingId = '" + pending_id + L"';\n";
  polling_script += L"if ('__$webdriverAsyncExecutor' in document) {\n";
  polling_script += L"  if (document.__$webdriverAsyncExecutor.pageId != '" + page_id + L"') {\n";
  polling_script += L"    return {'status': 'reload', 'id': pendingId, 'value': -1};\n";
  polling_script += L"  } else if ('asyncScriptResult' in document.__$webdriverAsyncExecutor) {\n";
  polling_script += L"    var value = document.__$webdriverAsyncExecutor.asyncScriptResult;\n";
  polling_script += L"    delete document.__$webdriverAsyncExecutor.asyncScriptResult;\n";
  polling_script += L"    return {'status': 'complete', 'id': pendingId, 'value': value};\n";
  polling_script += L"  } else if (document.__$webdriverAsyncExecutor.asyncTimeout == 0) {\n";
  polling_script += L"    return {'status': 'pending', 'id': pendingId, 'value': document.__$webdriverAsyncExecutor.asyncTimeout};\n";
  polling_script += L"  } else {\n";
  polling_script += L"    return {'status': 'timeout', 'id': pendingId, 'value': document.__$webdriverAsyncExecutor.asyncTimeout};\n";
  polling_script += L"  }\n";
  polling_script += L"} else {\n";
  polling_script += L"  return {'status': 'reload', 'id': pendingId, 'value': -1};\n";
  polling_script += L"}\n";
  polling_script += L"};})();";

  BrowserHandle browser_wrapper;
  int status_code = executor.GetCurrentBrowser(&browser_wrapper);
  if (status_code != WD_SUCCESS) {
    response->SetErrorResponse(status_code, "Unable to get browser");
    return;
  }

  CComPtr<IHTMLDocument2> doc;
  browser_wrapper->GetDocument(&doc);

  HWND async_executor_handle;
  Script async_script_wrapper(doc, async_script);
  async_script_wrapper.set_polling_source_code(polling_script);
  status_code = async_script_wrapper.ExecuteAsync(executor,
                                                  json_args,
                                                  &async_executor_handle);
  browser_wrapper->set_script_executor_handle(async_executor_handle);

  if (status_code != WD_SUCCESS) {
    response->SetErrorResponse(status_code, "JavaScript error");
  }
}

} // namespace webdriver
