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

#ifndef WEBDRIVER_IE_ELEMENT_H_
#define WEBDRIVER_IE_ELEMENT_H_

#include <memory>
#include <string>
#include <vector>

#include "ElementScrollBehavior.h"
#include "LocationInfo.h"

#define JSON_ELEMENT_PROPERTY_NAME "element-6066-11e4-a52e-4f735466cecf"

// Forward declaration of classes.
namespace Json {
  class Value;
} // namespace Json

namespace webdriver {

// Forward declaration of classes.
class Browser;

class Element {
 public:
  Element(IHTMLElement* element, HWND containing_window_handle);
  Element(IHTMLElement* element,
          HWND containing_window_handle,
          const std::string& element_id);
  virtual ~Element(void);
  Json::Value ConvertToJson(void);
  std::string GetTagName(void);
  int GetLocationOnceScrolledIntoView(const ElementScrollBehavior scroll,
                                      LocationInfo* location,
                                      std::vector<LocationInfo>* frame_locations);
  int GetStaticClickLocation(LocationInfo* click_location);
  int GetClickLocation(const ElementScrollBehavior scroll_behavior,
                       LocationInfo* element_location,
                       LocationInfo* click_location);
  int GetAttributeValue(const std::string& attribute_name,
                        VARIANT* attribute_value);
  int GetPropertyValue(const std::string& property_name,
                       VARIANT* property_value);
  int GetCssPropertyValue(const std::string& property_name,
                          std::string* property_value);

  int IsDisplayed(bool ignore_opacity, bool* result);
  bool IsEnabled(void);
  bool IsXmlDocument(IHTMLDocument2* doc);
  bool IsSelected(void);
  bool IsInteractable(void);
  bool IsEditable(void);
  bool IsFocusable(void);
  bool IsAttachedToDom(void);
  bool IsDocumentFocused(IHTMLDocument2* focused_doc);
  bool IsObscured(LocationInfo* click_location,
                  long* obscuring_element_index,
                  std::string* obscuring_element_description);


  std::string element_id(void) const { return this->element_id_; }
  IHTMLElement* element(void) { return this->element_; }

 private:
  int GetLocation(LocationInfo* location,
                  std::vector<LocationInfo>* frame_locations);
  LocationInfo CalculateClickPoint(const LocationInfo location,
                                   const bool document_contains_frames);
  bool GetClickableViewPortLocation(const bool document_contains_frames,
                                    LocationInfo* location);
  bool IsLocationInViewPort(const LocationInfo location,
                            const bool document_contains_frames);
  bool IsLocationVisibleInFrames(const LocationInfo location,
                                 const std::vector<LocationInfo> frame_locations);
  bool IsHiddenByOverflow(const LocationInfo element_location,
                          const LocationInfo click_location);
  bool AppendFrameDetails(std::vector<LocationInfo>* frame_locations);
  int GetContainingDocument(const bool use_dom_node, IHTMLDocument2** doc);
  int GetDocumentFromWindow(IHTMLWindow2* parent_window,
                            IHTMLDocument2** parent_doc);

  std::string GetElementHtmlDescription(IHTMLElement* element);
  bool HasShadowRoot(void);

  bool IsInline(void);
  static bool RectHasNonZeroDimensions(IHTMLRect* rect);

  bool HasFirstChildTextNodeOfMultipleChildren(void);
  bool GetTextBoundaries(LocationInfo* text_info);

  bool GetComputedStyle(IHTMLCSSStyleDeclaration** computed_style);

  std::string element_id_;
  CComPtr<IHTMLElement> element_;
  HWND containing_window_handle_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_ELEMENT_H_
