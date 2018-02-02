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

#ifndef WEBDRIVER_IE_SCRIPT_H_
#define WEBDRIVER_IE_SCRIPT_H_

#include <string>
#include <vector>

#include "CustomTypes.h"

// Forward declaration of classes.
namespace Json {
  class Value;
} // namespace Json

namespace webdriver {

// Forward declaration of classes.
class IECommandExecutor;

class Script {
 public:
  Script(IHTMLDocument2* document,
         std::string script_source,
         unsigned long argument_count);
  Script(IHTMLDocument2* document,
         std::wstring script_source,
         unsigned long argument_count);
  Script(IHTMLDocument2* document,
         std::string script_source);
  Script(IHTMLDocument2* document,
         std::wstring script_source);
  ~Script(void);

  std::wstring source_code() const { return this->source_code_; }
  VARIANT result() { return this->result_; }
  void set_result(VARIANT value) {
    this->result_.Copy(&value);
  }

  void AddArgument(const std::string& argument);
  void AddArgument(const std::wstring& argument);
  void AddArgument(const int argument);
  void AddArgument(const double argument);
  void AddArgument(const bool argument);
  void AddArgument(ElementHandle argument);
  void AddArgument(IHTMLElement* argument);
  void AddArgument(VARIANT argument);
  void AddNullArgument(void);

  int AddArguments(HWND element_repository_handle, const Json::Value& arguments);

  bool ResultIsEmpty(void);
  bool ResultIsString(void);
  bool ResultIsInteger(void);
  bool ResultIsBoolean(void);
  bool ResultIsDouble(void);
  bool ResultIsArray(void);
  bool ResultIsObject(void);
  bool ResultIsElement(void);
  bool ResultIsElementCollection(void);
  bool ResultIsIDispatch(void);

  int Execute(void);
  int ExecuteAsync(int timeout_in_milliseconds);
  int BeginAsyncExecution(HWND* aync_executor_handle);
  int ConvertResultToJsonValue(const IECommandExecutor& executor,
                               Json::Value* value);
  int ConvertResultToJsonValue(HWND element_repository_handle,
                               Json::Value* value);
  bool ConvertResultToString(std::string* value);

 private:
  bool CreateAnonymousFunction(VARIANT* result);
  void Initialize(IHTMLDocument2* document,
                  const std::wstring& script_source,
                  const unsigned long argument_count);

  int AddArgument(HWND element_repository_handle, const Json::Value& arg);
  int WalkArray(HWND element_repository_handle, const Json::Value& array_value);
  int WalkObject(HWND element_repository_handle, const Json::Value& object_value);

  CComPtr<IHTMLDocument2> script_engine_host_;
  unsigned long argument_count_;
  std::wstring source_code_;
  long current_arg_index_;

  HWND element_repository_handle_;
  std::vector<CComVariant> argument_array_;
  CComVariant result_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_SCRIPT_H_
