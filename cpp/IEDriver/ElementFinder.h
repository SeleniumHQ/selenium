// Copyright 2011 Software Freedom Conservancy
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

#ifndef WEBDRIVER_IE_ELEMENTFINDER_H_
#define WEBDRIVER_IE_ELEMENTFINDER_H_

#include <string>
#include <vector>

using namespace std;

namespace webdriver {

// Forward declaration of classes to avoid
// circular include files.
class IESessionWindow;

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
  int FindElementByCssSelector(const IECommandExecutor& executor,
                               const ElementHandle parent_wrapper,
                               const std::wstring& criteria,
                               Json::Value* found_element);
  int FindElementsByCssSelector(const IECommandExecutor& executor,
                                const ElementHandle parent_wrapper,
                                const std::wstring& criteria,
                                Json::Value* found_elements);
  void SanitizeCriteria(const std::wstring& mechanism, std::wstring* criteria);
  void ReplaceAllSubstrings(const std::wstring& to_replace,
                            const std::wstring& replace_with,
                            std::wstring* str);
};

} // namespace webdriver

#endif // WEBDRIVER_IE_ELEMENTFINDER_H_
