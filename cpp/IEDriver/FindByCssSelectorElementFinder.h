#ifndef WEBDRIVER_IE_FINDBYCSSSELECTORELEMENTFINDER_H_
#define WEBDRIVER_IE_FINDBYCSSSELECTORELEMENTFINDER_H_

#include "BrowserManager.h"
#include "sizzle.h"

namespace webdriver {

class FindByCssSelectorElementFinder : public ElementFinder {
public:
	FindByCssSelectorElementFinder(void) {
	}

	virtual ~FindByCssSelectorElementFinder(void) {
	}

protected:
	int FindByCssSelectorElementFinder::FindElementInternal(BrowserWrapper *browser, IHTMLElement *parent_element, std::wstring criteria, IHTMLElement **found_element) {
		int result = ENOSUCHELEMENT;

		std::wstring script(L"(function() { return function(){");
		for (int i = 0; SIZZLE[i]; i++) {
			script += SIZZLE[i];
			script += L"\n";
		}
		script += L"var root = arguments[1] ? arguments[1] : document.documentElement;";
		script += L"if (root['querySelector']) { return root.querySelector(arguments[0]); } ";
		script += L"var results = []; Sizzle(arguments[0], root, results);";
		script += L"return results.length > 0 ? results[0] : null;";
		script += L"};})();";

		ScriptWrapper *script_wrapper = new ScriptWrapper(script, 2);
		script_wrapper->AddArgument(criteria);
		if (parent_element) {
			CComPtr<IHTMLElement> parent(parent_element);
			IHTMLElement* parent_element_copy;
			parent.CopyTo(&parent_element_copy);
			script_wrapper->AddArgument(parent_element_copy);
		}
		result = browser->ExecuteScript(script_wrapper);

		if (result == SUCCESS) {
			if (script_wrapper->ResultIsEmpty()) {
				result = ENOSUCHELEMENT;
			} else {
				*found_element = (IHTMLElement*)script_wrapper->result().pdispVal;
			}
		}
		delete script_wrapper;

		return result;
	}

	int FindByCssSelectorElementFinder::FindElementsInternal(BrowserWrapper *browser, IHTMLElement *parent_element, std::wstring criteria, std::vector<IHTMLElement*> *found_elements)
	{
		int result = ENOSUCHELEMENT;

		std::wstring script(L"(function() { return function(){");
		for (int i = 0; SIZZLE[i]; i++) {
			script += SIZZLE[i];
			script += L"\n";
		}
		script += L"var root = arguments[1] ? arguments[1] : document.documentElement;";
		script += L"if (root['querySelectorAll']) { return root.querySelectorAll(arguments[0]); } ";
		script += L"var results = []; Sizzle(arguments[0], root, results);";
		script += L"return results;";
		script += L"};})();";

		ScriptWrapper *script_wrapper = new ScriptWrapper(script, 2);
		script_wrapper->AddArgument(criteria);
		if (parent_element) {
			// Use a copy for the parent element?
			CComPtr<IHTMLElement> parent(parent_element);
			IHTMLElement* parent_element_copy;
			parent.CopyTo(&parent_element_copy);
			script_wrapper->AddArgument(parent_element_copy);
		}

		result = browser->ExecuteScript(script_wrapper);
		CComVariant snapshot = script_wrapper->result();

		std::wstring get_element_count_script = L"(function(){return function() {return arguments[0].length;}})();";
		ScriptWrapper *get_element_count_script_wrapper = new ScriptWrapper(get_element_count_script, 1);
		get_element_count_script_wrapper->AddArgument(snapshot);
		result = browser->ExecuteScript(get_element_count_script_wrapper);
		if (result == SUCCESS) {
			if (!get_element_count_script_wrapper->ResultIsInteger()) {
				result = EUNEXPECTEDJSERROR;
			} else {
				long length = get_element_count_script_wrapper->result().lVal;
				std::wstring get_next_element_script = L"(function(){return function() {return arguments[0][arguments[1]];}})();";
				for (long i = 0; i < length; ++i) {
					ScriptWrapper *get_element_script_wrapper = new	ScriptWrapper(get_next_element_script, 2);
					get_element_script_wrapper->AddArgument(snapshot);
					get_element_script_wrapper->AddArgument(i);
					result = browser->ExecuteScript(get_element_script_wrapper);
					IHTMLElement *found_element = (IHTMLElement *)get_element_script_wrapper->result().pdispVal;
					found_elements->push_back(found_element);
					delete get_element_script_wrapper;
				}
			}
		}

		delete get_element_count_script_wrapper;
		delete script_wrapper;

		return result;
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_FINDBYCSSSELECTORELEMENTFINDER_H_
