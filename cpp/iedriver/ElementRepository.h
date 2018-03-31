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

#ifndef WEBDRIVER_IE_ELEMENTREPOSITORY_H_
#define WEBDRIVER_IE_ELEMENTREPOSITORY_H_

#include <unordered_map>

#include "CustomTypes.h"
#include "DocumentHost.h"

namespace webdriver {

class ElementRepository {
 public:
  ElementRepository(void);
  virtual ~ElementRepository(void);
  int GetManagedElement(const std::string& element_id,
                        ElementHandle* element_wrapper) const;
  bool AddManagedElement(BrowserHandle current_browser,
                         IHTMLElement* element,
                         ElementHandle* element_wrapper);
  bool AddManagedElement(ElementHandle element_wrapper);
  void RemoveManagedElement(const std::string& element_id);
  void ListManagedElements(void);
  void ClearCache(void);
  void Clear(void);
 private:
  bool IsElementManaged(IHTMLElement* element, ElementHandle* element_wrapper);
  typedef std::unordered_map<std::string, ElementHandle> ElementMap;
  ElementMap managed_elements_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_ELEMENTREPOSITORY_H_
