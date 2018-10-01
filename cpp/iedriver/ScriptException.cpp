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

#include "ScriptException.h"
#include <vector>

namespace webdriver {

ScriptException::ScriptException() {
  this->is_exception_handled_ = false;
  this->message_ = L"";
  this->source_ = L"";
}

ScriptException::~ScriptException() {
}

STDMETHODIMP ScriptException::QueryService(REFGUID guid_service,
                                           REFIID riid,
                                           void** object_pointer) {
  return S_OK;
}

STDMETHODIMP ScriptException::CanHandleException(EXCEPINFO* exception_info_pointer,
                                                 VARIANT* variant_value) {
  this->is_exception_handled_ = true;
  this->message_ = exception_info_pointer->bstrDescription;
  this->source_ = exception_info_pointer->bstrSource;
  return S_OK;
}

STDMETHODIMP ScriptException::IsExceptionHandled(bool* is_handled) {
  *is_handled = this->is_exception_handled_;
  return S_OK;
}

STDMETHODIMP ScriptException::GetDescription(BSTR* description) {
  return this->message_.CopyTo(description);
}

STDMETHODIMP ScriptException::GetSource(BSTR* source) {
  return this->source_.CopyTo(source);
}

} // namespace webdriver
