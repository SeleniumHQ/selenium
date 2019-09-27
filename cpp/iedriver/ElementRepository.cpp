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

#include "ElementRepository.h"

#include "logging.h"
#include "errorcodes.h"

#include "Element.h"

namespace webdriver {

ElementRepository::ElementRepository(void) {
}

ElementRepository::~ElementRepository(void) {
}

int ElementRepository::GetManagedElement(const std::string& element_id,
                                         ElementHandle* element_wrapper) const {
  LOG(TRACE) << "Entering ElementRepository::GetManagedElement";

  ElementMap::const_iterator found_iterator = this->managed_elements_.find(element_id);
  if (found_iterator == this->managed_elements_.end()) {
    LOG(DEBUG) << "Unable to find managed element with id " << element_id;
    return ENOSUCHELEMENT;
  }

  *element_wrapper = found_iterator->second;
  return WD_SUCCESS;
}

bool ElementRepository::AddManagedElement(ElementHandle element_wrapper) {
  this->managed_elements_[element_wrapper->element_id()] = element_wrapper;
  return true;
}

bool ElementRepository::AddManagedElement(BrowserHandle current_browser,
                                          IHTMLElement* element,
                                          ElementHandle* element_wrapper) {
  LOG(TRACE) << "Entering ElementRepository::AddManagedElement";

  bool element_already_managed = this->IsElementManaged(element, element_wrapper);
  if (!element_already_managed) {
    LOG(DEBUG) << "Element is not yet managed";
    HWND containing_window_handle = NULL;
    if (current_browser != NULL) {
      containing_window_handle = current_browser->GetContentWindowHandle();
    }
    ElementHandle new_wrapper(new Element(element,
                                          containing_window_handle));
    this->managed_elements_[new_wrapper->element_id()] = new_wrapper;
    *element_wrapper = new_wrapper;
  } else {
    LOG(DEBUG) << "Element is already managed";
  }
  return !element_already_managed;
}

bool ElementRepository::IsElementManaged(IHTMLElement* element,
                                         ElementHandle* element_wrapper) {
  // TODO: This method needs much work. If we are already managing a
  // given element, we don't want to assign it a new ID, but to find
  // out if we're managing it already, we need to compare to all of 
  // the elements already in our map, which means iterating through
  // the map. For long-running tests, this means the addition of a
  // new managed element may take longer and longer as we have no
  // good algorithm for removing dead elements from the map.
  ElementMap::iterator it = this->managed_elements_.begin();
  for (; it != this->managed_elements_.end(); ++it) {
    if (it->second->element() == element) {
      *element_wrapper = it->second;
      return true;
    }
  }
  return false;
}

void ElementRepository::RemoveManagedElement(const std::string& element_id) {
  LOG(TRACE) << "Entering ElementRepository::RemoveManagedElement";

  ElementMap::iterator found_iterator = this->managed_elements_.find(element_id);
  if (found_iterator != this->managed_elements_.end()) {
    this->managed_elements_.erase(element_id);
  } else {
    LOG(DEBUG) << "Unable to find element to remove with id " << element_id;
  }
}

void ElementRepository::ListManagedElements() {
  LOG(TRACE) << "Entering ElementRepository::ListManagedElements";

  ElementMap::iterator it = this->managed_elements_.begin();
  for (; it != this->managed_elements_.end(); ++it) {
    LOG(DEBUG) << "Managed element: " << it->first;
  }
}

void ElementRepository::ClearCache() {
  // Logic explanation: We can't just remove the elements from the 
  // managed elements map, within the loop as that would invalidate
  // the iterator. So we add the keys to a vector, and use the vector
  // to remove the elements from the map.
  std::vector<std::string> bad_elements;
  ElementMap::const_iterator managed_iterator = this->managed_elements_.begin();
  ElementMap::const_iterator last_managed_element = this->managed_elements_.end();
  for(; managed_iterator != last_managed_element; ++managed_iterator) {
    if (!managed_iterator->second->IsAttachedToDom()) {
      bad_elements.push_back(managed_iterator->first);
    }
  }

  LOG(DEBUG) << "Refreshing managed element cache. Found "
              << bad_elements.size()
              << " to remove from cache.";
  
  std::vector<std::string>::const_iterator id_iterator = bad_elements.begin();
  std::vector<std::string>::const_iterator last_id = bad_elements.end();
  for (; id_iterator != last_id; ++id_iterator) {
    this->RemoveManagedElement(*id_iterator);
  }
}

void ElementRepository::Clear() {
  this->managed_elements_.clear();
}

} // namespace webdriver
