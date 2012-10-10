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

#include "Generated/atoms.h"
#include "Generated/sizzle.h"
#include "IECommandExecutor.h"
#include "logging.h"

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
  if (status_code == SUCCESS) {
    if (mechanism == L"css") {
      return this->FindElementByCssSelector(executor,
                                            parent_wrapper,
                                            criteria,
                                            found_element);
    } else {
      std::wstring sanitized_criteria = criteria;
      this->SanitizeCriteria(mechanism, &sanitized_criteria);
      std::wstring criteria_object_script = L"(function() { return function(){ return  { \"" + 
                                            mechanism + 
                                            L"\" : \"" +
                                            sanitized_criteria + L"\" }; };})();";
      CComPtr<IHTMLDocument2> doc;
      browser->GetDocument(&doc);

      Script criteria_wrapper(doc, criteria_object_script, 0);
      status_code = criteria_wrapper.Execute();
      if (status_code == SUCCESS) {
        CComVariant criteria_object;
        HRESULT hr = ::VariantCopy(&criteria_object,
                                   &criteria_wrapper.result());

        // The atom is just the definition of an anonymous
        // function: "function() {...}"; Wrap it in another function so we can
        // invoke it with our arguments without polluting the current namespace.
        std::wstring script_source(L"(function() { return (");
        script_source += atoms::asString(atoms::FIND_ELEMENT);
        script_source += L")})();";

        Script script_wrapper(doc, script_source, 2);
        script_wrapper.AddArgument(criteria_object);
        if (parent_wrapper) {
          script_wrapper.AddArgument(parent_wrapper->element());
        }

        status_code = script_wrapper.Execute();
        if (status_code == SUCCESS) {
          if (script_wrapper.ResultIsElement()) {
            script_wrapper.ConvertResultToJsonValue(executor, found_element);
          } else {
            LOG(WARN) << "Unable to find element by mechanism "
                      << LOGWSTRING(mechanism.c_str()) << " and criteria " 
                      << LOGWSTRING(sanitized_criteria.c_str());
            status_code = ENOSUCHELEMENT;
          }
        } else {
          // An error in the execution of the FindElement atom for XPath is assumed
          // to be a syntactically invalid XPath.
          if (mechanism == L"xpath") {
            LOG(WARN) << "Attempted to find element using invalid xpath: "
                      << LOGWSTRING(sanitized_criteria.c_str());
            status_code = EINVALIDSELECTOR;
          } else {
            LOG(WARN) << "Unexpected error attempting to find element by mechanism "
                      << LOGWSTRING(mechanism.c_str()) << " with criteria "
                      << LOGWSTRING(sanitized_criteria.c_str());
            status_code = ENOSUCHELEMENT;
          }
        }
      } else {
        LOG(WARN) << "Unable to create criteria object for mechanism "
                  << LOGWSTRING(mechanism.c_str()) << " and criteria " 
                  << LOGWSTRING(sanitized_criteria.c_str());
        status_code = ENOSUCHELEMENT;
      }
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
  if (status_code == SUCCESS) {
    if (mechanism == L"css") {
      return this->FindElementsByCssSelector(executor,
                                             parent_wrapper,
                                             criteria,
                                             found_elements);
    } else {
      std::wstring sanitized_criteria = criteria;
      this->SanitizeCriteria(mechanism, &sanitized_criteria);
      std::wstring criteria_object_script = L"(function() { return function(){ return  { \"" + mechanism + L"\" : \"" + sanitized_criteria + L"\" }; };})();";
      CComPtr<IHTMLDocument2> doc;
      browser->GetDocument(&doc);

      Script criteria_wrapper(doc, criteria_object_script, 0);
      status_code = criteria_wrapper.Execute();
      if (status_code == SUCCESS) {
        CComVariant criteria_object;
        HRESULT hr = ::VariantCopy(&criteria_object,
                                   &criteria_wrapper.result());

        // The atom is just the definition of an anonymous
        // function: "function() {...}"; Wrap it in another function so we can
        // invoke it with our arguments without polluting the current namespace.
        std::wstring script_source(L"(function() { return (");
        script_source += atoms::asString(atoms::FIND_ELEMENTS);
        script_source += L")})();";

        Script script_wrapper(doc, script_source, 2);
        script_wrapper.AddArgument(criteria_object);
        if (parent_wrapper) {
          script_wrapper.AddArgument(parent_wrapper->element());
        }

        status_code = script_wrapper.Execute();
        if (status_code == SUCCESS) {
          if (script_wrapper.ResultIsArray() || 
              script_wrapper.ResultIsElementCollection()) {
            script_wrapper.ConvertResultToJsonValue(executor, found_elements);
          } else {
            LOG(WARN) << "Returned value is not an array or element collection";
            status_code = ENOSUCHELEMENT;
          }
        } else {
          // An error in the execution of the FindElement atom for XPath is assumed
          // to be a syntactically invalid XPath.
          if (mechanism == L"xpath") {
            LOG(WARN) << "Attempted to find elements using invalid xpath: "
                      << LOGWSTRING(sanitized_criteria.c_str());
            status_code = EINVALIDSELECTOR;
          } else {
            LOG(WARN) << "Unexpected error attempting to find element by mechanism "
                      << LOGWSTRING(mechanism.c_str()) << " and criteria "
                      << LOGWSTRING(sanitized_criteria.c_str());
            status_code = ENOSUCHELEMENT;
          }
        }
      } else {
        LOG(WARN) << "Unable to create criteria object for mechanism "
                  << LOGWSTRING(mechanism.c_str()) << " and criteria "
                  << LOGWSTRING(sanitized_criteria.c_str());
        status_code = ENOSUCHELEMENT;
      }
    }
  } else {
    LOG(WARN) << "Unable to get browser";
  }
  return status_code;
}

int ElementFinder::FindElementByCssSelector(const IECommandExecutor& executor,
                                            const ElementHandle parent_wrapper,
                                            const std::wstring& criteria,
                                            Json::Value* found_element) {
  LOG(TRACE) << "Entering ElementFinder::FindElementByCssSelector";

  int result;

  BrowserHandle browser;
  result = executor.GetCurrentBrowser(&browser);
  if (result != SUCCESS) {
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
    IHTMLElement* parent_element_copy;
    HRESULT hr = parent.CopyTo(&parent_element_copy);
    script_wrapper.AddArgument(parent_element_copy);
  }
  result = script_wrapper.Execute();

  if (result == SUCCESS) {
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

int ElementFinder::FindElementsByCssSelector(const IECommandExecutor& executor,
                                             const ElementHandle parent_wrapper,
                                             const std::wstring& criteria,
                                             Json::Value* found_elements) {
  LOG(TRACE) << "Entering ElementFinder::FindElementsByCssSelector";

  int result;

  BrowserHandle browser;
  result = executor.GetCurrentBrowser(&browser);
  if (result != SUCCESS) {
    LOG(WARN) << "Unable to get browser";
    return result;
  }

  std::wstring script_source(L"(function() { return function(){ if (!window.Sizzle) {");
  script_source += atoms::asString(atoms::SIZZLE);
  script_source += L"}\n";
  script_source += L"var root = arguments[1] ? arguments[1] : document.documentElement;";
  script_source += L"if (root['querySelectorAll']) { return root.querySelectorAll(arguments[0]); } ";
  script_source += L"var results = []; Sizzle(arguments[0], root, results);";
  script_source += L"return results;";
  script_source += L"};})();";

  CComPtr<IHTMLDocument2> doc;
  browser->GetDocument(&doc);

  Script script_wrapper(doc, script_source, 2);
  script_wrapper.AddArgument(criteria);
  if (parent_wrapper) {
    // Use a copy for the parent element?
    CComPtr<IHTMLElement> parent(parent_wrapper->element());
    IHTMLElement* parent_element_copy;
    HRESULT hr = parent.CopyTo(&parent_element_copy);
    script_wrapper.AddArgument(parent_element_copy);
  }

  result = script_wrapper.Execute();
  if (result == SUCCESS) {

    CComVariant snapshot = script_wrapper.result();

    std::wstring get_element_count_script = L"(function(){return function() {return arguments[0].length;}})();";
    Script get_element_count_script_wrapper(doc, get_element_count_script, 1);
    get_element_count_script_wrapper.AddArgument(snapshot);
    result = get_element_count_script_wrapper.Execute();
    if (result == SUCCESS) {
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
          if (result == SUCCESS) {
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

void ElementFinder::SanitizeCriteria(const std::wstring& mechanism,
                                     std::wstring* criteria) {
  LOG(TRACE) << "Entering ElementFinder::SanitizeCriteria";

  // Any finder mechanism where the value can have embedded quotation
  // marks needs to have those quotes escaped for calling into JavaScript.
  if (mechanism == L"linkText" || 
      mechanism == L"partialLinkText" || 
      mechanism == L"xpath") {
    this->ReplaceAllSubstrings(L"\\", L"\\\\", criteria);
    this->ReplaceAllSubstrings(L"\"", L"\\\"", criteria);
  }
}

void ElementFinder::ReplaceAllSubstrings(const std::wstring& to_replace,
                                         const std::wstring& replace_with,
                                         std::wstring* str) {
  LOG(TRACE) << "Entering ElementFinder::ReplaceAllSubstrings";

  size_t pos = str->find(to_replace);
  while (pos != std::wstring::npos) {
    str->replace(pos, to_replace.length(), replace_with);
    pos = str->find(to_replace, pos + replace_with.length());
  }
}

} // namespace webdriver