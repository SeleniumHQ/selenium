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

#ifndef WEBDRIVER_IE_CLICKELEMENTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_CLICKELEMENTCOMMANDHANDLER_H_

// TODO: Revisit this include
#include "../DocumentHost.h"
#include "../IECommandHandler.h"

namespace webdriver {

class IElementManager;

class ClickElementCommandHandler : public IECommandHandler {
 public:
  ClickElementCommandHandler(void);
  virtual ~ClickElementCommandHandler(void);

 protected:
  void ExecuteInternal(const IECommandExecutor& executor,
                       const ParametersMap& command_parameters,
                       Response* response);

 private:
  bool IsFileUploadElement(ElementHandle element_wrapper);
  bool IsOptionElement(ElementHandle element_wrapper);
  bool IsPossibleNavigation(ElementHandle element_wrapper,
                            std::string* url);
  std::wstring GetSyntheticClickAtom();
  std::wstring GetClickAtom();
  int ExecuteAtom(const IECommandExecutor& executor,
                  const std::wstring& atom_script_source,
                  BrowserHandle browser_wrapper,
                  ElementHandle element_wrapper,
                  std::string* error_msg);
};

} // namespace webdriver

#endif // WEBDRIVER_IE_CLICKELEMENTCOMMANDHANDLER_H_
