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

#ifndef WEBDRIVER_IE_ELEMENT_H_
#define WEBDRIVER_IE_ELEMENT_H_

#include <string>
#include "json.h"

namespace webdriver {

enum ELEMENT_SCROLL_BEHAVIOR {
  TOP,
  BOTTOM
};

// Forward declaration of classes to avoid
// circular include files.
class Browser;

class Element {
 public:
  Element(IHTMLElement* element, HWND containing_window_handle);
  virtual ~Element(void);
  Json::Value ConvertToJson(void);
  std::string GetTagName(void);
  int GetLocationOnceScrolledIntoView(const ELEMENT_SCROLL_BEHAVIOR scroll,
                                      long* x,
                                      long* y,
                                      long* width,
                                      long* height);
  int GetAttributeValue(const std::string& attribute_name,
                        std::string* attribute_value,
                        bool* value_is_null);
  int IsDisplayed(bool* result);
  bool IsEnabled(void);
  bool IsSelected(void);
  int Click(const ELEMENT_SCROLL_BEHAVIOR scroll_behavior);

  std::string element_id(void) const { return this->element_id_; }
  IHTMLElement* element(void) { return this->element_; }

 private:
  int GetLocation(long* x, long* y, long* width, long* height);
  void GetClickPoint(const long x, const long y, const long width, const long height, long* click_x, long* click_y);
  bool IsClickPointInViewPort(const long x,
                              const long y,
                              const long width,
                              const long height);
  bool IsHiddenByOverflow();
  int GetFrameOffset(long* x, long* y);
  int GetContainingDocument(const bool use_dom_node, IHTMLDocument2** doc);
  int GetParentDocument(IHTMLWindow2* parent_window,
                        IHTMLDocument2** parent_doc);
  bool IsInline(void);
  static bool Element::RectHasNonZeroDimensions(const CComPtr<IHTMLRect> rect);

  std::string element_id_;
  CComPtr<IHTMLElement> element_;
  HWND containing_window_handle_;
};

typedef std::tr1::shared_ptr<Element> ElementHandle;

} // namespace webdriver

#endif // WEBDRIVER_IE_ELEMENT_H_
