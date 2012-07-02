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
#include "Browser.h"
#include "Generated/atoms.h"
#include "interactions.h"
#include "logging.h"

namespace webdriver {

Element::Element(IHTMLElement* element, HWND containing_window_handle) {
  LOG(TRACE) << "Entering Element::Element";

  // NOTE: COM should be initialized on this thread, so we
  // could use CoCreateGuid() and StringFromGUID2() instead.
  UUID guid;
  RPC_WSTR guid_string = NULL;
  RPC_STATUS status = ::UuidCreate(&guid);
  status = ::UuidToString(&guid, &guid_string);

  // RPC_WSTR is currently typedef'd in RpcDce.h (pulled in by rpc.h)
  // as unsigned short*. It needs to be typedef'd as wchar_t* 
  wchar_t* cast_guid_string = reinterpret_cast<wchar_t*>(guid_string);
  this->element_id_ = CW2A(cast_guid_string, CP_UTF8);

  ::RpcStringFree(&guid_string);

  this->element_ = element;
  this->containing_window_handle_ = containing_window_handle;
}

Element::~Element(void) {
}

Json::Value Element::ConvertToJson() {
  LOG(TRACE) << "Entering Element::ConvertToJson";

  Json::Value json_wrapper;
  json_wrapper["ELEMENT"] = this->element_id_;

  return json_wrapper;
}

int Element::IsDisplayed(bool* result) {
  LOG(TRACE) << "Entering Element::IsDisplayed";

  int status_code = SUCCESS;

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
  script_wrapper.AddArgument(true);
  status_code = script_wrapper.Execute();

  if (status_code == SUCCESS) {
    *result = script_wrapper.result().boolVal == VARIANT_TRUE;
  } else {
    LOG(WARN) << "Failed to determine is element displayed";
  }

  return status_code;
}

std::string Element::GetTagName() {
  LOG(TRACE) << "Entering Element::GetTagName";

  CComBSTR tag_name_bstr;
  this->element_->get_tagName(&tag_name_bstr);
  tag_name_bstr.ToLower();
  std::string tag_name = CW2A(tag_name_bstr, CP_UTF8);
  return tag_name;
}

bool Element::IsEnabled() {
  LOG(TRACE) << "Entering Element::IsEnabled";

  bool result(false);

  // The atom is just the definition of an anonymous
  // function: "function() {...}"; Wrap it in another function so we can
  // invoke it with our arguments without polluting the current namespace.
  std::wstring script_source(L"(function() { return (");
  script_source += atoms::asString(atoms::IS_ENABLED);
  script_source += L")})();";

  CComPtr<IHTMLDocument2> doc;
  this->GetContainingDocument(false, &doc);
  Script script_wrapper(doc, script_source, 1);
  script_wrapper.AddArgument(this->element_);
  int status_code = script_wrapper.Execute();

  if (status_code == SUCCESS) {
    result = script_wrapper.result().boolVal == VARIANT_TRUE;
  } else {
    LOG(WARN) << "Failed to determine is element enabled";
  }

  return result;
}

int Element::Click(const ELEMENT_SCROLL_BEHAVIOR scroll_behavior) {
  LOG(TRACE) << "Entering Element::Click";

  long x = 0, y = 0, w = 0, h = 0;
  int status_code = this->GetLocationOnceScrolledIntoView(scroll_behavior, &x, &y, &w, &h);

  if (status_code == SUCCESS) {
    long click_x;
    long click_y;
    GetClickPoint(x, y, w, h, &click_x, &click_y);

    // Create a mouse move, mouse down, mouse up OS event
    LRESULT result = mouseMoveTo(this->containing_window_handle_,
                                 /* duration of move in ms = */ 10,
                                 x,
                                 y,
                                 click_x,
                                 click_y);
    if (result != SUCCESS) {
      LOG(WARN) << "Unable to move mouse, mouseMoveTo returned non-zero value";
      return static_cast<int>(result);
    }
    
    result = clickAt(this->containing_window_handle_,
                     click_x,
                     click_y,
                     MOUSEBUTTON_LEFT);
    if (result != SUCCESS) {
      LOG(WARN) << "Unable to click at by mouse, clickAt returned non-zero value";
      return static_cast<int>(result);
    }

    //wait(50);
  } else {
    LOG(WARN) << "Unable to get location of clicked element";
  }

  return status_code;
}

int Element::GetAttributeValue(const std::string& attribute_name,
                               std::string* attribute_value,
                               bool* value_is_null) {
  LOG(TRACE) << "Entering Element::GetAttributeValue";

  std::wstring wide_attribute_name = CA2W(attribute_name.c_str(), CP_UTF8);
  int status_code = SUCCESS;

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
  
  CComVariant value_variant;
  if (status_code == SUCCESS) {
    *value_is_null = !script_wrapper.ConvertResultToString(attribute_value);
  } else {
    LOG(WARN) << "Failed to determine element attribute";
  }

  return SUCCESS;
}

int Element::GetLocationOnceScrolledIntoView(const ELEMENT_SCROLL_BEHAVIOR scroll,
                                             long* x,
                                             long* y,
                                             long* width,
                                             long* height) {
  LOG(TRACE) << "Entering Element::GetLocationOnceScrolledIntoView";

  int status_code = SUCCESS;
  CComPtr<IHTMLDOMNode2> node;
  HRESULT hr = this->element_->QueryInterface(&node);

  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Cannot cast html element to node, QI on IHTMLElement for IHTMLDOMNode2 failed";
    return ENOSUCHELEMENT;
  }

  bool displayed;
  int result = this->IsDisplayed(&displayed);
  if (result != SUCCESS) {
    LOG(WARN) << "Unable to determine element is displayed";
    return result;
  } 

  if (!displayed) {
    LOG(WARN) << "Element is not displayed";
    return EELEMENTNOTDISPLAYED;
  }

  long top = 0, left = 0, element_width = 0, element_height = 0;
  result = this->GetLocation(&left, &top, &element_width, &element_height);
  long click_x, click_y;
  this->GetClickPoint(left, top, element_width, element_height, &click_x, &click_y);

  if (result != SUCCESS ||
      !this->IsClickPointInViewPort(left, top, element_width, element_height) ||
      this->IsHiddenByOverflow()) {
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

    result = this->GetLocation(&left, &top, &element_width, &element_height);
    if (result != SUCCESS) {
      LOG(WARN) << "Unable to get location of scrolled to element";
      return result;
    }

    if (!this->IsClickPointInViewPort(left,
                                      top,
                                      element_width,
                                      element_height)) {
      LOG(WARN) << "Scrolled element is not in view";
      status_code = EELEMENTCLICKPOINTNOTSCROLLED;
    }
  }

  LOG(DEBUG) << "(x, y, w, h): " << left << ", " << top << ", " << element_width << ", " << element_height;

  // At this point, we know the element is displayed according to its
  // style attributes, and we've made a best effort at scrolling it so
  // that it's completely within the viewport. We will always return
  // the coordinates of the element, even if the scrolling is unsuccessful.
  // However, we will still return the "element not displayed" status code
  // if the click point has not been scrolled to the viewport.
  *x = left;
  *y = top;
  *width = element_width;
  *height = element_height;

  return status_code;
}

bool Element::IsHiddenByOverflow() {
  LOG(TRACE) << "Entering Element::IsHiddenByOverflow";

  bool isOverflow = false;

  // what is more correct: this code or JS dom.bot.isShown.isOverflowHiding ?
  // Use JavaScript for this rather than COM calls to avoid dependency
  // on the IHTMLWindow7 interface, which is IE9-specific.
  std::wstring script_source = L"(function() { return function(){";
  script_source += L"var e = arguments[0];";
  script_source += L"var p = e.parentNode;";
  //Note: This logic duplicates Element::GetClickPoint
  script_source += L"var x = e.offsetLeft + (e.clientWidth / 2);";
  script_source += L"var y = e.offsetTop + (e.clientHeight / 2);";
  script_source += L"var s = window.getComputedStyle ? window.getComputedStyle(p, null) : p.currentStyle;";
  //Note: In the case that the parent has overflow=hidden, and the element is out of sight,
  //this will force the IEDriver to scroll the element in to view.  This is a bug.
  //Note: If we reach the document while walking up the DOM tree, we know we've not
  //encountered an element with the style that would indicate the element is hidden by overflow.
  script_source += L"while (p != null && s != null && s.overflow && s.overflow != 'auto' && s.overflow != 'scroll' && s.overflow != 'hidden') {";
  script_source += L"  p = p.parentNode;";
  script_source += L"  if (p === document) {";
  script_source += L"    return false;";
  script_source += L"  } else {";
  script_source += L"    s = window.getComputedStyle ? window.getComputedStyle(p, null) : p.currentStyle;";
  script_source += L"  }";
  script_source += L"}";
  script_source += L"var containerTop = p.scrollTop;";
  script_source += L"var containerLeft = p.scrollLeft;";
  script_source += L"return p != null && ";
  script_source += L"(x < containerLeft || x > containerLeft + p.clientWidth || ";
  script_source += L"y < containerTop || y > containerTop + p.clientHeight);";
  script_source += L"};})();";

  CComPtr<IHTMLDocument2> doc;
  this->GetContainingDocument(false, &doc);
  Script script_wrapper(doc, script_source, 1);
  script_wrapper.AddArgument(this->element_);
  int status_code = script_wrapper.Execute();
  if (status_code == SUCCESS) {
    isOverflow = script_wrapper.result().boolVal == VARIANT_TRUE;
  } else {
    LOG(WARN) << "Unable to determine is element hidden by overflow";
  }

  return isOverflow;
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

  if (status_code == SUCCESS && script_wrapper.ResultIsBoolean()) {
    selected = script_wrapper.result().boolVal == VARIANT_TRUE;
  } else {
    LOG(WARN) << "Unable to determine is element selected";
  }

  return selected;
}

int Element::GetLocation(long* x, long* y, long* width, long* height) {
  LOG(TRACE) << "Entering Element::GetLocation";

  *x = 0, *y = 0, *width = 0, *height = 0;

  bool hasAbsolutePositionReadyToReturn = false;

  CComPtr<IHTMLElement2> element2;
  HRESULT hr = this->element_->QueryInterface(&element2);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to cast element to IHTMLElement2";
    return EOBSOLETEELEMENT;
  }

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
          hr = rect_variant.pdispVal->QueryInterface(&rect);
          if (SUCCEEDED(hr) && RectHasNonZeroDimensions(rect)) {
            // IE returns absolute positions in the page, rather than frame- and scroll-bound
            // positions, for clientRects (as opposed to boundingClientRects).
            hasAbsolutePositionReadyToReturn = true;
            break;
          }
        }
      }
    } else {
      LOG(DEBUG) << "Element is inline with one client rect, using IHTMLElement2::getBoundingClientRect";
      hr = element2->getBoundingClientRect(&rect);
    }
  } else {
    LOG(DEBUG) << "Element is a block element, using IHTMLElement2::getBoundingClientRect";
    hr = element2->getBoundingClientRect(&rect);
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
    CComPtr<IDispatch> childrenDispatch;
    node->get_childNodes(&childrenDispatch);
    CComQIPtr<IHTMLDOMChildrenCollection> children = childrenDispatch;
    if (!!children) {
      long childrenCount = 0;
      children->get_length(&childrenCount);
      for (long i = 0; i < childrenCount; ++i) {
        CComPtr<IDispatch> childDispatch;
        children->item(i, &childDispatch);
        CComPtr<IHTMLElement> child;
        childDispatch->QueryInterface(&child);
        if (child != NULL) {
          Element childElement(child, this->containing_window_handle_);
          int result = childElement.GetLocation(x, y, width, height);
          if (SUCCEEDED(result)) {
            return result;
          }
        }
      }
    }

    return EELEMENTNOTDISPLAYED;
  }

  long top = 0, bottom = 0, left = 0, right = 0;

  rect->get_top(&top);
  rect->get_left(&left);
  rect->get_bottom(&bottom);
  rect->get_right(&right);

  long w = right - left;
  long h = bottom - top;

  if (!hasAbsolutePositionReadyToReturn) {
    // On versions of IE prior to 8 on Vista, if the element is out of the 
    // viewport this would seem to return 0,0,0,0. IE 8 returns position in 
    // the DOM regardless of whether it's in the browser viewport.

    long scroll_left, scroll_top = 0;
    element2->get_scrollLeft(&scroll_left);
    element2->get_scrollTop(&scroll_top);
    left += scroll_left;
    top += scroll_top;

    long frame_offset_x = 0, frame_offset_y = 0;
    this->GetFrameOffset(&frame_offset_x, &frame_offset_y);
    left += frame_offset_x;
    top += frame_offset_y;
  }

  *x = left;
  *y = top;
  *width = w;
  *height = h;

  return SUCCESS;
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

  return false;
}

bool Element::RectHasNonZeroDimensions(const CComPtr<IHTMLRect> rect) {
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

int Element::GetFrameOffset(long* x, long* y) {
  LOG(TRACE) << "Entering Element::GetFrameOffset";

  CComPtr<IHTMLDocument2> owner_doc;
  int status_code = this->GetContainingDocument(true, &owner_doc);
  if (status_code != SUCCESS) {
    LOG(WARN) << "Unable to get containing document";
    return status_code;
  }

  CComPtr<IHTMLWindow2> owner_doc_window;
  HRESULT hr = owner_doc->get_parentWindow(&owner_doc_window);
  if (!owner_doc_window) {
    LOG(WARN) << "Unable to get parent window, call to IHTMLDocument2::get_parentWindow failed";
    return ENOSUCHDOCUMENT;
  }

  CComPtr<IHTMLWindow2> parent_window;
  hr = owner_doc_window->get_parent(&parent_window);
  if (parent_window && !owner_doc_window.IsEqualObject(parent_window)) {
    CComPtr<IHTMLDocument2> parent_doc;
    status_code = this->GetParentDocument(parent_window, &parent_doc);

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
      CComQIPtr<IHTMLWindow2> frame_window(result.pdispVal);
      if (!frame_window) {
        // Frame is not an HTML frame.
        continue;
      }

      CComPtr<IHTMLDocument2> frame_doc;
      hr = frame_window->get_document(&frame_doc);

      if (frame_doc.IsEqualObject(owner_doc)) {
        // The document in this frame *is* this element's owner
        // document. Get the frameElement property of the document's
        // containing window (which is itself an HTML element, either
        // a frame or an iframe). Then get the x and y coordinates of
        // that frame element.
        std::wstring script_source = L"(function(){ return function() { return arguments[0].frameElement };})();";
        Script script_wrapper(frame_doc, script_source, 1);
        CComVariant window_variant(frame_window);
        script_wrapper.AddArgument(window_variant);
        script_wrapper.Execute();
        CComQIPtr<IHTMLElement> frame_element(script_wrapper.result().pdispVal);

        // Wrap the element so we can find its location.
        Element element_wrapper(frame_element, this->containing_window_handle_);
        long frame_x, frame_y, frame_width, frame_height;
        status_code = element_wrapper.GetLocation(&frame_x,
                                                  &frame_y,
                                                  &frame_width,
                                                  &frame_height);
        if (status_code == SUCCESS) {
          *x = frame_x;
          *y = frame_y;
        }
        break;
      }
    }
  }

  return SUCCESS;
}

void Element::GetClickPoint(const long x, const long y, const long width, const long height, long* click_x, long* click_y) {
  LOG(TRACE) << "Entering Element::GetClickPoint";

  //Note: This logic is duplicated in javascript in Element::IsHiddenByOverflow
  *click_x = x + (width / 2);
  *click_y = y + (height / 2);
}

bool Element::IsClickPointInViewPort(const long x,
                                     const long y,
                                     const long width,
                                     const long height) {
  LOG(TRACE) << "Entering Element::IsClickPointInViewPort";

  long click_x, click_y;
  GetClickPoint(x, y, width, height, &click_x, &click_y);

  WINDOWINFO window_info;
  if (!::GetWindowInfo(this->containing_window_handle_, &window_info)) {
    LOG(WARN) << "Cannot determine size of window, call to GetWindowInfo API failed";
    return false;
  }

  long window_width = window_info.rcClient.right - window_info.rcClient.left;
  long window_height = window_info.rcClient.bottom - window_info.rcClient.top;

  long window_x_border = window_info.cxWindowBorders;
  long window_y_border = window_info.cyWindowBorders;
  LOG(DEBUG) << "x border: " << window_x_border << ", y border: " << window_y_border;

  // Hurrah! Now we know what the visible area of the viewport is
  // Is the element visible in the X axis?
  // N.B. There is an n-pixel sized area next to the client area border
  // where clicks are interpreted as a click on the window border, not
  // within the client area. We are assuming n == 2, but that's strictly
  // a wild guess, not based on any research.
  if (click_x < 0 || click_x >= window_width - 2) {
    LOG(WARN) << "Click X coordinate is out of element area";
    return false;
  }

  // And in the Y?
  if (click_y < 0 || click_y >= window_height - 2) {
    LOG(WARN) << "Click Y coordinate is out of element area";
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

  return SUCCESS;
}

int Element::GetParentDocument(IHTMLWindow2* parent_window,
                               IHTMLDocument2** parent_doc) {
  LOG(TRACE) << "Entering Element::GetParentDocument";

  HRESULT hr = parent_window->get_document(parent_doc);
  if (FAILED(hr)) {
    if (hr == E_ACCESSDENIED) {
      // Cross-domain documents may throw Access Denied. If so,
      // get the document through the IWebBrowser2 interface.
      CComPtr<IWebBrowser2> window_browser;
      CComQIPtr<IServiceProvider> service_provider(parent_window);
      hr = service_provider->QueryService(IID_IWebBrowserApp, &window_browser);
      if (FAILED(hr)) {
        LOGHR(WARN, hr) << "Unable to get browser, call to IServiceProvider::QueryService failed for IID_IWebBrowserApp";
        return ENOSUCHDOCUMENT;
      }
      CComQIPtr<IDispatch> parent_doc_dispatch;
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
  return SUCCESS;
}

} // namespace webdriver