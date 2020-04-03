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

#ifndef WEBDRIVER_IE_SCRIPT_EXCEPTION_H_
#define WEBDRIVER_IE_SCRIPT_EXCEPTION_H_

#include <string>
#include "cominterfaces.h"

namespace webdriver {

class ATL_NO_VTABLE ScriptException : public CComObjectRootEx<CComMultiThreadModel>,
                                      public CComCoClass<ScriptException, &CLSID_ScriptException>,
                                      public IServiceProvider,
                                      public ICanHandleException,
                                      public IScriptException {
 public:
  ScriptException();
  virtual ~ScriptException();

  DECLARE_NO_REGISTRY()
  DECLARE_NOT_AGGREGATABLE(ScriptException)

  BEGIN_COM_MAP(ScriptException)
    COM_INTERFACE_ENTRY(IScriptException)
    COM_INTERFACE_ENTRY(IServiceProvider)
    COM_INTERFACE_ENTRY(ICanHandleException)
  END_COM_MAP()

  // IServiceProvider
  STDMETHOD(QueryService)(REFGUID guid_service,
                          REFIID riid,
                          void** object_pointer);

  // ICanHandleException
  STDMETHOD(CanHandleException)(EXCEPINFO* exception_info_pointer,
                                VARIANT* variant_value);

  // IScriptException
  STDMETHOD(IsExceptionHandled)(bool* is_handled);
  STDMETHOD(GetDescription)(BSTR* description);
  STDMETHOD(GetSource)(BSTR* source);

 private:
  bool is_exception_handled_;
  CComBSTR message_;
  CComBSTR source_;
};

}

#endif // WEBDRIVER_IE_SCRIPT_EXCEPTION_H_
