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

// Ignoring code analysis warnings for:
// "'argument n' might be '0': this does not adhere to the specification for 
// the function 'IHTMLDocument4::createEventObject'", and "'argument n' might
// be null: this does not adhere to the specification for the function
// 'IHTMLDocument4::createEventObject'", and. 
// IHTMLDocument4::createEventObject() should have its first argument set to 
// NULL to create an empty event object, per documentation at:
// http://msdn.microsoft.com/en-us/library/aa752524(v=vs.85).aspx
#pragma warning (disable: 6309)
#pragma warning (disable: 6387)

#include "Element.h"

#include <algorithm>

#include "errorcodes.h"
#include "logging.h"
#include "json.h"

#include "Browser.h"
#include "Generated/atoms.h"
#include "Script.h"
#include "StringUtilities.h"
#include "VariantUtilities.h"
#include "WebDriverConstants.h"

namespace webdriver {

Element::Element(IHTMLElement* element, HWND containing_window_handle) {
  LOG(TRACE) << "Entering Element::Element";

  // NOTE: COM should be initialized on this thread, so we
  // could use CoCreateGuid() and StringFromGUID2() instead.
  UUID guid;
  RPC_WSTR guid_string = NULL;
  RPC_STATUS status = ::UuidCreate(&guid);
  if (status != RPC_S_OK) {
    // If we encounter an error, not bloody much we can do about it.
    // Just log it and continue.
    LOG(WARN) << "UuidCreate returned a status other then RPC_S_OK: " << status;
  }
  status = ::UuidToString(&guid, &guid_string);
  if (status != RPC_S_OK) {
    // If we encounter an error, not bloody much we can do about it.
    // Just log it and continue.
    LOG(WARN) << "UuidToString returned a status other then RPC_S_OK: " << status;
  }

  // RPC_WSTR is currently typedef'd in RpcDce.h (pulled in by rpc.h)
  // as unsigned short*. It needs to be typedef'd as wchar_t* 
  wchar_t* cast_guid_string = reinterpret_cast<wchar_t*>(guid_string);
  this->element_id_ = StringUtilities::ToString(cast_guid_string);

  ::RpcStringFree(&guid_string);

  this->element_ = element;
  this->containing_window_handle_ = containing_window_handle;
}

Element::Element(IHTMLElement* element, HWND containing_window_handle, const std::string& element_id) {
  this->element_ = element;
  this->element_id_ = element_id;
  this->containing_window_handle_ = containing_window_handle;
}

Element::~Element(void) {
}

Json::Value Element::ConvertToJson() {
  LOG(TRACE) << "Entering Element::ConvertToJson";

  Json::Value json_wrapper;
  json_wrapper[JSON_ELEMENT_PROPERTY_NAME] = this->element_id_;

  return json_wrapper;
}

int Element::IsDisplayed(bool ignore_opacity, bool* result) {
  LOG(TRACE) << "Entering Element::IsDisplayed";

  int status_code = WD_SUCCESS;

  // The atom is just the definition of an anonymous
  // function: "function() {...}"; Wrap it in another function so we can
  // invoke it with our arguments without polluting the current namespace.
  std::wstring script_source(L"(function() { return (");
  script_source += atoms::asString(atoms::IS_DISPLAYED);
  script_source += L")})();";

  CComPtr<IHTMLDocument2> doc;
  this->GetContainingDocument(false, &doc);
  // N.B., The second argument to the IsDisplayed atom is "ignoreOpacity".
  Script script_wrapper(doc, script_source, 2);
  script_wrapper.AddArgument(this->element_);
  script_wrapper.AddArgument(ignore_opacity);
  status_code = script_wrapper.Execute();

  if (status_code == WD_SUCCESS) {
    *result = script_wrapper.result().boolVal == VARIANT_TRUE;
  } else {
    LOG(WARN) << "Failed to determine is element displayed";
  }

  return status_code;
}

std::string Element::GetTagName() {
  LOG(TRACE) << "Entering Element::GetTagName";

  CComBSTR tag_name_bstr;
  HRESULT hr = this->element_->get_tagName(&tag_name_bstr);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Failed calling IHTMLElement::get_tagName";
    return "";
  }
  std::wstring converted_tag_name = tag_name_bstr;
  std::string tag_name = StringUtilities::ToString(converted_tag_name);
  std::transform(tag_name.begin(), tag_name.end(), tag_name.begin(), ::tolower);
  return tag_name;
}

bool Element::IsEnabled() {
  LOG(TRACE) << "Entering Element::IsEnabled";

  bool result = false;

  // The atom is just the definition of an anonymous
  // function: "function() {...}"; Wrap it in another function so we can
  // invoke it with our arguments without polluting the current namespace.
  std::wstring script_source(L"(function() { return (");
  script_source += atoms::asString(atoms::IS_ENABLED);
  script_source += L")})();";

  CComPtr<IHTMLDocument2> doc;
  this->GetContainingDocument(false, &doc);

  if (this->IsXmlDocument(doc)) {
    return false;
  }

  Script script_wrapper(doc, script_source, 1);
  script_wrapper.AddArgument(this->element_);
  int status_code = script_wrapper.Execute();

  if (status_code == WD_SUCCESS) {
    result = script_wrapper.result().boolVal == VARIANT_TRUE;
  } else {
    LOG(WARN) << "Failed to determine is element enabled";
  }

  return result;
}

bool Element::IsXmlDocument(IHTMLDocument2* doc) {
  LOG(TRACE) << "Entering Element::IsXmlDocument";
  // If the document has an xmlVersion property, it can be either an XML
  // document or an XHTML document. Otherwise, it's an HTML document.
  CComPtr<IHTMLDocument7> xml_version_document;
  HRESULT hr = doc->QueryInterface<IHTMLDocument7>(&xml_version_document);
  if (SUCCEEDED(hr) && xml_version_document) {
    CComBSTR xml_version = "";
    hr = xml_version_document->get_xmlVersion(&xml_version);
    if (SUCCEEDED(hr) && xml_version && xml_version != L"") {
      // The document is either XML or XHTML, so to differentiate between
      // the two cases, check for a doctype of "html". If we can't find
      // a doctype property, or the doctype is anything other than "html",
      // the document is an XML document.
      CComPtr<IHTMLDocument5> doc_type_document;
      hr = doc->QueryInterface<IHTMLDocument5>(&doc_type_document);
      if (SUCCEEDED(hr) && doc_type_document) {
        CComPtr<IHTMLDOMNode> doc_type_dom_node;
        hr = doc_type_document->get_doctype(&doc_type_dom_node);
        if (SUCCEEDED(hr) && doc_type_dom_node) {
          CComPtr<IDOMDocumentType> doc_type;
          hr = doc_type_dom_node->QueryInterface<IDOMDocumentType>(&doc_type);
          if (SUCCEEDED(hr) && doc_type) {
            CComBSTR type_name_bstr = L"";
            hr = doc_type->get_name(&type_name_bstr);
            type_name_bstr.ToLower();
            std::wstring type_name(type_name_bstr);
            LOG(INFO) << LOGWSTRING(type_name);
            if (SUCCEEDED(hr) && type_name != L"html") {
              return true;
            }
          }
        } else {
          return true;
        }
      }
    }
  }
  return false;
}

bool Element::IsInteractable() {
  LOG(TRACE) << "Entering Element::IsInteractable";

  bool result = false;

  // The atom is just the definition of an anonymous
  // function: "function() {...}"; Wrap it in another function so we can
  // invoke it with our arguments without polluting the current namespace.
  std::wstring script_source(L"(function() { return (");
  script_source += atoms::asString(atoms::IS_INTERACTABLE);
  script_source += L")})();";

  CComPtr<IHTMLDocument2> doc;
  this->GetContainingDocument(false, &doc);
  Script script_wrapper(doc, script_source, 1);
  script_wrapper.AddArgument(this->element_);
  int status_code = script_wrapper.Execute();

  if (status_code == WD_SUCCESS) {
    result = script_wrapper.result().boolVal == VARIANT_TRUE;
  } else {
    LOG(WARN) << "Failed to determine is element enabled";
  }

  return result;
}

bool Element::IsFocusable() {
  LOG(TRACE) << "Entering Element::IsFocusable";

  CComPtr<IHTMLBodyElement> body;
  HRESULT hr = this->element_->QueryInterface<IHTMLBodyElement>(&body);
  if (SUCCEEDED(hr) && body) {
    // The <body> element is explicitly focusable.
    return true;
  }

  CComPtr<IHTMLDocument2> doc;
  this->GetContainingDocument(false, &doc);

  CComPtr<IHTMLDocument3> document_element_doc;
  hr = doc->QueryInterface<IHTMLDocument3>(&document_element_doc);
  if (SUCCEEDED(hr) && document_element_doc) {
    CComPtr<IHTMLElement> doc_element;
    hr = document_element_doc->get_documentElement(&doc_element);
    if (SUCCEEDED(hr) && doc_element && this->element_.IsEqualObject(doc_element)) {
      // The document's documentElement is explicitly focusable.
      return true;
    }
  }
  return false;
}

bool Element::IsObscured(LocationInfo* click_location,
                         long* obscuring_element_index,
                         std::string* obscuring_element_description) {
  CComPtr<ISVGElement> svg_element;
  HRESULT hr = this->element_->QueryInterface<ISVGElement>(&svg_element);
  if (SUCCEEDED(hr) && svg_element != NULL) {
    // SVG elements can have complex paths making them non-hierarchical
    // when drawn. We'll just assume the user knows what they're doing
    // and bail on this test here.
    return false;
  }

  // If an element has a style value where pointer-events is set to 'none',
  // the element is "obscured" by definition, since any mouse interaction
  // will not be handled by the element.
  CComPtr<IHTMLCSSStyleDeclaration> computed_style;
  if (this->GetComputedStyle(&computed_style)) {
    CComBSTR pointer_events_value = L"";
    hr = computed_style->get_pointerEvents(&pointer_events_value);
    if (SUCCEEDED(hr) && pointer_events_value == L"none") {
      return true;
    }
  }

  // The element being obscured only makes sense within the context
  // of its own document, even if it's not in the top-level document.
  LocationInfo element_location = {};
  int status_code = this->GetLocation(&element_location, nullptr);
  *click_location = this->CalculateClickPoint(element_location, false);
  long x = click_location->x;
  long y = click_location->y;

  bool is_inline = this->IsInline();

  CComPtr<IHTMLDocument2> doc;
  this->GetContainingDocument(false, &doc);
  CComPtr<IHTMLElement> element_hit;
  hr = doc->elementFromPoint(x, y, &element_hit);
  if (SUCCEEDED(hr) && element_hit) {
    if (element_.IsEqualObject(element_hit)) {
      // Short circuit the use of elementsFromPoint if we don't
      // have to use it.
      return false;
    } else {
      // Short circuit in the case where this element is specifically
      // an "inline" element (<label>, <span>, <a>, at present),
      // and the top-most element as determined by elementFromPoint is
      // a direct child of this element. This is to work around IE's bug
      // in elementsFromPoint that does not return inline elements in the
      // list of elements hit.
      // N.B., this is a hack of the highest order, and there's every
      // likelihood that some page somewhere will fail this check.
      if (is_inline) {
        CComPtr<IHTMLElement> element_hit_parent;
        hr = element_hit->get_parentElement(&element_hit_parent);
        CComBSTR element_hit_parent_tag;
        element_hit_parent->get_tagName(&element_hit_parent_tag);
        if (SUCCEEDED(hr) && element_hit_parent) {
          if (this->element_.IsEqualObject(element_hit_parent)) {
            return false;
          }
        }
      }
    }
  }

  bool has_shadow_root = this->HasShadowRoot();
  CComPtr<IHTMLElement> shadow_root_parent;
  if (has_shadow_root) {
    // TODO: Walk up the DOM tree until we receive an ancestor that
    // does not have a shadow root.
    hr = this->element()->get_parentElement(&shadow_root_parent);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Element has shadow root, but cannot get parent";
    }
  }

  CComPtr<IHTMLDocument8> elements_doc;
  hr = doc.QueryInterface<IHTMLDocument8>(&elements_doc);
  if (FAILED(hr)) {
    // If we failed to QI for IHTMLDocument8, we can't easily determine if
    // the element is obscured or not. We will assume we are not obscured
    // and bail, even though that may not be the case.
    LOGHR(WARN, hr) << "QueryInterface for IHTMLDocument8 failed";
    return false;
  }

  bool is_obscured = false;
  CComPtr<IHTMLDOMChildrenCollection> elements_hit;
  hr = elements_doc->elementsFromPoint(static_cast<float>(x),
                                       static_cast<float>(y),
                                       &elements_hit);
  if (SUCCEEDED(hr) && elements_hit != NULL) {
    std::vector<std::string> element_descriptions;
    long element_count;
    elements_hit->get_length(&element_count);
    for (long index = 0; index < element_count; ++index) {
      CComPtr<IDispatch> dispatch_in_list;
      elements_hit->item(index, &dispatch_in_list);

      CComPtr<IHTMLElement> element_in_list;
      hr = dispatch_in_list->QueryInterface<IHTMLElement>(&element_in_list);
      bool are_equal = element_in_list.IsEqualObject(this->element_);
      if (are_equal) {
        break;
      }

      bool is_list_element_displayed;
      Element list_element_wrapper(element_in_list,
                                   this->containing_window_handle_);
      status_code = list_element_wrapper.IsDisplayed(false,
                                                     &is_list_element_displayed);
      if (is_list_element_displayed) {
        if (has_shadow_root && shadow_root_parent) {
          // Shadow DOM is problematic. Shadow DOM is only available in IE as a
          // polyfill. If the element is part of a Shadow DOM (using a polyfill),
          // elementsFromPoint will show the component elements, not necessarily
          // the Web Component root element itself. If the direct parent of the
          // Web Component host element is in this list, then it counts as a
          // direct descendent, and won't be obscured.
          bool is_shadow_root_parent = element_in_list.IsEqualObject(shadow_root_parent);
          if (is_shadow_root_parent) {
            break;
          }
        }

        VARIANT_BOOL is_child;
        hr = this->element_->contains(element_in_list, &is_child);
        VARIANT_BOOL is_ancestor;
        hr = element_in_list->contains(this->element_, &is_ancestor);
        bool found_element_not_in_tree = is_child != VARIANT_TRUE &&
                                         is_ancestor != VARIANT_TRUE;
        if (found_element_not_in_tree) {
          CComPtr<IHTMLFrameBase> frame_element;
          hr = element_in_list->QueryInterface<IHTMLFrameBase>(&frame_element);
          if (SUCCEEDED(hr) && frame_element) {
            // Candidate element is a <frame> or <iframe>, meaning it must
            // be a different document tree, which implies that it cannot
            // be obscuring the element we are attempting to click on.
            continue;
          }

          CComPtr<IHTMLCSSStyleDeclaration> list_element_computed_style;
          if (list_element_wrapper.GetComputedStyle(&list_element_computed_style)) {
            CComBSTR list_element_pointer_events_value = L"";
            hr = list_element_computed_style->get_pointerEvents(&list_element_pointer_events_value);
            if (SUCCEEDED(hr) && list_element_pointer_events_value != L"none") {
              // If the element has a pointer-events value set to 'none', it
              // may be technically obscuring this element, but manipulating
              // it with the pointer device has no effect, so it is effectively
              // not obscuring this element.
              is_obscured = true;
            }
          } else {
            // We were unable to retrieve the computed style, so we must assume
            // the other element is obscuring this one.
            is_obscured = true;
          }
        } else {
          // Repeating the immediate-child-of-inline-element hack from above for
          // elements found in the list.
          if (is_inline) {
            CComPtr<IHTMLElement> list_element_parent;
            hr = element_in_list->get_parentElement(&list_element_parent);
            if (SUCCEEDED(hr) && list_element_parent) {
              if (this->element_.IsEqualObject(list_element_parent)) {
                break;
              }
            }
          }
        }
        if (is_obscured) {
          // Return the top-most element in the event we find an obscuring
          // element in the tree between this element and the top-most one.
          // Note that since it's the top-most element, it will have no
          // descendants, so its outerHTML property will contain only itself.
          std::string outer_html = this->GetElementHtmlDescription(element_in_list);
          *obscuring_element_index = index;
          *obscuring_element_description = outer_html;
          break;
        }
      }
    }
  }

  return is_obscured;
}

std::string Element::GetElementHtmlDescription(IHTMLElement* element) {
  CComBSTR outer_html_bstr;
  HRESULT hr = element->get_outerHTML(&outer_html_bstr);
  std::wstring outer_html = outer_html_bstr;
  size_t bracket_pos = outer_html.find(L'>');
  if (bracket_pos != std::wstring::npos) {
    outer_html = outer_html.substr(0, bracket_pos + 1);
  }
  return StringUtilities::ToString(outer_html);
}

bool Element::HasShadowRoot() {
  std::wstring script_source(ANONYMOUS_FUNCTION_START);
  script_source += L"return (function() { if (arguments[0].shadowRoot && arguments[0].shadowRoot !== null) { return true; } return false; })";
  script_source += ANONYMOUS_FUNCTION_END;

  CComPtr<IHTMLDocument2> doc;
  this->GetContainingDocument(false, &doc);
  Script script_wrapper(doc, script_source, 1);
  script_wrapper.AddArgument(this->element_);
  int status_code = script_wrapper.Execute();
  if (status_code == WD_SUCCESS) {
    if (script_wrapper.ResultIsBoolean()) {
      return script_wrapper.result().boolVal == VARIANT_TRUE;
    }
  }
  return false;
}

bool Element::GetComputedStyle(IHTMLCSSStyleDeclaration** computed_style) {
  HRESULT hr = S_OK;
  CComPtr<IHTMLDocument2> doc;
  int status_code = this->GetContainingDocument(false, &doc);
  if (status_code == WD_SUCCESS) {
    CComPtr<IHTMLWindow2> window;
    hr = doc->get_parentWindow(&window);
    if (SUCCEEDED(hr) && window) {
      CComPtr<IHTMLWindow7> style_window;
      hr = window->QueryInterface<IHTMLWindow7>(&style_window);
      if (SUCCEEDED(hr) && style_window) {
        CComPtr<IHTMLDOMNode> node;
        hr = this->element_->QueryInterface<IHTMLDOMNode>(&node);
        if (SUCCEEDED(hr) && node) {
          hr = style_window->getComputedStyle(node, NULL, computed_style);
          if (SUCCEEDED(hr) && computed_style) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

bool Element::IsEditable() {
  LOG(TRACE) << "Entering Element::IsEditable";

  bool result = false;

  // The atom is just the definition of an anonymous
  // function: "function() {...}"; Wrap it in another function so we can
  // invoke it with our arguments without polluting the current namespace.
  std::wstring script_source(L"(function() { return (");
  script_source += atoms::asString(atoms::IS_EDITABLE);
  script_source += L")})();";

  CComPtr<IHTMLDocument2> doc;
  this->GetContainingDocument(false, &doc);
  Script script_wrapper(doc, script_source, 1);
  script_wrapper.AddArgument(this->element_);
  int status_code = script_wrapper.Execute();

  if (status_code == WD_SUCCESS) {
    result = script_wrapper.result().boolVal == VARIANT_TRUE;
  } else {
    LOG(WARN) << "Failed to determine is element enabled";
  }

  return result;
}

int Element::GetClickLocation(const ElementScrollBehavior scroll_behavior,
                              LocationInfo* element_location,
                              LocationInfo* click_location) {
  LOG(TRACE) << "Entering Element::GetClickLocation";

  bool displayed;
  int status_code = this->IsDisplayed(true, &displayed);
  if (status_code != WD_SUCCESS) {
    LOG(WARN) << "Unable to determine element is displayed";
    return status_code;
  } 

  if (!displayed) {
    LOG(WARN) << "Element is not displayed";
    return EELEMENTNOTDISPLAYED;
  }

  std::vector<LocationInfo> frame_locations;
  status_code = this->GetLocationOnceScrolledIntoView(scroll_behavior,
                                                      element_location,
                                                      &frame_locations);

  if (status_code == WD_SUCCESS) {
    bool document_contains_frames = frame_locations.size() != 0;
    *click_location = CalculateClickPoint(*element_location,
                                          document_contains_frames);
  }
  return status_code;
}

int Element::GetStaticClickLocation(LocationInfo* click_location) {
  std::vector<LocationInfo> frame_locations;
  LocationInfo element_location = {};
  int result = this->GetLocation(&element_location, &frame_locations);
  bool document_contains_frames = frame_locations.size() != 0;
  *click_location = this->CalculateClickPoint(element_location, document_contains_frames);
  return result;
}

int Element::GetAttributeValue(const std::string& attribute_name,
                               VARIANT* attribute_value) {
  LOG(TRACE) << "Entering Element::GetAttributeValue";

  std::wstring wide_attribute_name = StringUtilities::ToWString(attribute_name);
  int status_code = WD_SUCCESS;

  // The atom is just the definition of an anonymous
  // function: "function() {...}"; Wrap it in another function so we can
  // invoke it with our arguments without polluting the current namespace.
  std::wstring script_source(L"(function() { return (");
  script_source += atoms::asString(atoms::GET_ATTRIBUTE);
  script_source += L")})();";

  CComPtr<IHTMLDocument2> doc;
  this->GetContainingDocument(false, &doc);
  Script script_wrapper(doc, script_source, 2);
  script_wrapper.AddArgument(this->element_);
  script_wrapper.AddArgument(wide_attribute_name);
  status_code = script_wrapper.Execute();
  
  if (status_code == WD_SUCCESS) {
    ::VariantCopy(attribute_value, &script_wrapper.result());
  } else {
    LOG(WARN) << "Failed to determine element attribute";
  }

  return WD_SUCCESS;
}

int Element::GetPropertyValue(const std::string& property_name,
                              VARIANT* property_value) {
  LOG(TRACE) << "Entering Element::GetPropertyValue";

  std::wstring wide_property_name = StringUtilities::ToWString(property_name);
  int status_code = WD_SUCCESS;

  LPOLESTR property_name_pointer = reinterpret_cast<LPOLESTR>(const_cast<wchar_t*>(wide_property_name.data()));
  DISPID dispid_property;
  HRESULT hr = this->element_->GetIDsOfNames(IID_NULL,
                                             &property_name_pointer,
                                             1,
                                             LOCALE_USER_DEFAULT,
                                             &dispid_property);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to get dispatch ID (dispid) for property "
                    << property_name;
    property_value->vt = VT_EMPTY;
    return WD_SUCCESS;
  }

  // get the value of eval result
  DISPPARAMS no_args_dispatch_parameters = { 0 };
  hr = this->element_->Invoke(dispid_property,
                              IID_NULL,
                              LOCALE_USER_DEFAULT,
                              DISPATCH_PROPERTYGET,
                              &no_args_dispatch_parameters,
                              property_value,
                              NULL,
                              NULL);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to get result for property "
                    << property_name;
    property_value->vt = VT_EMPTY;
    return WD_SUCCESS;
  }

  return WD_SUCCESS;
}

int Element::GetCssPropertyValue(const std::string& property_name,
                                 std::string* property_value) {
  LOG(TRACE) << "Entering Element::GetCssPropertyValue";

  int status_code = WD_SUCCESS;
  CComPtr<IHTMLDocument2> doc;
  this->GetContainingDocument(false, &doc);
  if (this->IsXmlDocument(doc)) {
    *property_value = "";
    return status_code;
  }

  // The atom is just the definition of an anonymous
  // function: "function() {...}"; Wrap it in another function so we can
  // invoke it with our arguments without polluting the current namespace.
  std::wstring script_source = L"(function() { return (";
  script_source += atoms::asString(atoms::GET_EFFECTIVE_STYLE);
  script_source += L")})();";

  Script script_wrapper(doc, script_source, 2);
  script_wrapper.AddArgument(this->element_);
  script_wrapper.AddArgument(property_name);
  status_code = script_wrapper.Execute();

  if (status_code == WD_SUCCESS) {
    std::wstring raw_value = L"";
    if (script_wrapper.ResultIsString()) {
      raw_value.assign(script_wrapper.result().bstrVal);
    } else if (script_wrapper.ResultIsInteger()) {
      long int_value = script_wrapper.result().lVal;
      raw_value = std::to_wstring(int_value);
    } else if (script_wrapper.ResultIsDouble()) {
      double dbl_value = script_wrapper.result().dblVal;
      raw_value = std::to_wstring(dbl_value);
    } else if (script_wrapper.ResultIsBoolean()) {
      if (script_wrapper.result().boolVal == VARIANT_TRUE) {
        raw_value = L"true";
      } else {
        raw_value = L"false";
      }
    }
    std::string value = StringUtilities::ToString(raw_value);
    std::transform(value.begin(),
                   value.end(),
                   value.begin(),
                   tolower);
    *property_value = value;
  } else {
    LOG(WARN) << "Failed to get value of CSS property";
  }
  return status_code;
}

int Element::GetLocationOnceScrolledIntoView(const ElementScrollBehavior scroll,
                                             LocationInfo* location,
                                             std::vector<LocationInfo>* frame_locations) {
  LOG(TRACE) << "Entering Element::GetLocationOnceScrolledIntoView";

  int status_code = WD_SUCCESS;
  CComPtr<IHTMLDOMNode2> node;
  HRESULT hr = this->element_->QueryInterface(&node);

  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Cannot cast html element to node, QI on IHTMLElement for IHTMLDOMNode2 failed";
    return ENOSUCHELEMENT;
  }

  LocationInfo element_location = {};
  int result = this->GetLocation(&element_location, frame_locations);
  bool document_contains_frames = frame_locations->size() != 0;
  LocationInfo click_location = this->CalculateClickPoint(element_location, document_contains_frames);  

  if (result != WD_SUCCESS ||
      !this->IsLocationInViewPort(click_location, document_contains_frames) ||
      this->IsHiddenByOverflow(element_location, click_location) ||
      !this->IsLocationVisibleInFrames(click_location, *frame_locations)) {
    // Scroll the element into view
    LOG(DEBUG) << "Will need to scroll element into view";
    CComVariant scroll_behavior = VARIANT_TRUE;
    if (scroll == BOTTOM) {
      scroll_behavior = VARIANT_FALSE;
    }
    hr = this->element_->scrollIntoView(scroll_behavior);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Cannot scroll element into view, IHTMLElement::scrollIntoView failed";
      return EOBSOLETEELEMENT;
    }

    std::vector<LocationInfo> scrolled_frame_locations;
    result = this->GetLocation(&element_location, &scrolled_frame_locations);
    if (result != WD_SUCCESS) {
      LOG(WARN) << "Unable to get location of scrolled to element";
      return result;
    }

    click_location = this->CalculateClickPoint(element_location, document_contains_frames);
    if (!this->IsLocationInViewPort(click_location, document_contains_frames)) {
      LOG(WARN) << "Scrolled element is not in view";
      status_code = EELEMENTCLICKPOINTNOTSCROLLED;
    }

    // TODO: Handle the case where the element's click point is in
    // the view port but hidden by the overflow of a parent element.
    // That could would look something like the following:
    // if (this->IsHiddenByOverflow(element_location, click_location)) {
    //   if (!this->IsEntirelyHiddenByOverflow()) {
    //     this->ScrollWithinOverflow(element_location);
    //   }
    //   status_code = EELEMENTCLICKPOINTNOTSCROLLED;
    // }
  }

  LOG(DEBUG) << "(x, y, w, h): "
             << element_location.x << ", "
             << element_location.y << ", "
             << element_location.width << ", "
             << element_location.height;

  // At this point, we know the element is displayed according to its
  // style attributes, and we've made a best effort at scrolling it so
  // that it's completely within the viewport. We will always return
  // the coordinates of the element, even if the scrolling is unsuccessful.
  // However, we will still return the "element not displayed" status code
  // if the click point has not been scrolled to the viewport.
  location->x = element_location.x;
  location->y = element_location.y;
  location->width = element_location.width;
  location->height = element_location.height;

  return status_code;
}

bool Element::IsHiddenByOverflow(const LocationInfo element_location,
                                 const LocationInfo click_location) {
  LOG(TRACE) << "Entering Element::IsHiddenByOverflow";

  bool is_overflow = false;

  int x_offset = click_location.x - element_location.x;
  int y_offset = click_location.y - element_location.y;

  std::wstring script_source(L"(function() { return (");
  script_source += atoms::asString(atoms::IS_OFFSET_IN_PARENT_OVERFLOW);
  script_source += L")})();";

  CComPtr<IHTMLDocument2> doc;
  this->GetContainingDocument(false, &doc);
  Script script_wrapper(doc, script_source, 3);
  script_wrapper.AddArgument(this->element_);
  script_wrapper.AddArgument(x_offset);
  script_wrapper.AddArgument(y_offset);
  int status_code = script_wrapper.Execute();
  if (status_code == WD_SUCCESS) {
    std::wstring raw_overflow_state(script_wrapper.result().bstrVal);
    std::string overflow_state = StringUtilities::ToString(raw_overflow_state);
    is_overflow = (overflow_state == "scroll");
  } else {
    LOG(WARN) << "Unable to determine is element hidden by overflow";
  }

  return is_overflow;
}

bool Element::IsEntirelyHiddenByOverflow() {
  LOG(TRACE) << "Entering Element::IsEntirelyHiddenByOverflow";

  bool is_overflow = false;

  std::wstring script_source(L"(function() { return (");
  script_source += atoms::asString(atoms::IS_ELEMENT_IN_PARENT_OVERFLOW);
  script_source += L")})();";

  CComPtr<IHTMLDocument2> doc;
  this->GetContainingDocument(false, &doc);
  Script script_wrapper(doc, script_source, 1);
  script_wrapper.AddArgument(this->element_);
  int status_code = script_wrapper.Execute();
  if (status_code == WD_SUCCESS) {
    std::wstring raw_overflow_state(script_wrapper.result().bstrVal);
    std::string overflow_state = StringUtilities::ToString(raw_overflow_state);
    is_overflow = (overflow_state == "scroll");
  } else {
    LOG(WARN) << "Unable to determine is element hidden by overflow";
  }

  return is_overflow;
}

bool Element::ScrollWithinOverflow(const LocationInfo element_location) {
  RECT element_rect;
  element_rect.left = element_location.x;
  element_rect.top = element_location.y;
  element_rect.right = element_location.x + element_location.width;
  element_rect.bottom = element_location.y + element_location.height;

  CComPtr<IHTMLElement> parent_element;
  this->element_->get_parentElement(&parent_element);
  while (parent_element != NULL) {
    CComPtr<IHTMLElement2> el2;
    parent_element->QueryInterface<IHTMLElement2>(&el2);
    CComPtr<IHTMLRect> parent_bounding_rect;
    el2->getBoundingClientRect(&parent_bounding_rect);
    RECT parent_rect;
    parent_bounding_rect->get_left(&parent_rect.left);
    parent_bounding_rect->get_top(&parent_rect.top);
    parent_bounding_rect->get_right(&parent_rect.right);
    parent_bounding_rect->get_bottom(&parent_rect.bottom);
    RECT intersection;
    if (::IntersectRect(&intersection, &element_rect, &parent_rect)) {
      if (::EqualRect(&intersection, &element_rect)) {
        CComPtr<IHTMLElement> next_ancestor;
        // The entire element is visible within this ancestor.
        // Need to proceed to the next ancestor in the tree.
        parent_element->get_parentElement(&next_ancestor);
        parent_element.Release();
        parent_element = next_ancestor;
      } else {
        // We have the intersecting rect, so adjust the location
        long intersection_vert_center = intersection.top + ((intersection.bottom - intersection.top) / 2);
        long intersection_horiz_center = intersection.left + ((intersection.right - intersection.left) / 2);

        long offset_top = 0;
        element_->get_offsetTop(&offset_top);
        offset_top += element_location.height / 2;

        long offset_left = 0;
        element_->get_offsetLeft(&offset_left);
        offset_left += element_location.width / 2;

        el2->put_scrollTop(offset_top - intersection_vert_center);
        el2->put_scrollLeft(offset_left - intersection_horiz_center);
        return true;
      }
    } else {
      // the rects don't intersect, so something went wrong.
      break;
    }
  }
  return false;
}
bool Element::IsLocationVisibleInFrames(const LocationInfo location,
                                        const std::vector<LocationInfo> frame_locations) {
  std::vector<LocationInfo>::const_iterator iterator = frame_locations.begin();
  for (; iterator != frame_locations.end(); ++iterator) {
    if (location.x < iterator->x || 
        location.y < iterator->y ||
        location.x > iterator->x + iterator->width || 
        location.y > iterator->y + iterator->height) {
      return false;
    }
  }
  return true;
}

bool Element::IsSelected() {
  LOG(TRACE) << "Entering Element::IsSelected";

  bool selected(false);
  // The atom is just the definition of an anonymous
  // function: "function() {...}"; Wrap it in another function so we can
  // invoke it with our arguments without polluting the current namespace.
  std::wstring script_source(L"(function() { return (");
  script_source += atoms::asString(atoms::IS_SELECTED);
  script_source += L")})();";

  CComPtr<IHTMLDocument2> doc;
  this->GetContainingDocument(false, &doc);
  Script script_wrapper(doc, script_source, 1);
  script_wrapper.AddArgument(this->element_);
  int status_code = script_wrapper.Execute();

  if (status_code == WD_SUCCESS && script_wrapper.ResultIsBoolean()) {
    selected = script_wrapper.result().boolVal == VARIANT_TRUE;
  } else {
    LOG(WARN) << "Unable to determine is element selected";
  }

  return selected;
}

bool Element::IsImageMap(LocationInfo* location) {
  CComPtr<IHTMLElement> map_element;
  CComPtr<IHTMLAreaElement> area_element;
  CComPtr<IHTMLMapElement> map_element_candidate;
  this->element_->QueryInterface<IHTMLMapElement>(&map_element_candidate);
  if (map_element_candidate == NULL) {
    this->element_->QueryInterface<IHTMLAreaElement>(&area_element);
    if (area_element) {
      this->element_->get_parentElement(&map_element);
      if (map_element) {
        map_element->QueryInterface<IHTMLMapElement>(&map_element_candidate);
      }
    }
  }

  if (map_element_candidate && map_element) {
    CComBSTR name_bstr;
    map_element_candidate->get_name(&name_bstr);
    CComBSTR img_selector = L"*[usemap='#";
    img_selector.Append(name_bstr);
    img_selector.Append(L"']");

    CComPtr<IDispatch> doc_dispatch;
    map_element->get_document(&doc_dispatch);

    CComPtr<IDocumentSelector> doc;
    doc_dispatch->QueryInterface<IDocumentSelector>(&doc);
    if (doc) {
      CComPtr<IHTMLElement> img_element;
      doc->querySelector(img_selector, &img_element);
      if (img_element) {
        CComPtr<IHTMLElement2> rect_element;
        img_element->QueryInterface<IHTMLElement2>(&rect_element);
        if (rect_element) {
          CComPtr<IHTMLRect> rect;
          rect_element->getBoundingClientRect(&rect);
          RECT img_rect;
          rect->get_left(&img_rect.left);
          rect->get_top(&img_rect.top);
          rect->get_right(&img_rect.right);
          rect->get_bottom(&img_rect.bottom);

          CComBSTR shape;
          area_element->get_shape(&shape);
          shape.ToLower();
          if (shape == L"default") {
            location->x = img_rect.left;
            location->y = img_rect.top;
            location->width = img_rect.right - img_rect.left;
            location->height = img_rect.bottom - img_rect.top;
            return true;
          }

          CComBSTR coords_bstr;
          area_element->get_coords(&coords_bstr);
          std::wstring coords(coords_bstr);
          std::vector<std::wstring> individual;
          StringUtilities::Split(coords, L",", &individual);
          RECT area_rect = { 0, 0, 0, 0 };
          if (shape == L"rect" && individual.size() == 4) {
            area_rect.left = std::stol(individual.at(0).c_str(), 0, 10);
            area_rect.top = std::stol(individual.at(1).c_str(), 0, 10);
            area_rect.right = std::stol(individual.at(2).c_str(), 0, 10);
            area_rect.bottom = std::stol(individual.at(3).c_str(), 0, 10);
          }
          else if ((shape == L"circle" || shape == "circ") && individual.size() == 3) {
            long center_x = std::stol(individual.at(0), 0, 10);
            long center_y = std::stol(individual.at(1), 0, 10);
            long radius = std::stol(individual.at(2), 0, 10);
            area_rect.left = center_x - radius;
            area_rect.top = center_y - radius;
            area_rect.right = center_x + radius;
            area_rect.bottom = center_y + radius;
          }
          else if ((shape == L"poly" || shape == L"polygon") && individual.size() > 2) {
            long min_x = std::stol(individual.at(0), 0, 10);
            long min_y = std::stol(individual.at(1), 0, 10);
            long max_x = min_x;
            long max_y = min_y;
            for (size_t i = 2; i + 1 < individual.size(); i += 2) {
              long next_x = std::stol(individual.at(i), 0, 10);
              long next_y = std::stol(individual.at(i + 1), 0, 10);
              min_x = min(min_x, next_x);
              max_x = max(max_x, next_x);
              min_y = min(min_y, next_y);
              max_y = max(max_y, next_y);
            }
            area_rect.left = min_x;
            area_rect.bottom = min_y;
            area_rect.right = max_x;
            area_rect.bottom = max_y;
          }
          else {
            // Invalid shape value or coordinate values. Not modifying location.
            return false;
          }

          long img_width = img_rect.right - img_rect.left;
          long img_height = img_rect.bottom - img_rect.top;
          long area_width = area_rect.right - area_rect.left;
          long area_height = area_rect.bottom - area_rect.top;
          location->x = img_rect.left + min(max(area_rect.left, 0), img_width);
          location->y = img_rect.top + min(max(area_rect.top, 0), img_height);
          location->width = min(area_width, img_width - location->x);
          location->height = min(area_height, img_height - location->y);
          return true;
        }
      }
    }
  }
  return false;
}

int Element::GetLocation(LocationInfo* location,
                         std::vector<LocationInfo>* frame_locations) {
  LOG(TRACE) << "Entering Element::GetLocation";

  bool has_absolute_position_ready_to_return = false;

  CComPtr<IHTMLElement2> element2;
  HRESULT hr = this->element_->QueryInterface(&element2);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to cast element to IHTMLElement2";
    return EOBSOLETEELEMENT;
  }

  long top = 0, bottom = 0, left = 0, right = 0;
  LocationInfo map_location = { 0, 0, 0, 0 };
  if (this->IsImageMap(&map_location)) {
    left = map_location.x;
    top = map_location.y;
    right = map_location.x + map_location.width;
    bottom = map_location.y + map_location.height;
  } else {
    // If this element is inline, we need to check whether we should 
    // use getBoundingClientRect() or the first non-zero-sized rect returned
    // by getClientRects(). If the element is not inline, we can use
    // getBoundingClientRect() directly.
    CComPtr<IHTMLRect> rect;
    if (this->IsInline()) {
      CComPtr<IHTMLRectCollection> rects;
      hr = element2->getClientRects(&rects);
      long rect_count;
      rects->get_length(&rect_count);
      if (rect_count > 1) {
        LOG(DEBUG) << "Element is inline with multiple client rects, finding first non-zero sized client rect";
        for (long i = 0; i < rect_count; ++i) {
          CComVariant index(i);
          CComVariant rect_variant;
          hr = rects->item(&index, &rect_variant);
          if (SUCCEEDED(hr) && rect_variant.pdispVal) {
            CComPtr<IHTMLRect> qi_rect;
            rect_variant.pdispVal->QueryInterface<IHTMLRect>(&qi_rect);
            if (qi_rect) {
              rect = qi_rect;
              if (RectHasNonZeroDimensions(rect)) {
                // IE returns absolute positions in the page, rather than frame- and scroll-bound
                // positions, for clientRects (as opposed to boundingClientRects).
                has_absolute_position_ready_to_return = true;
                break;
              }
            }
          }
        }
      }
      else {
        LOG(DEBUG) << "Element is inline with one client rect, using IHTMLElement2::getBoundingClientRect";
        hr = element2->getBoundingClientRect(&rect);
      }
    }
    else {
      LOG(DEBUG) << "Element is a block element, using IHTMLElement2::getBoundingClientRect";
      hr = element2->getBoundingClientRect(&rect);
      if (this->HasFirstChildTextNodeOfMultipleChildren()) {
        LOG(DEBUG) << "Element has multiple children, but the first child is a text node, using text node boundaries";
        // Note that since subsequent statements in this method use the HTMLRect
        // object, we will update that object with the values of the text node.
        LocationInfo text_node_location;
        this->GetTextBoundaries(&text_node_location);
        rect->put_left(text_node_location.x);
        rect->put_top(text_node_location.y);
        rect->put_right(text_node_location.x + text_node_location.width);
        rect->put_bottom(text_node_location.y + text_node_location.height);
      }
    }
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Cannot figure out where the element is on screen, client rect retrieval failed";
      return EUNHANDLEDERROR;
    }

    // If the rect of the element has zero width and height, check its
    // children to see if any of them have width and height, in which
    // case, this element will be visible.
    if (!RectHasNonZeroDimensions(rect)) {
      LOG(DEBUG) << "Element has client rect with zero dimension, checking children for non-zero dimension client rects";
      CComPtr<IHTMLDOMNode> node;
      element2->QueryInterface(&node);
      CComPtr<IDispatch> children_dispatch;
      node->get_childNodes(&children_dispatch);
      CComPtr<IHTMLDOMChildrenCollection> children;
      children_dispatch->QueryInterface<IHTMLDOMChildrenCollection>(&children);
      if (!!children) {
        long children_count = 0;
        children->get_length(&children_count);
        for (long i = 0; i < children_count; ++i) {
          CComPtr<IDispatch> child_dispatch;
          children->item(i, &child_dispatch);
          CComPtr<IHTMLElement> child;
          child_dispatch->QueryInterface(&child);
          if (child != NULL) {
            int result = WD_SUCCESS;
            Element child_element(child, this->containing_window_handle_);
            if (frame_locations == nullptr) {
              result = child_element.GetLocation(location, nullptr);
            }
            else {
              std::vector<LocationInfo> child_frame_locations;
              result = child_element.GetLocation(location, &child_frame_locations);
            }
            if (result == WD_SUCCESS) {
              return result;
            }
          }
        }
      }
    }

    rect->get_top(&top);
    rect->get_left(&left);
    rect->get_bottom(&bottom);
    rect->get_right(&right);
  }

  long w = right - left;
  long h = bottom - top;

  bool element_is_in_frame = this->AppendFrameDetails(frame_locations);
  if (!has_absolute_position_ready_to_return) {
    // On versions of IE prior to 8 on Vista, if the element is out of the 
    // viewport this would seem to return 0,0,0,0. IE 8 returns position in 
    // the DOM regardless of whether it's in the browser viewport.
    long scroll_left, scroll_top = 0;
    element2->get_scrollLeft(&scroll_left);
    element2->get_scrollTop(&scroll_top);
    left += scroll_left;
    top += scroll_top;

    // Only add the frame offset if the element is actually in a frame.
    if (element_is_in_frame) {
      LocationInfo frame_location = frame_locations->back();
      left += frame_location.x;
      top += frame_location.y;
    } else {
      LOG(DEBUG) << "Element is not in a frame";
    }
  }

  location->x = left;
  location->y = top;
  location->width = w;
  location->height = h;

  return WD_SUCCESS;
}

bool Element::IsInline() {
  LOG(TRACE) << "Entering Element::IsInline";

  // TODO(jimevans): Clean up this extreme lameness.
  // We should be checking styles here for whether the
  // element is inline or not.
  CComPtr<IHTMLAnchorElement> anchor;
  HRESULT hr = this->element_->QueryInterface(&anchor);
  if (anchor) {
    return true;
  }

  CComPtr<IHTMLSpanElement> span;
  hr = this->element_->QueryInterface(&span);
  if (span) {
    return true;
  }

  CComPtr<IHTMLLabelElement> label;
  hr = this->element_->QueryInterface(&label);
  if (label) {
    return true;
  }

  return false;
}

bool Element::RectHasNonZeroDimensions(IHTMLRect* rect) {
  LOG(TRACE) << "Entering Element::RectHasNonZeroDimensions";

  long top = 0, bottom = 0, left = 0, right = 0;

  rect->get_top(&top);
  rect->get_left(&left);
  rect->get_bottom(&bottom);
  rect->get_right(&right);

  long w = right - left;
  long h = bottom - top;

  return w > 0 && h > 0;
}

bool Element::AppendFrameDetails(std::vector<LocationInfo>* frame_locations) {
  LOG(TRACE) << "Entering Element::GetFrameDetails";

  if (frame_locations == nullptr) {
    return false;
  }

  CComPtr<IHTMLDocument2> owner_doc;
  int status_code = this->GetContainingDocument(true, &owner_doc);
  if (status_code != WD_SUCCESS) {
    LOG(WARN) << "Unable to get containing document";
    return false;
  }

  CComPtr<IHTMLWindow2> owner_doc_window;
  HRESULT hr = owner_doc->get_parentWindow(&owner_doc_window);
  if (!owner_doc_window) {
    LOG(WARN) << "Unable to get parent window, call to IHTMLDocument2::get_parentWindow failed";
    return false;
  }

  // Get the parent window to the current window, where "current window" is
  // the window containing the parent document of this element. If that parent
  // window exists, and it is not the same as the current window, we assume
  // this element exists inside a frame or iframe. If it is in a frame, get
  // the parent document containing the frame, so we can get the information
  // about the frame or iframe element hosting the document of this element.
  CComPtr<IHTMLWindow2> parent_window;
  hr = owner_doc_window->get_parent(&parent_window);
  if (parent_window && !owner_doc_window.IsEqualObject(parent_window)) {
    LOG(DEBUG) << "Element is in a frame.";
    CComPtr<IHTMLDocument2> parent_doc;
    status_code = this->GetDocumentFromWindow(parent_window, &parent_doc);

    CComPtr<IHTMLFramesCollection2> frames;
    hr = parent_doc->get_frames(&frames);

    long frame_count(0);
    hr = frames->get_length(&frame_count);
    CComVariant index;
    index.vt = VT_I4;
    for (long i = 0; i < frame_count; ++i) {
      // See if the document in each frame is this element's 
      // owner document.
      index.lVal = i;
      CComVariant result;
      hr = frames->item(&index, &result);
      CComPtr<IHTMLWindow2> frame_window;
      result.pdispVal->QueryInterface<IHTMLWindow2>(&frame_window);
      if (!frame_window) {
        // Frame is not an HTML frame.
        continue;
      }

      CComPtr<IHTMLDocument2> frame_doc;
      status_code = this->GetDocumentFromWindow(frame_window, &frame_doc);

      if (frame_doc.IsEqualObject(owner_doc)) {
        // The document in this frame *is* this element's owner
        // document. Get the frameElement property of the document's
        // containing window (which is itself an HTML element, either
        // a frame or an iframe). Then get the x and y coordinates of
        // that frame element.
        // N.B. We must use JavaScript here, as directly using
        // IHTMLWindow4.get_frameElement() returns E_NOINTERFACE under
        // some circumstances.
        LOG(DEBUG) << "Located host frame. Attempting to get hosting element";
        std::wstring script_source = L"(function(){ return function() { return arguments[0].frameElement };})();";
        Script script_wrapper(frame_doc, script_source, 1);
        CComVariant window_variant(frame_window);
        script_wrapper.AddArgument(window_variant);
        status_code = script_wrapper.Execute();
        CComPtr<IHTMLFrameBase> frame_base;
        if (status_code == WD_SUCCESS) {
          hr = script_wrapper.result().pdispVal->QueryInterface<IHTMLFrameBase>(&frame_base);
          if (FAILED(hr)) {
            LOG(WARN) << "Found the frame element, but could not QueryInterface to IHTMLFrameBase.";
          }
        } else {
          // Can't get the frameElement property, likely because the frames are from different
          // domains. So start at the parent document, and use getElementsByTagName to retrieve
          // all of the iframe elements (if there are no iframe elements, get the frame elements)
          // **** BIG HUGE ASSUMPTION!!! ****
          // The index of the frame from the document.frames collection will correspond to the 
          // index into the collection of iframe/frame elements returned by getElementsByTagName.
          LOG(WARN) << "Attempting to get frameElement via JavaScript failed. "
                    << "This usually means the frame is in a different domain than the parent frame. "
                    << "Browser security against cross-site scripting attacks will not allow this. "
                    << "Attempting alternative method.";
          long collection_count = 0;
          CComPtr<IDispatch> element_dispatch;
          CComPtr<IHTMLDocument3> doc;
          parent_doc->QueryInterface<IHTMLDocument3>(&doc);
          if (doc) {
            LOG(DEBUG) << "Looking for <iframe> elements in parent document.";
            CComBSTR iframe_tag_name = L"iframe";
            CComPtr<IHTMLElementCollection> iframe_collection;
            hr = doc->getElementsByTagName(iframe_tag_name, &iframe_collection);
            hr = iframe_collection->get_length(&collection_count);
            if (collection_count != 0) {
              if (collection_count > index.lVal) {
                LOG(DEBUG) << "Found <iframe> elements in parent document, retrieving element" << index.lVal << ".";
                hr = iframe_collection->item(index, index, &element_dispatch);
                hr = element_dispatch->QueryInterface<IHTMLFrameBase>(&frame_base);
              }
            } else {
              LOG(DEBUG) << "No <iframe> elements, looking for <frame> elements in parent document.";
              CComBSTR frame_tag_name = L"frame";
              CComPtr<IHTMLElementCollection> frame_collection;
              hr = doc->getElementsByTagName(frame_tag_name, &frame_collection);
              hr = frame_collection->get_length(&collection_count);
              if (collection_count > index.lVal) {
                LOG(DEBUG) << "Found <frame> elements in parent document, retrieving element" << index.lVal << ".";
                hr = frame_collection->item(index, index, &element_dispatch);
                hr = element_dispatch->QueryInterface<IHTMLFrameBase>(&frame_base);
              }
            }
          } else {
            LOG(WARN) << "QueryInterface of parent document to IHTMLDocument3 failed.";
          }
        }

        if (frame_base) {
          LOG(DEBUG) << "Successfully found frame hosting element";
          LocationInfo frame_doc_info;
          bool doc_dimensions_success = DocumentHost::GetDocumentDimensions(
              frame_doc,
              &frame_doc_info);

          // Wrap the element so we can find its location. Note that
          // GetLocation() may recursively call into this method.
          CComPtr<IHTMLElement> frame_element;
          frame_base->QueryInterface<IHTMLElement>(&frame_element);
          Element element_wrapper(frame_element, this->containing_window_handle_);
          CComPtr<IHTMLStyle> style;
          frame_element->get_style(&style);

          LocationInfo frame_location = {};
          status_code = element_wrapper.GetLocation(&frame_location,
                                                    frame_locations);

          if (status_code == WD_SUCCESS) {
            // Take the border of the frame element into account.
            // N.B. We don't have to do this for non-frame elements,
            // because the border is part of the hit-test region. For
            // finding offsets to get absolute position of elements 
            // within frames, the origin of the frame document is offset
            // by the border width.
            CComPtr<IHTMLElement2> border_width_element;
            frame_element->QueryInterface<IHTMLElement2>(&border_width_element);

            long left_border_width = 0;
            border_width_element->get_clientLeft(&left_border_width);
            frame_location.x += left_border_width;

            long top_border_width = 0;
            border_width_element->get_clientTop(&top_border_width);
            frame_location.y += top_border_width;

            // Take into account the presence of scrollbars in the frame.
            if (doc_dimensions_success) {
              if (frame_doc_info.height > frame_location.height) {
                int horizontal_scrollbar_height = ::GetSystemMetrics(SM_CYHSCROLL);
                frame_location.height -= horizontal_scrollbar_height;
              }
              if (frame_doc_info.width > frame_location.width) {
                int vertical_scrollbar_width = ::GetSystemMetrics(SM_CXVSCROLL);
                frame_location.width -= vertical_scrollbar_width;
              }
            }
            frame_locations->push_back(frame_location);
          }
          return true;
        }
      }
    }
  }

  // If we reach here, the element isn't in a frame/iframe.
  return false;
}

bool Element::GetClickableViewPortLocation(const bool document_contains_frames, LocationInfo* location) {
  LOG(TRACE) << "Entering Element::GetClickableViewPortLocation";

  WINDOWINFO window_info;
  window_info.cbSize = sizeof(WINDOWINFO);
  BOOL get_window_info_result = ::GetWindowInfo(this->containing_window_handle_, &window_info);
  if (get_window_info_result == FALSE) {
    LOGERR(WARN) << "Cannot determine size of window, call to GetWindowInfo API failed";
    return false;
  }

  long window_width = window_info.rcClient.right - window_info.rcClient.left;
  long window_height = window_info.rcClient.bottom - window_info.rcClient.top;

  // If we're not on the top-level document, we can assume that the view port
  // includes the entire client window, since scrollIntoView should do the
  // right thing and make it visible. Otherwise, we prefer getting the view
  // port size by either getting the window.innerWidth and .innerHeight, or
  // by using documentElement.clientHeight and .clientWidth.
  if (!document_contains_frames) {
    CComPtr<IHTMLDocument2> doc;
    int status_code = this->GetContainingDocument(false, &doc);
    if (status_code == WD_SUCCESS) {
      bool used_window_properties = false;
      CComPtr<IHTMLWindow2> parent_window;
      HRESULT hr = doc->get_parentWindow(&parent_window);
      if (SUCCEEDED(hr) && parent_window) {
        CComPtr<IHTMLWindow7> window;
        hr = parent_window->QueryInterface<IHTMLWindow7>(&window);
        if (SUCCEEDED(hr) && window) {
          window->get_innerHeight(&window_height);
          window->get_innerWidth(&window_width);
          used_window_properties = true;
        }
      }

      // If using the window object's innerWidth and innerHeight properties
      // failed, then fall back to the document element's clientWidth and
      // clientHeight properties.
      if (!used_window_properties) {
        int document_mode = DocumentHost::GetDocumentMode(doc);
        CComPtr<IHTMLDocument3> document_element_doc;
        CComPtr<IHTMLElement> document_element;
        hr = doc->QueryInterface<IHTMLDocument3>(&document_element_doc);
        if (SUCCEEDED(hr) && document_element_doc) {
          hr = document_element_doc->get_documentElement(&document_element);
        }
        if (SUCCEEDED(hr) && document_mode > 5 && document_element) {
          CComPtr<IHTMLElement2> size_element;
          hr = document_element->QueryInterface<IHTMLElement2>(&size_element);
          size_element->get_clientHeight(&window_height);
          size_element->get_clientWidth(&window_width);
        } else {
          // This branch is only included if getting documentElement fails.
          LOG(WARN) << "Document containing element does not contains frames, "
                    << "but getting the documentElement property failed, or the "
                    << "doctype has thrown the browser into pre-IE6 rendering. "
                    << "The view port calculation may be inaccurate";
          LocationInfo document_info;
          DocumentHost::GetDocumentDimensions(doc, &document_info);
          if (document_info.height > window_height) {
            int vertical_scrollbar_width = ::GetSystemMetrics(SM_CXVSCROLL);
            window_width -= vertical_scrollbar_width;
          }
          if (document_info.width > window_width) {
            int horizontal_scrollbar_height = ::GetSystemMetrics(SM_CYHSCROLL);
            window_height -= horizontal_scrollbar_height;
          }
        }
      }
    }
  }

  // Hurrah! Now we know what the visible area of the viewport is
  // N.B. There is an n-pixel sized area next to the client area border
  // where clicks are interpreted as a click on the window border, not
  // within the client area. Some clicks may fail if they are close enough
  // to the border.
  location->width = window_width;
  location->height = window_height;
  return true;
}

LocationInfo Element::CalculateClickPoint(const LocationInfo location, const bool document_contains_frames) {
  LOG(TRACE) << "Entering Element::CalculateClickPoint";

  long corrected_width = location.width;
  long corrected_height = location.height;
  long corrected_x = location.x;
  long corrected_y = location.y;

  LocationInfo clickable_viewport = {};
  bool result = this->GetClickableViewPortLocation(document_contains_frames,
                                                   &clickable_viewport);

  if (result) {
    // TODO: Handle the case where the center of the target element
    // is already in the view port. The code would look something like
    // the following:
    // If the center of the target element is already in the view port,
    // we don't need to adjust to find the "in view center point."
    // Technically, this is a deliberate violation of the spec.
    //long element_center_x = location.x + static_cast<long>(floor(location.width / 2.0));
    //long element_center_y = location.y + static_cast<long>(floor(location.height / 2.0));
    //if (element_center_x < 0 ||
    //    element_center_x >= clickable_viewport.width ||
    //    element_center_y < 0 ||
    //    element_center_y >= clickable_viewport.height) {
    RECT element_rect;
    element_rect.left = location.x;
    element_rect.top = location.y;
    element_rect.right = location.x + location.width;
    element_rect.bottom = location.y + location.height;

    RECT viewport_rect;
    viewport_rect.left = clickable_viewport.x;
    viewport_rect.top = clickable_viewport.y;
    viewport_rect.right = clickable_viewport.x + clickable_viewport.width;
    viewport_rect.bottom = clickable_viewport.y + clickable_viewport.height;

    RECT intersect_rect;
    BOOL is_intersecting = ::IntersectRect(&intersect_rect,
      &element_rect,
      &viewport_rect);
    if (is_intersecting) {
      corrected_width = intersect_rect.right - intersect_rect.left;
      corrected_height = intersect_rect.bottom - intersect_rect.top;
      // If the x or y coordinate is greater than or equal to zero, the
      // initial location will already be correct, and not need to be
      // adjusted.
      if (location.x < 0) {
        corrected_x = 0;
      }
      if (location.y < 0) {
        corrected_y = 0;
      }
    }
  }

  LocationInfo click_location = {};  
  click_location.x = corrected_x + static_cast<long>(floor(corrected_width / 2.0));
  click_location.y = corrected_y + static_cast<long>(floor(corrected_height / 2.0));
  return click_location;
}

bool Element::IsLocationInViewPort(const LocationInfo location, const bool document_contains_frames) {
  LOG(TRACE) << "Entering Element::IsLocationInViewPort";

  LocationInfo clickable_viewport = {};
  bool result = this->GetClickableViewPortLocation(document_contains_frames, &clickable_viewport);
  if (!result) {
    // problem is already logged, so just return 
    return false;
  }

  if (location.x < 0 || location.x >= clickable_viewport.width) {
    LOG(WARN) << "X coordinate is out of element area";
    return false;
  }

  // And in the Y?
  if (location.y < 0 || location.y >= clickable_viewport.height) {
    LOG(WARN) << "Y coordinate is out of element area";
    return false;
  }

  return true;
}

int Element::GetContainingDocument(const bool use_dom_node,
                                   IHTMLDocument2** doc) {
  LOG(TRACE) << "Entering Element::GetContainingDocument";

  HRESULT hr = S_OK;
  CComPtr<IDispatch> dispatch_doc;

  if (use_dom_node) {
    CComPtr<IHTMLDOMNode2> node;
    hr = this->element_->QueryInterface(&node);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Unable to cast element to IHTMLDomNode2";
      return ENOSUCHDOCUMENT;
    }

    hr = node->get_ownerDocument(&dispatch_doc);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Unable to locate owning document, call to IHTMLDOMNode2::get_ownerDocument failed";
      return ENOSUCHDOCUMENT;
    }
  } else {
    hr = this->element_->get_document(&dispatch_doc);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Unable to locate document property, call to IHTMLELement::get_document failed";
      return ENOSUCHDOCUMENT;
    }
  }

  try {
    hr = dispatch_doc.QueryInterface<IHTMLDocument2>(doc);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Found document but it's not the expected type (IHTMLDocument2)";
      return ENOSUCHDOCUMENT;
    }
  } catch(...) {
    LOG(WARN) << "Found document but it's not the expected type (IHTMLDocument2)";
    return ENOSUCHDOCUMENT;
  }

  return WD_SUCCESS;
}

int Element::GetDocumentFromWindow(IHTMLWindow2* parent_window,
                                   IHTMLDocument2** parent_doc) {
  LOG(TRACE) << "Entering Element::GetParentDocument";

  HRESULT hr = parent_window->get_document(parent_doc);
  if (FAILED(hr)) {
    if (hr == E_ACCESSDENIED) {
      // Cross-domain documents may throw Access Denied. If so,
      // get the document through the IWebBrowser2 interface.
      CComPtr<IServiceProvider> service_provider;
      hr = parent_window->QueryInterface<IServiceProvider>(&service_provider);
      if (FAILED(hr)) {
        LOGHR(WARN, hr) << "Unable to get browser, call to IHTMLWindow2::QueryInterface failed for IServiceProvider";
        return ENOSUCHDOCUMENT;
      }
      CComPtr<IWebBrowser2> window_browser;
      hr = service_provider->QueryService(IID_IWebBrowserApp, &window_browser);
      if (FAILED(hr)) {
        LOGHR(WARN, hr) << "Unable to get browser, call to IServiceProvider::QueryService failed for IID_IWebBrowserApp";
        return ENOSUCHDOCUMENT;
      }
      CComPtr<IDispatch> parent_doc_dispatch;
      hr = window_browser->get_Document(&parent_doc_dispatch);
      if (FAILED(hr)) {
        LOGHR(WARN, hr) << "Unable to get document, call to IWebBrowser2::get_Document failed";
        return ENOSUCHDOCUMENT;
      }
      try {
        hr = parent_doc_dispatch->QueryInterface<IHTMLDocument2>(parent_doc);
        if (FAILED(hr)) {
          LOGHR(WARN, hr) << "Unable to get document, QueryInterface for IHTMLDocument2 failed";
          return ENOSUCHDOCUMENT;
        }
      } catch(...) {
        LOG(WARN) << "Unable to get document, exception thrown attempting to QueryInterface for IHTMLDocument2";
        return ENOSUCHDOCUMENT;
      }
    } else {
      LOGHR(WARN, hr) << "Unable to get document, IHTMLWindow2::get_document failed with error code other than E_ACCESSDENIED";
      return ENOSUCHDOCUMENT;
    }
  }
  return WD_SUCCESS;
}

bool Element::IsAttachedToDom() {
  // Verify that the element is still valid by getting the document
  // element and calling IHTMLElement::contains() to see if the document
  // contains this element.
  if (this->element_) {
    CComPtr<IHTMLDOMNode2> node;
    HRESULT hr = this->element_->QueryInterface<IHTMLDOMNode2>(&node);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Unable to cast element to IHTMLDomNode2";
      return false;
    }

    CComPtr<IDispatch> dispatch_doc;
    hr = node->get_ownerDocument(&dispatch_doc);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Unable to locate owning document, call to IHTMLDOMNode2::get_ownerDocument failed";
      return false;
    }

    if (dispatch_doc) {
      CComPtr<IHTMLDocument3> doc;
      hr = dispatch_doc.QueryInterface<IHTMLDocument3>(&doc);
      if (FAILED(hr)) {
        LOGHR(WARN, hr) << "Found document but it's not the expected type (IHTMLDocument3)";
        return false;
      }

      CComPtr<IHTMLElement> document_element;
      hr = doc->get_documentElement(&document_element);
      if (FAILED(hr)) {
        LOGHR(WARN, hr) << "Unable to locate document element, call to IHTMLDocument3::get_documentElement failed";
        return false;
      }

      if (document_element) {
        VARIANT_BOOL contains(VARIANT_FALSE);
        hr = document_element->contains(this->element_, &contains);
        if (FAILED(hr)) {
          LOGHR(WARN, hr) << "Call to IHTMLElement::contains failed";
          return false;
        }

        return contains == VARIANT_TRUE;
      }
    }
  }
  return false;
}

bool Element::IsDocumentFocused(IHTMLDocument2* focused_doc) {
  CComPtr<IDispatch> parent_doc_dispatch;
  this->element_->get_document(&parent_doc_dispatch);

  if (parent_doc_dispatch.IsEqualObject(focused_doc)) {
    return true;
  } else {
    LOG(WARN) << "Found managed element's document is not currently focused";
  }
  return false;
}

bool Element::HasFirstChildTextNodeOfMultipleChildren() {
  CComPtr<IHTMLDOMNode> element_node;
  HRESULT hr = this->element_.QueryInterface<IHTMLDOMNode>(&element_node);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "QueryInterface for IHTMLDOMNode on element failed.";
    return false;
  }

  CComPtr<IDispatch> child_nodes_dispatch;
  hr = element_node->get_childNodes(&child_nodes_dispatch);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Call to get_childNodes on element failed.";
    return false;
  }

  CComPtr<IHTMLDOMChildrenCollection> child_nodes;
  hr = child_nodes_dispatch.QueryInterface<IHTMLDOMChildrenCollection>(&child_nodes);

  long length = 0;
  hr = child_nodes->get_length(&length);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Call to get_length on child nodes collection failed.";
    return false;
  }

  // If the element has no children, then it has no single text node child.
  // If the element has only one child, then the element itself should be seen
  // as the correct size by the caller. Only in the case where we have multiple
  // children, and the first is a text element containing non-whitespace text
  // should we have to worry about using the text node as the focal point.
  if (length > 1) {
    CComPtr<IDispatch> child_dispatch;
    hr = child_nodes->item(0, &child_dispatch);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Call to item(0) on child nodes collection failed.";
      return false;
    }

    CComPtr<IHTMLDOMNode> child_node;
    hr = child_dispatch.QueryInterface<IHTMLDOMNode>(&child_node);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "QueryInterface for IHTMLDOMNode on child node failed.";
      return false;
    }

    long node_type = 0;
    hr = child_node->get_nodeType(&node_type);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Call to get_nodeType on child node failed.";
      return false;
    }

    if (node_type == 3) {
      CComVariant node_value;
      hr = child_node->get_nodeValue(&node_value);
      if (FAILED(hr)) {
        LOGHR(WARN, hr) << "Call to get_nodeValue on child node failed.";
        return false;
      }

      if (node_value.vt != VT_BSTR) {
        // nodeValue is not a string.
        return false;
      }

      CComBSTR bstr = node_value.bstrVal;
      std::wstring node_text = node_value.bstrVal;
      if (StringUtilities::Trim(node_text) != L"") {
        // This element has a text node only if the text node
        // contains actual text other than whitespace.
        return true;
      }
    }
  }
  return false;
}

bool Element::GetTextBoundaries(LocationInfo* text_info) {
  CComPtr<IHTMLDocument2> doc;
  this->GetContainingDocument(false, &doc);
  CComPtr<IHTMLElement> body_element;
  HRESULT hr = doc->get_body(&body_element);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Call to get_body on document failed.";
    return false;
  }

  CComPtr<IHTMLBodyElement> body;
  hr = body_element.QueryInterface<IHTMLBodyElement>(&body);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "QueryInterface for IHTMLBodyElement on body element failed.";
    return false;
  }

  CComPtr<IHTMLTxtRange> range;
  hr = body->createTextRange(&range);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Call to createTextRange on body failed.";
    return false;
  }

  hr = range->moveToElementText(this->element_);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Call to moveToElementText on range failed.";
    return false;
  }

  CComPtr<IHTMLTextRangeMetrics> range_metrics;
  hr = range.QueryInterface<IHTMLTextRangeMetrics>(&range_metrics);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "QueryInterface for IHTMLTextRangeMetrics on range failed.";
    return false;
  }

  long height = 0;
  hr = range_metrics->get_boundingHeight(&height);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Call to get_boundingHeight on range metrics failed.";
    return false;
  }

  long width = 0;
  hr = range_metrics->get_boundingWidth(&width);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Call to get_boundingWidth on range metrics failed.";
    return false;
  }

  long top = 0;
  hr = range_metrics->get_offsetTop(&top);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Call to get_offsetTop on range metrics failed.";
    return false;
  }

  long left = 0;
  hr = range_metrics->get_offsetLeft(&left);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Call to get_offsetLeft on range metrics failed.";
    return false;
  }

  text_info->x = left;
  text_info->y = top;
  text_info->height = height;
  text_info->width = width;
  return true;
}

} // namespace webdriver
