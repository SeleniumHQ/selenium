#ifndef WEBDRIVER_IE_FINDBYCSSSELECTORELEMENTFINDER_H_
#define WEBDRIVER_IE_FINDBYCSSSELECTORELEMENTFINDER_H_

#include "Session.h"
#include "sizzle.h"

namespace webdriver {

class FindByCssSelectorElementFinder : public ElementFinder {
public:
	FindByCssSelectorElementFinder(std::wstring locator) : ElementFinder(locator) {
	}

	virtual ~FindByCssSelectorElementFinder(void) {
	}

	int FindByCssSelectorElementFinder::FindElement(Session* session, ElementHandle parent_wrapper, const std::wstring& criteria, Json::Value *found_element) {
		int result = ENOSUCHELEMENT;

		BrowserHandle browser;
		result = session->GetCurrentBrowser(&browser);
		if (result != SUCCESS) {
			return result;
		}

		std::wstring script_source(L"(function() { return function(){");
		script_source += atoms::SIZZLE;
		script_source += L"\n";
		script_source += L"var root = arguments[1] ? arguments[1] : document.documentElement;";
		script_source += L"if (root['querySelector']) { return root.querySelector(arguments[0]); } ";
		script_source += L"var results = []; Sizzle(arguments[0], root, results);";
		script_source += L"return results.length > 0 ? results[0] : null;";
		script_source += L"};})();";

		CComPtr<IHTMLDocument2> doc;
		browser->GetDocument(&doc);
		ScriptWrapper script_wrapper(doc, script_source, 2);
		script_wrapper.AddArgument(criteria);
		if (parent_wrapper) {
			CComPtr<IHTMLElement> parent(parent_wrapper->element());
			IHTMLElement* parent_element_copy;
			parent.CopyTo(&parent_element_copy);
			script_wrapper.AddArgument(parent_element_copy);
		}
		result = script_wrapper.Execute();

		if (result == SUCCESS) {
			if (!script_wrapper.ResultIsElement()) {
				result = ENOSUCHELEMENT;
			} else {
				result = script_wrapper.ConvertResultToJsonValue(session, found_element);
			}
		}

		return result;
	}

	int FindByCssSelectorElementFinder::FindElements(Session* session, ElementHandle parent_wrapper, const std::wstring& criteria, Json::Value *found_elements) {
		int result = ENOSUCHELEMENT;

		BrowserHandle browser;
		result = session->GetCurrentBrowser(&browser);
		if (result != SUCCESS) {
			return result;
		}

		std::wstring script_source(L"(function() { return function(){");
		script_source += atoms::SIZZLE;
		script_source += L"\n";
		script_source += L"var root = arguments[1] ? arguments[1] : document.documentElement;";
		script_source += L"if (root['querySelectorAll']) { return root.querySelectorAll(arguments[0]); } ";
		script_source += L"var results = []; Sizzle(arguments[0], root, results);";
		script_source += L"return results;";
		script_source += L"};})();";

		CComPtr<IHTMLDocument2> doc;
		browser->GetDocument(&doc);

		ScriptWrapper script_wrapper(doc, script_source, 2);
		script_wrapper.AddArgument(criteria);
		if (parent_wrapper) {
			// Use a copy for the parent element?
			CComPtr<IHTMLElement> parent(parent_wrapper->element());
			IHTMLElement* parent_element_copy;
			parent.CopyTo(&parent_element_copy);
			script_wrapper.AddArgument(parent_element_copy);
		}

		result = script_wrapper.Execute();
		CComVariant snapshot = script_wrapper.result();

		std::wstring get_element_count_script = L"(function(){return function() {return arguments[0].length;}})();";
		ScriptWrapper get_element_count_script_wrapper(doc, get_element_count_script, 1);
		get_element_count_script_wrapper.AddArgument(snapshot);
		result = get_element_count_script_wrapper.Execute();
		if (result == SUCCESS) {
			if (!get_element_count_script_wrapper.ResultIsInteger()) {
				result = EUNEXPECTEDJSERROR;
			} else {
				long length = get_element_count_script_wrapper.result().lVal;
				std::wstring get_next_element_script = L"(function(){return function() {return arguments[0][arguments[1]];}})();";
				for (long i = 0; i < length; ++i) {
					ScriptWrapper get_element_script_wrapper(doc, get_next_element_script, 2);
					get_element_script_wrapper.AddArgument(snapshot);
					get_element_script_wrapper.AddArgument(i);
					result = get_element_script_wrapper.Execute();
					Json::Value json_element;
					get_element_script_wrapper.ConvertResultToJsonValue(session, &json_element);
					found_elements->append(json_element);
				}
			}
		}

		return result;
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_FINDBYCSSSELECTORELEMENTFINDER_H_
