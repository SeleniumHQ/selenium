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

#include "Generated/atoms.h"
#include "Generated/sizzle.h"
#include "IECommandExecutor.h"
#include "logging.h"
#include "Script.h"

namespace webdriver {

ElementFinder::ElementFinder() {
}

ElementFinder::~ElementFinder() {
}

int ElementFinder::FindElement(const IECommandExecutor& executor,
                               const ElementHandle parent_wrapper,
                               const std::wstring& mechanism,
                               const std::wstring& criteria,
                               Json::Value* found_element) {
  LOG(TRACE) << "Entering ElementFinder::FindElement";

  BrowserHandle browser;
  int status_code = executor.GetCurrentBrowser(&browser);
  if (status_code == WD_SUCCESS) {
    if (mechanism == L"css") {
      if (!this->HasNativeCssSelectorEngine(executor)) {
        LOG(DEBUG) << "Element location strategy is CSS selectors, but "
                   << "document does not support CSS selectors. Falling back "
                   << "to using the Sizzle JavaScript CSS selector engine.";
        return this->FindElementUsingSizzle(executor,
                                            parent_wrapper,
                                            criteria,
                                            found_element);
      }
    }

    LOG(DEBUG) << "Using FindElement atom to locate element having "
               << LOGWSTRING(mechanism) << " = "
               << LOGWSTRING(criteria);
    CComPtr<IHTMLDocument2> doc;
    browser->GetDocument(&doc);

    std::wstring script_source(L"(function() { return (");
    script_source += atoms::asString(atoms::FIND_ELEMENT);
    script_source += L")})();";

    Script script_wrapper(doc, script_source, 3);
    script_wrapper.AddArgument(mechanism);
    script_wrapper.AddArgument(criteria);
    if (parent_wrapper) {
      script_wrapper.AddArgument(parent_wrapper->element());
    }

    status_code = script_wrapper.Execute();
    if (status_code == WD_SUCCESS) {
      Json::Value atom_result;
      script_wrapper.ConvertResultToJsonValue(executor, &atom_result);
      int atom_status_code = atom_result["status"].asInt();
      Json::Value atom_value = atom_result["value"];
      status_code = atom_status_code;
      *found_element = atom_result["value"];
    }
    else {
      // Hitting a JavaScript error with the atom is an unrecoverable
      // error. The most common case of this for IE is when there is a
      // page refresh, navigation, or similar, and the driver is polling
      // for element presence. The calling code can't do anything about
      // it, so we might as well just log and return the "no such element"
      // error code. In the common case, this means that the error will be
      // transitory, and will sort itself out once the DOM returns to normal
      // after the page transition is completed. Note carefully that this
      // is an extreme hack, and has the potential to be papering over a
      // very serious problem in the driver.
      status_code = ENOSUCHELEMENT;
      LOG(WARN) << "A JavaScript error was encountered executing the findElement atom.";
    }
  } else {
    LOG(WARN) << "Unable to get browser";
  }
  return status_code;
}

int ElementFinder::FindElements(const IECommandExecutor& executor,
                                const ElementHandle parent_wrapper,
                                const std::wstring& mechanism,
                                const std::wstring& criteria,
                                Json::Value* found_elements) {
  LOG(TRACE) << "Entering ElementFinder::FindElements";

  BrowserHandle browser;
  int status_code = executor.GetCurrentBrowser(&browser);
  if (status_code == WD_SUCCESS) {
    if (mechanism == L"css") {
      if (!this->HasNativeCssSelectorEngine(executor)) {
        LOG(DEBUG) << "Element location strategy is CSS selectors, but "
                   << "document does not support CSS selectors. Falling back "
                   << "to using the Sizzle JavaScript CSS selector engine.";
        return this->FindElementsUsingSizzle(executor,
                                             parent_wrapper,
                                             criteria,
                                             found_elements);
      }
    }

    LOG(DEBUG) << "Using FindElements atom to locate element having "
               << LOGWSTRING(mechanism) << " = "
               << LOGWSTRING(criteria);
    CComPtr<IHTMLDocument2> doc;
    browser->GetDocument(&doc);

    std::wstring script_source(L"(function() { return (");
    script_source += atoms::asString(atoms::FIND_ELEMENTS);
    script_source += L")})();";

    Script script_wrapper(doc, script_source, 3);
    script_wrapper.AddArgument(mechanism);
    script_wrapper.AddArgument(criteria);
    if (parent_wrapper) {
      script_wrapper.AddArgument(parent_wrapper->element());
    }

    status_code = script_wrapper.Execute();
    if (status_code == WD_SUCCESS) {
      Json::Value atom_result;
      script_wrapper.ConvertResultToJsonValue(executor, &atom_result);
      int atom_status_code = atom_result["status"].asInt();
      Json::Value atom_value = atom_result["value"];
      status_code = atom_status_code;
      *found_elements = atom_result["value"];
    } else {
      // Hitting a JavaScript error with the atom is an unrecoverable
      // error. The most common case of this for IE is when there is a
      // page refresh, navigation, or similar, and the driver is polling
      // for element presence. The calling code can't do anything about
      // it, so we might as well just log and return. In the common case,
      // this means that the error will be transitory, and will sort
      // itself out once the DOM returns to normal after the page transition
      // is completed. Return an empty array, and a success error code.
      status_code = WD_SUCCESS;
      *found_elements = Json::Value(Json::arrayValue);
      LOG(WARN) << "A JavaScript error was encountered executing the findElements atom.";
    }
  } else {
    LOG(WARN) << "Unable to get browser";
  }
  return status_code;
}

int ElementFinder::FindElementUsingSizzle(const IECommandExecutor& executor,
                                          const ElementHandle parent_wrapper,
                                          const std::wstring& criteria,
                                          Json::Value* found_element) {
  LOG(TRACE) << "Entering ElementFinder::FindElementUsingSizzle";

  int result;

  BrowserHandle browser;
  result = executor.GetCurrentBrowser(&browser);
  if (result != WD_SUCCESS) {
    LOG(WARN) << "Unable to get browser";
    return result;
  }

  std::wstring script_source(L"(function() { return function(){ if (!window.Sizzle) {");
  script_source += atoms::asString(atoms::SIZZLE);
  script_source += L"}\n";
  script_source += L"var root = arguments[1] ? arguments[1] : document.documentElement;";
  script_source += L"if (root['querySelector']) { return root.querySelector(arguments[0]); } ";
  script_source += L"var results = []; Sizzle(arguments[0], root, results);";
  script_source += L"return results.length > 0 ? results[0] : null;";
  script_source += L"};})();";

  CComPtr<IHTMLDocument2> doc;
  browser->GetDocument(&doc);
  Script script_wrapper(doc, script_source, 2);
  script_wrapper.AddArgument(criteria);
  if (parent_wrapper) {
    CComPtr<IHTMLElement> parent(parent_wrapper->element());
    script_wrapper.AddArgument(parent);
  }
  result = script_wrapper.Execute();

  if (result == WD_SUCCESS) {
    if (!script_wrapper.ResultIsElement()) {
      LOG(WARN) << "Found result is not element";
      result = ENOSUCHELEMENT;
    } else {
      result = script_wrapper.ConvertResultToJsonValue(executor,
                                                       found_element);
    }
  } else {
    LOG(WARN) << "Unable to find elements";
    result = ENOSUCHELEMENT;
  }

  return result;
}

int ElementFinder::FindElementsUsingSizzle(const IECommandExecutor& executor,
                                           const ElementHandle parent_wrapper,
                                           const std::wstring& criteria,
                                           Json::Value* found_elements) {
  LOG(TRACE) << "Entering ElementFinder::FindElementsUsingSizzle";

  int result;

  if (criteria == L"") {
    // Apparently, Sizzle will happily return an empty array for an empty
    // string as the selector. We do not want this.
    return ENOSUCHELEMENT;
  }

  BrowserHandle browser;
  result = executor.GetCurrentBrowser(&browser);
  if (result != WD_SUCCESS) {
    LOG(WARN) << "Unable to get browser";
    return result;
  }

  std::wstring script_source(L"(function() { return function(){ if (!window.Sizzle) {");
  script_source += atoms::asString(atoms::SIZZLE);
  script_source += L"}\n";
  script_source += L"var root = arguments[1] ? arguments[1] : document.documentElement;";
  script_source += L"if (root['querySelectorAll']) { return root.querySelectorAll(arguments[0]); } ";
  script_source += L"var results = []; try { Sizzle(arguments[0], root, results); } catch(ex) { results = null; }";
  script_source += L"return results;";
  script_source += L"};})();";

  CComPtr<IHTMLDocument2> doc;
  browser->GetDocument(&doc);

  Script script_wrapper(doc, script_source, 2);
  script_wrapper.AddArgument(criteria);
  if (parent_wrapper) {
    // Use a copy for the parent element?
    CComPtr<IHTMLElement> parent(parent_wrapper->element());
    script_wrapper.AddArgument(parent);
  }

  result = script_wrapper.Execute();
  if (result == WD_SUCCESS) {
    CComVariant snapshot = script_wrapper.result();
    if (snapshot.vt == VT_NULL || snapshot.vt == VT_EMPTY) {
      // We explicitly caught an error from Sizzle. Return ENOSUCHELEMENT.
      return ENOSUCHELEMENT;
    }
    std::wstring get_element_count_script = L"(function(){return function() {return arguments[0].length;}})();";
    Script get_element_count_script_wrapper(doc, get_element_count_script, 1);
    get_element_count_script_wrapper.AddArgument(snapshot);
    result = get_element_count_script_wrapper.Execute();
    if (result == WD_SUCCESS) {
      *found_elements = Json::Value(Json::arrayValue);
      if (!get_element_count_script_wrapper.ResultIsInteger()) {
        LOG(WARN) << "Found elements count is not integer";
        result = EUNEXPECTEDJSERROR;
      } else {
        long length = get_element_count_script_wrapper.result().lVal;
        std::wstring get_next_element_script = L"(function(){return function() {return arguments[0][arguments[1]];}})();";
        for (long i = 0; i < length; ++i) {
          Script get_element_script_wrapper(doc, get_next_element_script, 2);
          get_element_script_wrapper.AddArgument(snapshot);
          get_element_script_wrapper.AddArgument(i);
          result = get_element_script_wrapper.Execute();
          if (result == WD_SUCCESS) {
            Json::Value json_element;
            get_element_script_wrapper.ConvertResultToJsonValue(executor,
                                                            &json_element);
            found_elements->append(json_element);
          } else {
            LOG(WARN) << "Unable to get " << i << " found element";
          }
        }
      }
    } else {
      LOG(WARN) << "Unable to get count of found elements";
      result = EUNEXPECTEDJSERROR;
    }

  } else {
    LOG(WARN) << "Execution returned error";
  }

  return result;
}

bool ElementFinder::HasNativeCssSelectorEngine(const IECommandExecutor& executor) {
  LOG(TRACE) << "Entering ElementFinder::HasNativeCssSelectorEngine";

  BrowserHandle browser;
  executor.GetCurrentBrowser(&browser);

  std::wstring script_source(L"(function() { return function(){");
  script_source += L"var root = document.documentElement;";
  script_source += L"if (root['querySelectorAll']) { return true; } ";
  script_source += L"return false;";
  script_source += L"};})();";

  CComPtr<IHTMLDocument2> doc;
  browser->GetDocument(&doc);

  Script script_wrapper(doc, script_source, 0);
  script_wrapper.Execute();
  return script_wrapper.result().boolVal == VARIANT_TRUE;
}

} // namespace webdriver