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

#ifndef WEBDRIVER_IE_ELEMENTFINDER_H_
#define WEBDRIVER_IE_ELEMENTFINDER_H_

#include <string>
#include <vector>

#include "CustomTypes.h"

namespace Json {
  class Value;
}

namespace webdriver {

// Forward declaration of classes.
class IECommandExecutor;

class ElementFinder {
 public:
  ElementFinder();
  virtual ~ElementFinder(void);
  virtual int FindElement(const IECommandExecutor& executor,
                          ElementHandle parent_wrapper,
                          const std::wstring& mechanism,
                          const std::wstring& criteria,
                          Json::Value* found_element);
  virtual int FindElements(const IECommandExecutor& executor,
                           ElementHandle parent_wrapper,
                           const std::wstring& mechanism,
                           const std::wstring& criteria,
                           Json::Value* found_elements);

 private:
  int FindElementUsingSizzle(const IECommandExecutor& executor,
                             const ElementHandle parent_wrapper,
                             const std::wstring& criteria,
                             Json::Value* found_element);
  int FindElementsUsingSizzle(const IECommandExecutor& executor,
                              const ElementHandle parent_wrapper,
                              const std::wstring& criteria,
                              Json::Value* found_elements);
  bool HasNativeCssSelectorEngine(const IECommandExecutor& executor);
};

} // namespace webdriver

#endif // WEBDRIVER_IE_ELEMENTFINDER_H_
