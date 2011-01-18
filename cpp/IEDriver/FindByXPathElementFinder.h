#ifndef WEBDRIVER_IE_FINDBYXPATHELEMENTFINDER_H_
#define WEBDRIVER_IE_FINDBYXPATHELEMENTFINDER_H_

#include "BrowserManager.h"
#include "jsxpath.h"

namespace webdriver {

class FindByXPathElementFinder : public ElementFinder {
public:
	FindByXPathElementFinder(std::wstring locator) : ElementFinder(locator) {
	}

	virtual ~FindByXPathElementFinder(void) {
	}

	int FindByXPathElementFinder::FindElement(BrowserManager *manager, ElementWrapper *parent_wrapper, std::wstring criteria, Json::Value *found_element) {
		int result = ENOSUCHELEMENT;

		BrowserWrapper *browser;
		result = manager->GetCurrentBrowser(&browser);
		if (result != SUCCESS) {
			return result;
		}

		result = this->InjectXPathEngine(browser);
		// TODO(simon): Why does the injecting sometimes fail?
		if (result != SUCCESS) {
			return result;
		}

		// Call it
		std::wstring query;
		if (parent_wrapper) {
			query += L"(function() { return function(){var res = document.__webdriver_evaluate(arguments[0], arguments[1], null, 7, null); return res.snapshotItem(0) ;};})();";
		} else {
			query += L"(function() { return function(){var res = document.__webdriver_evaluate(arguments[0], document, null, 7, null); return res.snapshotLength != 0 ? res.snapshotItem(0) : undefined ;};})();";
		}

		ScriptWrapper *script_wrapper = new ScriptWrapper(query, 2);
		script_wrapper->AddArgument(criteria);
		if (parent_wrapper) {
			CComPtr<IHTMLElement> parent(parent_wrapper->element());
			IHTMLElement* parent_element_copy;
			parent.CopyTo(&parent_element_copy);
			script_wrapper->AddArgument(parent_element_copy);
		}
		result = browser->ExecuteScript(script_wrapper);

		if (result == SUCCESS) {
			if (!script_wrapper->ResultIsElement()) {
				result = ENOSUCHELEMENT;
			} else {
				result = script_wrapper->ConvertResultToJsonValue(manager, found_element);
			}
		}
		delete script_wrapper;

		return result;
	}

	int FindByXPathElementFinder::FindElements(BrowserManager *manager, ElementWrapper *parent_wrapper, std::wstring criteria, Json::Value *found_elements) {
		int result = ENOSUCHELEMENT;

		BrowserWrapper *browser;
		result = manager->GetCurrentBrowser(&browser);
		if (result != SUCCESS) {
			return result;
		}
		result = this->InjectXPathEngine(browser);
		// TODO(simon): Why does the injecting sometimes fail?
		if (result != SUCCESS) {
			return result;
		}

		// Call it
		std::wstring query;
		if (parent_wrapper) {
			query += L"(function() { return function() {var res = document.__webdriver_evaluate(arguments[0], arguments[1], null, 7, null); return res;};})();";
		} else {
			query += L"(function() { return function() {var res = document.__webdriver_evaluate(arguments[0], document, null, 7, null); return res;};})();";
		}

		ScriptWrapper *script_wrapper = new ScriptWrapper(query, 2);
		script_wrapper->AddArgument(criteria);
		if (parent_wrapper) {
			// Use a copy for the parent element?
			CComPtr<IHTMLElement> parent(parent_wrapper->element());
			IHTMLElement* parent_element_copy;
			parent.CopyTo(&parent_element_copy);
			script_wrapper->AddArgument(parent_element_copy);
		}

		result = browser->ExecuteScript(script_wrapper);
		CComVariant snapshot = script_wrapper->result();

		std::wstring get_element_count_script = L"(function(){return function() {return arguments[0].snapshotLength;}})();";
		ScriptWrapper *get_element_count_script_wrapper = new ScriptWrapper(get_element_count_script, 1);
		get_element_count_script_wrapper->AddArgument(snapshot);
		result = browser->ExecuteScript(get_element_count_script_wrapper);
		if (result == SUCCESS) {
			if (!get_element_count_script_wrapper->ResultIsInteger()) {
				result = EUNEXPECTEDJSERROR;
			} else {
				long length = get_element_count_script_wrapper->result().lVal;
				std::wstring get_next_element_script(L"(function(){return function() {return arguments[0].iterateNext();}})();");
				for (long i = 0; i < length; ++i) {
					ScriptWrapper *get_element_script_wrapper = new	ScriptWrapper(get_next_element_script, 2);
					get_element_script_wrapper->AddArgument(snapshot);
					get_element_script_wrapper->AddArgument(i);
					result = browser->ExecuteScript(get_element_script_wrapper);
					Json::Value json_element;
					get_element_script_wrapper->ConvertResultToJsonValue(manager, &json_element);
					found_elements->append(json_element);
					delete get_element_script_wrapper;
				}
			}
		}

		delete get_element_count_script_wrapper;
		delete script_wrapper;

		return result;
	}

private:
	int FindByXPathElementFinder::InjectXPathEngine(BrowserWrapper *browser_wrapper) 
	{
		// Inject the XPath engine
		std::wstring script;
		for (int i = 0; XPATHJS[i]; i++) {
			script += XPATHJS[i];
		}

		//std::string jsx(CW2A(script.c_str(), CP_UTF8));
		//std::cout << "\n\n" << jsx << "\n\n";

		ScriptWrapper *script_wrapper = new ScriptWrapper(script, 0);
		int status_code = browser_wrapper->ExecuteScript(script_wrapper);
		delete script_wrapper;

		return status_code;
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE__H_
